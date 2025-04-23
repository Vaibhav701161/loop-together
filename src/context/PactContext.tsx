import React, { createContext, useContext, useState, useEffect } from "react";
import { Pact, PactLog, User, CompletionStatus } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { supabase, hasValidSupabaseCredentials } from "@/lib/supabase";
import {
  getPacts as fetchPacts,
  getPactLogs as fetchPactLogs,
  addPact as createPact,
  updatePact as updateSupabasePact,
  deletePact as deleteSupabasePact,
  addPactLog as createPactLog
} from "@/lib/services/pactService";

interface PactContextType {
  pacts: Pact[];
  completions: PactLog[];
  addPact: (pact: Omit<Pact, "id">) => void;
  updatePact: (pact: Pact) => void;
  deletePact: (pactId: string) => void;
  addPactCompletion: (data: any) => void;
  addPactLog: (log: Omit<PactLog, "id">) => void;
  getTodaysPacts: () => Pact[];
  getUserPendingPacts: (userId: "user_a" | "user_b") => Pact[];
  getUserCompletedPacts: (userId: "user_a" | "user_b") => Pact[];
  getPactStatus: (pactId: string, userId: "user_a" | "user_b") => CompletionStatus;
  calculateSummary: (userId: "user_a" | "user_b") => {
    currentStreak: number;
    longestStreak: number;
    totalPacts: number;
    totalCompleted: number;
  };
  getPact: (pactId: string) => Pact | undefined;
  getPactStreak: (pactId: string, userId: "user_a" | "user_b") => { current: number; longest: number; total: number };
  logs: PactLog[];
  isPactLost: (pactId: string, userId: "user_a" | "user_b") => boolean;
  isLoading: boolean;
  isError: boolean;
  isConfigured: boolean;
}

const PactContext = createContext<PactContextType | undefined>(undefined);

export const usePacts = () => {
  const context = useContext(PactContext);
  if (!context) {
    throw new Error("usePacts must be used within a PactProvider");
  }
  return context;
};

