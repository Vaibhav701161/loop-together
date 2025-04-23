import { Pact, PactLog } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { 
  supabase, 
  hasValidSupabaseCredentials, 
  saveData, 
  fetchData, 
  deleteData,
  uploadProofImage
} from "../supabase";

const PACTS_TABLE = "pacts";
const LOGS_TABLE = "pact_logs";
const PACTS_STORAGE_KEY = "2getherLoop_pacts";
const LOGS_STORAGE_KEY = "2getherLoop_completions";

// Check if Supabase is properly configured
const useLocalStorage = () => !hasValidSupabaseCredentials();

// Get all pacts
export const getPacts = async (): Promise<Pact[]> => {
  return await fetchData<Pact>(PACTS_TABLE, PACTS_STORAGE_KEY);
};

// Get a specific pact by ID
export const getPactById = async (pactId: string): Promise<Pact | null> => {
  const pacts = await getPacts();
  return pacts.find(p => p.id === pactId) || null;
};

// Add a new pact
export const addPact = async (pact: Omit<Pact, "id">): Promise<Pact> => {
  const newPact: Pact = {
    ...pact,
    id: uuidv4(),
    createdAt: pact.createdAt || new Date().toISOString(),
    startDate: pact.startDate || new Date().toISOString().split('T')[0]
  };
  
  return await saveData(PACTS_TABLE, newPact, PACTS_STORAGE_KEY);
};

// Update a pact
export const updatePact = async (pact: Pact): Promise<void> => {
  await saveData(PACTS_TABLE, pact, PACTS_STORAGE_KEY);
};

// Delete a pact
export const deletePact = async (pactId: string): Promise<void> => {
  // Delete the pact
  await deleteData(PACTS_TABLE, pactId, PACTS_STORAGE_KEY);
  
  // Delete related logs
  const logs = await getPactLogs();
  const relatedLogs = logs.filter(log => log.pactId === pactId);
  
  for (const log of relatedLogs) {
    await deleteData(LOGS_TABLE, log.id, LOGS_STORAGE_KEY);
  }
};

// Get all pact logs
export const getPactLogs = async (): Promise<PactLog[]> => {
  return await fetchData<PactLog>(LOGS_TABLE, LOGS_STORAGE_KEY);
};

// Add a pact log (completion or failure)
export const addPactLog = async (log: Omit<PactLog, "id">): Promise<PactLog> => {
  const newLog: PactLog = {
    ...log,
    id: uuidv4()
  };
  
  return await saveData(LOGS_TABLE, newLog, LOGS_STORAGE_KEY);
};

// Add or update a pact completion log
export const addPactCompletion = async (data: {
  pactId: string;
  userId: string;
  status: "completed" | "failed";
  proofType?: "text" | "image" | "checkbox";
  proofUrl?: string;
  note?: string;
}): Promise<PactLog> => {
  const newLog: PactLog = {
    id: uuidv4(),
    pactId: data.pactId,
    userId: data.userId,
    date: new Date().toISOString().split('T')[0],
    completedAt: new Date().toISOString(),
    status: data.status,
    proofType: data.proofType,
    proofUrl: data.proofUrl,
    note: data.note
  };

  if (hasValidSupabaseCredentials()) {
    try {
      const { error } = await supabase.from('pact_logs').insert(newLog);
      if (error) throw error;
    } catch (error) {
      console.error("Error saving completion to Supabase:", error);
      // Fall back to local storage
      return await saveData('pact_logs', newLog, '2getherLoop_completions');
    }
  }

  // If no Supabase or if it failed, save to localStorage
  return await saveData('pact_logs', newLog, '2getherLoop_completions');
};

// Upload proof image for pact completion
export const uploadProofImageForPact = async (file: File): Promise<string> => {
  return await uploadProofImage(file);
};

// Upload proof image
export const uploadProofImage = async (file: File): Promise<string> => {
  // Return data URL for local storage mode
  if (useLocalStorage()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // Upload to Supabase Storage
  try {
    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('proofs')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('proofs')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    
    // Fallback to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};
