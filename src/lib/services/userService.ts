
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { db, isOfflineMode } from "../firebase";
import { User } from "@/types";

const USERS_COLLECTION = "users";

// Check if using offline mode
const useLocalStorage = () => isOfflineMode();

// Get all users
export const getUsers = async (): Promise<User[]> => {
  if (useLocalStorage()) {
    // Fallback to local storage when offline
    const storedUsers = localStorage.getItem("2getherLoop_users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error("Error getting users:", error);
    
    // Fallback to local storage when Firebase fails
    const storedUsers = localStorage.getItem("2getherLoop_users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  }
};

// Get a specific user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  if (useLocalStorage()) {
    // Fallback to local storage when offline
    const storedUsers = localStorage.getItem("2getherLoop_users");
    const users = storedUsers ? JSON.parse(storedUsers) as User[] : [];
    return users.find(u => u.id === userId) || null;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    
    // Fallback to local storage when Firebase fails
    const storedUsers = localStorage.getItem("2getherLoop_users");
    const users = storedUsers ? JSON.parse(storedUsers) as User[] : [];
    return users.find(u => u.id === userId) || null;
  }
};

// Create or update a user
export const setUser = async (user: User): Promise<void> => {
  // Always update local storage
  const storedUsers = localStorage.getItem("2getherLoop_users");
  const users = storedUsers ? JSON.parse(storedUsers) as User[] : [];
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));

  if (useLocalStorage()) {
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error("Error setting user:", error);
  }
};

// Find a couple by code
export const findCoupleByCode = async (code: string): Promise<string | null> => {
  if (useLocalStorage()) {
    return localStorage.getItem("2getherLoop_couple_code") === code ? "local-couple-id" : null;
  }

  try {
    const couplesRef = collection(db, "couples");
    const q = query(couplesRef, where("code", "==", code));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error finding couple by code:", error);
    return null;
  }
};

// Create a couple pairing
export const createCouplePairing = async (userId: string, partnerUserId: string): Promise<string> => {
  if (useLocalStorage()) {
    const pairingId = `${userId}_${partnerUserId}`;
    localStorage.setItem("2getherLoop_couple_pairing", pairingId);
    return pairingId;
  }

  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const coupleRef = doc(collection(db, "couples"));
    await setDoc(coupleRef, {
      userIds: [userId, partnerUserId],
      code,
      createdAt: new Date().toISOString()
    });
    
    return coupleRef.id;
  } catch (error) {
    console.error("Error creating couple pairing:", error);
    return "";
  }
};