export const PactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [completions, setCompletions] = useState<PactLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if Supabase is configured
  const hasBackend = () => {
    return hasValidSupabaseCredentials();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Check if we have a backend configured
      const backendAvailable = hasBackend();
      setIsConfigured(backendAvailable);
      
      if (!backendAvailable) {
        loadFromLocalStorage();
        setIsLoading(false);
        return;
      }
      
      try {
        // Use Supabase to fetch data
        const pactsData = await fetchPacts();
        const completionsData = await fetchPactLogs();
        
        setPacts(pactsData as Pact[]);
        setCompletions(completionsData as PactLog[]);
        
        // Still save to localStorage as backup
        localStorage.setItem("2getherLoop_pacts", JSON.stringify(pactsData));
        localStorage.setItem("2getherLoop_completions", JSON.stringify(completionsData));
      } catch (error) {
        console.error("Error loading data from backend:", error);
        toast({
          title: "Connection Error",
          description: "Falling back to local data. Some changes might not be saved online.",
          variant: "destructive"
        });
        
        loadFromLocalStorage();
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      const storedPacts = localStorage.getItem("2getherLoop_pacts");
      const storedCompletions = localStorage.getItem("2getherLoop_completions");
      
      if (storedPacts) {
        setPacts(JSON.parse(storedPacts));
      }
      
      if (storedCompletions) {
        setCompletions(JSON.parse(storedCompletions));
      }
    };
    
    loadData();
  }, [toast]);

  // Save pacts to backend when they change
  useEffect(() => {
    // This has been moved to individual functions that handle
    // both Supabase and localStorage updates
  }, []);

  const addPact = async (pact: Omit<Pact, "id">) => {
    const newPact: Pact = { 
      id: uuidv4(), 
      ...pact,
      createdAt: pact.createdAt || new Date().toISOString(),
      startDate: pact.startDate || new Date().toISOString().split('T')[0]
    };
    
    setPacts(prevPacts => [...prevPacts, newPact]);
    
    if (hasBackend() && !isError) {
      try {
        await createPact(pact);
      } catch (error) {
        console.error("Error saving pact to backend:", error);
        toast({
          title: "Sync Error",
          description: "Pact saved locally but failed to sync online",
          variant: "destructive"
        });
      }
    }
  };

  const updatePact = async (pact: Pact) => {
    setPacts(prevPacts => {
      const updated = prevPacts.map(p => (p.id === pact.id ? pact : p));
      return updated;
    });
    
    if (hasBackend() && !isError) {
      try {
        await updateSupabasePact(pact);
      } catch (error) {
        console.error("Error updating pact in backend:", error);
        toast({
          title: "Sync Error",
          description: "Pact updated locally but failed to sync online",
          variant: "destructive"
        });
      }
    }
  };

  const deletePact = async (pactId: string) => {
    setPacts(prevPacts => {
      const filtered = prevPacts.filter(pact => pact.id !== pactId);
      return filtered;
    });
    
    setCompletions(prevCompletions => {
      const filtered = prevCompletions.filter(completion => completion.pactId !== pactId);
      return filtered;
    });
    
    if (hasBackend() && !isError) {
      try {
        await deleteSupabasePact(pactId);
      } catch (error) {
        console.error("Error deleting pact from backend:", error);
        toast({
          title: "Sync Error",
          description: "Pact deleted locally but failed to sync online",
          variant: "destructive"
        });
      }
    }
  };

  const addPactCompletion = async (data: any) => {
    const newCompletion: PactLog = {
      id: uuidv4(),
      pactId: data.pactId,
      userId: data.userId,
      date: data.date || new Date().toISOString().split('T')[0],
      completedAt: data.completedAt || new Date().toISOString(),
      status: "completed",
      ...(data.note ? { note: data.note } : {}),
      ...(data.proofType ? { proofType: data.proofType } : {}),
      ...(data.proofUrl ? { proofUrl: data.proofUrl } : {})
    };

    setCompletions(prevCompletions => [...prevCompletions, newCompletion]);
    
    if (hasBackend() && !isError) {
      try {
        await createPactLog(newCompletion);
      } catch (error) {
        console.error("Error saving completion to backend:", error);
        toast({
          title: "Sync Error",
          description: "Completion saved locally but failed to sync online",
          variant: "destructive"
        });
      }
    }
  };

  const addPactLog = async (log: Omit<PactLog, "id">) => {
    const newLog: PactLog = {
      id: uuidv4(),
      ...log
    };
    
    setCompletions(prev => [...prev, newLog]);
    
    if (hasBackend() && !isError) {
      try {
        await createPactLog(newLog);
      } catch (error) {
        console.error("Error saving log to backend:", error);
        toast({
          title: "Sync Error",
          description: "Log saved locally but failed to sync online",
          variant: "destructive"
        });
      }
    }
  };

  const getTodaysPacts = () => {
    const today = new Date().toLocaleDateString();
    return pacts.filter(pact => {
      const pactDate = new Date(pact.startDate).toLocaleDateString();
      return pactDate <= today;
    });
  };

  const getUserPendingPacts = (userId: "user_a" | "user_b") => {
    return getTodaysPacts().filter(pact => {
      const completion = completions.find(c => 
        c.pactId === pact.id && 
        c.userId === userId && 
        c.date === new Date().toISOString().split('T')[0]
      );
      return !completion || completion.status !== "completed";
    });
  };

  const getUserCompletedPacts = (userId: "user_a" | "user_b") => {
    return getTodaysPacts().filter(pact => {
      const completion = completions.find(c => 
        c.pactId === pact.id && 
        c.userId === userId && 
        c.date === new Date().toISOString().split('T')[0]
      );
      return completion && completion.status === "completed";
    });
  };

  const getPactStatus = (pactId: string, userId: "user_a" | "user_b"): CompletionStatus => {
    const today = new Date().toISOString().split('T')[0];
    const pactCompletions = completions.filter(c => 
      c.pactId === pactId && 
      c.userId === userId && 
      c.date === today
    );
    
    if (pactCompletions.length > 0) {
      return pactCompletions[pactCompletions.length - 1].status;
    }
    
    const pact = pacts.find(p => p.id === pactId);
    if (pact) {
      const now = new Date();
      const deadline = new Date();
      const [hours, minutes] = pact.deadline.split(':').map(Number);
      deadline.setHours(hours, minutes, 0, 0);
      
      if (now > deadline) {
        return "failed";
      }
    }
    
    return "pending";
  };

  const isPactLost = (pactId: string, userId: "user_a" | "user_b"): boolean => {
    return getPactStatus(pactId, userId) === "failed";
  };

  const getPact = (pactId: string): Pact | undefined => {
    return pacts.find(p => p.id === pactId);
  };

  const getPactStreak = (pactId: string, userId: "user_a" | "user_b") => {
    const pactCompletions = completions
      .filter(c => c.pactId === pactId && c.userId === userId && c.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    for (const completion of pactCompletions) {
      const completionDate = new Date(completion.date);
      
      if (lastDate) {
        const dayDiff = Math.floor((lastDate.getTime() - completionDate.getTime()) / (1000 * 3600 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = completionDate;
    }
    
    longest = Math.max(longest, tempStreak);
    
    if (pactCompletions.length > 0) {
      const lastCompletionDate = new Date(pactCompletions[0].date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCompletionDate.toDateString() === today.toDateString() || 
          lastCompletionDate.toDateString() === yesterday.toDateString()) {
        current = tempStreak;
      }
    }
    
    return { 
      current, 
      longest, 
      total: pactCompletions.length 
    };
  };

  const calculateSummary = (userId: "user_a" | "user_b") => {
    const today = new Date().toLocaleDateString();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const userCompletions = completions
      .filter(c => c.userId === userId && c.status === "completed")
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    userCompletions.forEach(completion => {
      const completionDate = new Date(completion.completedAt);
      const completionDateString = completionDate.toLocaleDateString();

      if (lastDate) {
        const timeDiff = completionDate.getTime() - lastDate.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        if (dayDiff <= 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      lastDate = completionDate;
    });

    longestStreak = Math.max(longestStreak, tempStreak);

    if (userCompletions.length > 0 && new Date(userCompletions[userCompletions.length - 1].completedAt).toLocaleDateString() === today) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    const totalPacts = pacts.length;
    const totalCompleted = userCompletions.length;

    return { currentStreak, longestStreak, totalPacts, totalCompleted };
  };

  return (
    <PactContext.Provider value={{
      pacts,
      completions,
      addPact,
      updatePact,
      deletePact,
      addPactCompletion,
      getTodaysPacts,
      getUserPendingPacts,
      getUserCompletedPacts,
      getPactStatus,
      calculateSummary,
      getPact,
      getPactStreak,
      logs: completions,
      isPactLost,
      addPactLog,
      isLoading,
      isError,
      isConfigured
    }}>
      {children}
    </PactContext.Provider>
  );
};
