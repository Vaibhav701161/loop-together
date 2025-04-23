
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  activeUser: User | null;
  users: User[];
  login: (userId: User["id"]) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUsers: (updatedUsers: User[]) => void;
  switchUser: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  // Load users from Supabase or fallback to localStorage
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        // Attempt to fetch users from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          setUsers(data);
          
          // Check for active user
          const storedActiveUserId = localStorage.getItem("2getherLoop_activeUser");
          if (storedActiveUserId && data.some(u => u.id === storedActiveUserId)) {
            const user = data.find(u => u.id === storedActiveUserId);
            if (user) {
              setActiveUser(user);
              setIsLoggedIn(true);
            }
          }
          
          // Save to local storage as backup
          localStorage.setItem("2getherLoop_users", JSON.stringify(data));
        } else {
          // No users in DB, create default ones
          const defaultUsers: User[] = [
            { id: "user_a", name: "Person A" },
            { id: "user_b", name: "Person B" },
          ];
          
          // Insert users to Supabase
          const { error: insertError } = await supabase
            .from('users')
            .insert(defaultUsers);
            
          if (insertError) throw insertError;
          
          setUsers(defaultUsers);
          localStorage.setItem("2getherLoop_users", JSON.stringify(defaultUsers));
        }
      } catch (error) {
        console.error("Error loading users from Supabase:", error);
        setIsError(true);
        
        // Fallback to localStorage
        const storedUsers = localStorage.getItem("2getherLoop_users");
        const storedActiveUserId = localStorage.getItem("2getherLoop_activeUser");
        
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers) as User[];
          setUsers(parsedUsers);
          
          if (storedActiveUserId && parsedUsers.some(u => u.id === storedActiveUserId)) {
            const user = parsedUsers.find(u => u.id === storedActiveUserId);
            if (user) {
              setActiveUser(user);
              setIsLoggedIn(true);
            }
          }
        } else {
          // No local storage data, set default users
          const defaultUsers: User[] = [
            { id: "user_a", name: "Person A" },
            { id: "user_b", name: "Person B" },
          ];
          setUsers(defaultUsers);
          localStorage.setItem("2getherLoop_users", JSON.stringify(defaultUsers));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // Save users to Supabase when they change
  useEffect(() => {
    const saveUsers = async () => {
      if (!users.length || isLoading) return;
      
      try {
        // Clear existing users
        await supabase.from('users').delete().neq('id', '0');
        
        // Insert new users
        const { error } = await supabase
          .from('users')
          .insert(users);
          
        if (error) throw error;
        
        // Update local storage
        localStorage.setItem("2getherLoop_users", JSON.stringify(users));
      } catch (error) {
        console.error("Error saving users to Supabase:", error);
        // Still update local storage
        localStorage.setItem("2getherLoop_users", JSON.stringify(users));
      }
    };
    
    saveUsers();
  }, [users, isLoading]);

  const login = async (userId: User["id"]) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      setIsLoggedIn(true);
      localStorage.setItem("2getherLoop_activeUser", userId);
      
      toast({
        title: "Logged in!",
        description: `Welcome back, ${user.name}!`,
      });
    }
  };

  const logout = () => {
    setActiveUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("2getherLoop_activeUser");
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
  };

  const updateUser = async (updatedUser: User) => {
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', updatedUser.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating user in Supabase:", error);
      toast({
        title: "Sync Error",
        description: "User updated locally but failed to sync online",
        variant: "destructive"
      });
    }
    
    if (activeUser?.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }
  };

  const updateUsers = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));
    
    try {
      // Delete all existing users
      await supabase.from('users').delete().neq('id', '0');
      
      // Insert updated users
      const { error } = await supabase
        .from('users')
        .insert(updatedUsers);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating users in Supabase:", error);
      toast({
        title: "Sync Error",
        description: "Users updated locally but failed to sync online",
        variant: "destructive"
      });
    }
    
    if (activeUser) {
      const updatedActiveUser = updatedUsers.find(u => u.id === activeUser.id);
      if (updatedActiveUser) {
        setActiveUser(updatedActiveUser);
      }
    }
  };

  const switchUser = () => {
    if (activeUser && users.length === 2) {
      const otherUserId = activeUser.id === "user_a" ? "user_b" : "user_a";
      const otherUser = users.find(u => u.id === otherUserId);
      if (otherUser) {
        setActiveUser(otherUser);
        localStorage.setItem("2getherLoop_activeUser", otherUserId);
        toast({
          title: "Switched user",
          description: `Now logged in as ${otherUser.name}`,
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      activeUser, 
      users, 
      login, 
      logout, 
      updateUser, 
      updateUsers,
      switchUser,
      isLoggedIn,
      isLoading,
      isError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
