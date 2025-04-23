
import React, { createContext, useContext, useState, useEffect } from "react";
import { hasValidSupabaseCredentials, initSupabaseSchema } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Pact, PactLog } from "@/types";
import { getPacts, getPactLogs } from "@/lib/services/pactService";

interface SupabaseContextType {
  isConfigured: boolean;
  isOfflineMode: boolean;
  isLoading: boolean;
  pacts: Pact[];
  logs: PactLog[];
  refreshData: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [logs, setLogs] = useState<PactLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase is configured
    const configured = hasValidSupabaseCredentials();
    setIsConfigured(configured);

    if (configured) {
      // Initialize database schema if needed
      initSupabaseSchema()
        .then(() => console.log("Supabase schema initialized"))
        .catch(err => console.error("Error initializing Supabase schema:", err));
    }

    // Load initial data
    refreshData();
    
    // Check for reload flag from Settings page
    const reloadNeeded = localStorage.getItem("2getherLoop_reload_needed");
    if (reloadNeeded) {
      localStorage.removeItem("2getherLoop_reload_needed");
      toast({
        title: "Settings Updated",
        description: "Supabase configuration has been updated."
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
      console.error("Error refreshing Supabase data:", error);
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
    <SupabaseContext.Provider value={{
      isConfigured,
      isOfflineMode: !isConfigured,
      isLoading,
      pacts,
      logs,
      refreshData
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};
