
import React, { createContext, useContext, useState, useEffect } from "react";
import { hasValidSupabaseCredentials, initSupabaseSchema, checkSupabaseConnection, fetchData, getSupabaseClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Pact, PactLog } from "@/types";
import { getPacts, getPactLogs } from "@/lib/services/pactService";

interface SupabaseContextType {
  isConfigured: boolean;
  isOfflineMode: boolean;
  isLoading: boolean;
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'checking' | 'unconfigured';
  pacts: Pact[];
  logs: PactLog[];
  refreshData: () => Promise<void>;
  initializeSchema: () => Promise<boolean>;
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking' | 'unconfigured'>('checking');
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [logs, setLogs] = useState<PactLog[]>([]);
  const { toast } = useToast();

  // Initialize database schema
  const initializeSchema = async (): Promise<boolean> => {
    if (!hasValidSupabaseCredentials()) {
      console.log("Cannot initialize schema: No valid credentials");
      setConnectionStatus('unconfigured');
      return false;
    }

    try {
      setConnectionStatus('checking');
      // Get a fresh client with latest credentials
      getSupabaseClient();
      
      // Initialize schema
      const result = await initSupabaseSchema();
      
      if (result) {
        // Check connection after schema initialization
        const isConnected = await checkSupabaseConnection();
        setIsConnected(isConnected);
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (isConnected) {
          toast({
            title: "Database Connected",
            description: "Successfully connected to the cloud database.",
          });
        }
        
        return isConnected;
      } else {
        setConnectionStatus('disconnected');
        return false;
      }
    } catch (error) {
      console.error("Error initializing Supabase schema:", error);
      setConnectionStatus('disconnected');
      return false;
    }
  };

  useEffect(() => {
    // Check if Supabase is configured
    const configured = hasValidSupabaseCredentials();
    console.log("Supabase configured status:", configured);
    setIsConfigured(configured);

    if (configured) {
      // Check connection and initialize if needed
      checkConnection();
    } else {
      setConnectionStatus('unconfigured');
      setIsLoading(false);
    }

    // Load initial data regardless of connection status
    // This ensures we have data from localStorage even if offline
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
  
  const checkConnection = async () => {
    console.log("Checking Supabase connection...");
    try {
      // Force a fresh client
      getSupabaseClient();
      
      const isConnected = await checkSupabaseConnection();
      console.log("Supabase connection status:", isConnected);
      setIsConnected(isConnected);
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        initializeSchema();
      }
    } catch (error) {
      console.error("Error checking Supabase connection:", error);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      console.log("Refreshing data...");
      // Get pacts and logs
      const [fetchedPacts, fetchedLogs] = await Promise.all([
        getPacts(),
        getPactLogs()
      ]);
      
      setPacts(fetchedPacts);
      setLogs(fetchedLogs);
      console.log("Data refreshed:", { pacts: fetchedPacts.length, logs: fetchedLogs.length });
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
      isOfflineMode: !isConnected,
      isLoading,
      isConnected,
      connectionStatus,
      pacts,
      logs,
      refreshData,
      initializeSchema
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};
