
import React, { createContext, useContext, useState, useEffect } from "react";
import { isFirebaseConfigured, isOfflineMode } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Pact, PactLog } from "@/types";
import { getPacts, getPactLogs } from "@/lib/services/pactService";

interface FirebaseContextType {
  isConfigured: boolean;
  isOfflineMode: boolean;
  isLoading: boolean;
  pacts: Pact[];
  logs: PactLog[];
  refreshData: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [logs, setLogs] = useState<PactLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Firebase is configured
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);

    // Load initial data
    refreshData();
    
    // Check for reload flag from Settings page
    const reloadNeeded = localStorage.getItem("2getherLoop_reload_needed");
    if (reloadNeeded) {
      localStorage.removeItem("2getherLoop_reload_needed");
      toast({
        title: "Settings Updated",
        description: "Firebase configuration has been updated."
      });
    }
  }, []);
  
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Get pacts and logs
      const [fetchedPacts, fetchedLogs] = await Promise.all([
        getPacts(),
        getPactLogs()
      ]);
      
      setPacts(fetchedPacts);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error refreshing Firebase data:", error);
      toast({
        title: "Error Refreshing Data",
        description: "Failed to refresh data. Using local data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      isConfigured,
      isOfflineMode: isOfflineMode(),
      isLoading,
      pacts,
      logs,
      refreshData
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};
