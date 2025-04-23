
import { User } from "@/types";
import { supabase, saveData, fetchData, hasValidSupabaseCredentials } from "../supabase";

const USERS_TABLE = "users";
const USERS_STORAGE_KEY = "2getherLoop_users";

// Get all users
export const getUsers = async (): Promise<User[]> => {
  return await fetchData<User>(USERS_TABLE, USERS_STORAGE_KEY);
};

// Create or update a user
export const saveUser = async (user: User): Promise<User> => {
  return await saveData<User>(USERS_TABLE, user, USERS_STORAGE_KEY);
};

// Create or update multiple users
export const saveUsers = async (users: User[]): Promise<User[]> => {
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("Invalid users array");
  }
  
  // Always update localStorage as fallback
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  // Try to save to Supabase if configured
  if (hasValidSupabaseCredentials()) {
    try {
      // First clear existing users
      await supabase.from(USERS_TABLE).delete().neq("id", "dummy_id");
      
      // Then insert new users
      const { error } = await supabase.from(USERS_TABLE).insert(users);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving users to Supabase:", error);
      // We still return the users since they're saved to localStorage
    }
  }
  
  return users;
};

// Initialize default users if none exist
export const initializeDefaultUsers = async (): Promise<User[]> => {
  const defaultUsers: User[] = [
    { id: "user_a", name: "Person A" },
    { id: "user_b", name: "Person B" }
  ];
  
  const existingUsers = await getUsers();
  
  if (existingUsers.length === 0) {
    return await saveUsers(defaultUsers);
  }
  
  return existingUsers;
};
