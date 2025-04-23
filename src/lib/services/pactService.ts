
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db, isOfflineMode } from "../firebase";
import { Pact, PactLog } from "@/types";

const PACTS_COLLECTION = "pacts";
const LOGS_COLLECTION = "pact_logs";

// Check if using offline mode
const useLocalStorage = () => isOfflineMode();

// Get all pacts
export const getPacts = async (): Promise<Pact[]> => {
  if (useLocalStorage()) {
    // Fallback to local storage when offline
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    return storedPacts ? JSON.parse(storedPacts) : [];
  }

  try {
    const pactsRef = collection(db, PACTS_COLLECTION);
    const snapshot = await getDocs(pactsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pact));
  } catch (error) {
    console.error("Error getting pacts:", error);
    
    // Fallback to local storage when Firebase fails
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    return storedPacts ? JSON.parse(storedPacts) : [];
  }
};

// Get a specific pact by ID
export const getPactById = async (pactId: string): Promise<Pact | null> => {
  if (useLocalStorage()) {
    // Fallback to local storage when offline
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    const pacts = storedPacts ? JSON.parse(storedPacts) as Pact[] : [];
    return pacts.find(p => p.id === pactId) || null;
  }

  try {
    const pactRef = doc(db, PACTS_COLLECTION, pactId);
    const pactDoc = await getDoc(pactRef);
    
    if (pactDoc.exists()) {
      return { 
        id: pactDoc.id, 
        ...pactDoc.data() 
      } as Pact;
    }
    return null;
  } catch (error) {
    console.error("Error getting pact by ID:", error);
    
    // Fallback to local storage when Firebase fails
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    const pacts = storedPacts ? JSON.parse(storedPacts) as Pact[] : [];
    return pacts.find(p => p.id === pactId) || null;
  }
};

// Add a new pact
export const addPact = async (pact: Omit<Pact, "id">): Promise<Pact> => {
  // Generate an ID if using local storage
  const newPact = {
    ...pact,
    id: `pact_${Date.now()}`
  } as Pact;

  // Always update local storage
  const storedPacts = localStorage.getItem("2getherLoop_pacts");
  const pacts = storedPacts ? JSON.parse(storedPacts) as Pact[] : [];
  localStorage.setItem("2getherLoop_pacts", JSON.stringify([...pacts, newPact]));

  if (useLocalStorage()) {
    return newPact;
  }

  try {
    const pactsRef = collection(db, PACTS_COLLECTION);
    const docRef = await addDoc(pactsRef, pact);
    return {
      ...pact,
      id: docRef.id
    } as Pact;
  } catch (error) {
    console.error("Error adding pact:", error);
    return newPact; // Return the locally created pact as fallback
  }
};

// Update a pact
export const updatePact = async (pact: Pact): Promise<void> => {
  // Always update local storage
  const storedPacts = localStorage.getItem("2getherLoop_pacts");
  const pacts = storedPacts ? JSON.parse(storedPacts) as Pact[] : [];
  const updatedPacts = pacts.map(p => p.id === pact.id ? pact : p);
  localStorage.setItem("2getherLoop_pacts", JSON.stringify(updatedPacts));

  if (useLocalStorage()) {
    return;
  }

  try {
    const { id, ...pactData } = pact;
    const pactRef = doc(db, PACTS_COLLECTION, id);
    await updateDoc(pactRef, pactData);
  } catch (error) {
    console.error("Error updating pact:", error);
  }
};

// Delete a pact
export const deletePact = async (pactId: string): Promise<void> => {
  // Always update local storage
  const storedPacts = localStorage.getItem("2getherLoop_pacts");
  const pacts = storedPacts ? JSON.parse(storedPacts) as Pact[] : [];
  const filteredPacts = pacts.filter(p => p.id !== pactId);
  localStorage.setItem("2getherLoop_pacts", JSON.stringify(filteredPacts));

  // Also remove related logs
  const storedLogs = localStorage.getItem("2getherLoop_completions");
  const logs = storedLogs ? JSON.parse(storedLogs) as PactLog[] : [];
  const filteredLogs = logs.filter(log => log.pactId !== pactId);
  localStorage.setItem("2getherLoop_completions", JSON.stringify(filteredLogs));

  if (useLocalStorage()) {
    return;
  }

  try {
    // Delete the pact
    const pactRef = doc(db, PACTS_COLLECTION, pactId);
    await deleteDoc(pactRef);
    
    // Delete related logs
    const logsRef = collection(db, LOGS_COLLECTION);
    const q = query(logsRef, where("pactId", "==", pactId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting pact:", error);
  }
};

// Get all pact logs
export const getPactLogs = async (): Promise<PactLog[]> => {
  if (useLocalStorage()) {
    // Fallback to local storage when offline
    const storedLogs = localStorage.getItem("2getherLoop_completions");
    return storedLogs ? JSON.parse(storedLogs) : [];
  }

  try {
    const logsRef = collection(db, LOGS_COLLECTION);
    const snapshot = await getDocs(logsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PactLog));
  } catch (error) {
    console.error("Error getting pact logs:", error);
    
    // Fallback to local storage when Firebase fails
    const storedLogs = localStorage.getItem("2getherLoop_completions");
    return storedLogs ? JSON.parse(storedLogs) : [];
  }
};

// Add a pact log (completion or failure)
export const addPactLog = async (log: Omit<PactLog, "id">): Promise<PactLog> => {
  // Generate an ID if using local storage
  const newLog = {
    ...log,
    id: `log_${Date.now()}`
  } as PactLog;

  // Always update local storage
  const storedLogs = localStorage.getItem("2getherLoop_completions");
  const logs = storedLogs ? JSON.parse(storedLogs) as PactLog[] : [];
  localStorage.setItem("2getherLoop_completions", JSON.stringify([...logs, newLog]));

  if (useLocalStorage()) {
    return newLog;
  }

  try {
    const logsRef = collection(db, LOGS_COLLECTION);
    const docRef = await addDoc(logsRef, log);
    return {
      ...log,
      id: docRef.id
    } as PactLog;
  } catch (error) {
    console.error("Error adding pact log:", error);
    return newLog; // Return the locally created log as fallback
  }
};

// Upload proof image (in a real app, this would use Firebase Storage)
export const uploadProofImage = async (file: File): Promise<string> => {
  if (useLocalStorage()) {
    // In real app, this would be handled differently
    // For now, just return a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  // In a real app, this would upload to Firebase Storage
  // For now, just return a data URL for the demo
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};
