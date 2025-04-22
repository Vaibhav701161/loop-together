import React, { createContext, useContext, useState, useEffect } from "react";
import { Pact, PactLog, User, CompletionStatus } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface PactContextType {
  pacts: Pact[];
  completions: PactLog[];
  addPact: (pact: Omit<Pact, "id">) => Promise<void>;
  updatePact: (pact: Pact) => Promise<void>;
  deletePact: (pactId: string) => Promise<void>;
  addPactCompletion: (pactId: string, userId: "user_a" | "user_b", data: Omit<PactLog, "id" | "date" | "completedAt">) => Promise<void>;
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
  getPactStreak: (pactId: string, userId?: "user_a" | "user_b") => { current: number; longest: number; total: number };
  logs: PactLog[];
  isPactLost: (pactId: string, userId: "user_a" | "user_b") => boolean;
  addPactLog: (log: Omit<PactLog, "id">) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPacts = async () => {
      setIsLoading(true);
      
      const supabaseConfigured = isSupabaseConfigured();
      
      if (supabaseConfigured) {
        try {
          const { data: pactsData, error: pactsError } = await supabase
            .from('pacts')
            .select('*');
          
          if (pactsError) {
            throw pactsError;
          }

          const { data: logsData, error: logsError } = await supabase
            .from('pact_logs')
            .select('*');
          
          if (logsError) {
            throw logsError;
          }

          const transformedPacts: Pact[] = pactsData.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description || undefined,
            frequency: p.frequency,
            assignedTo: p.assigned_to,
            proofType: p.proof_type,
            deadline: p.deadline,
            maxFailCount: p.max_fail_count,
            punishment: p.punishment,
            reward: p.reward,
            createdAt: p.created_at,
            startDate: p.start_date,
            color: p.color || undefined,
            isVerified: p.is_verified
          }));

          const transformedLogs: PactLog[] = logsData.map(log => ({
            id: log.id,
            pactId: log.pact_id,
            userId: log.user_id as User["id"],
            date: log.date,
            status: log.status,
            completedAt: log.completed_at,
            note: log.note || undefined,
            proofType: log.proof_type || undefined,
            proofUrl: log.proof_url || undefined,
            verifiedBy: log.verified_by || undefined,
            verifiedAt: log.verified_at || undefined,
            comment: log.comment || undefined
          }));

          setPacts(transformedPacts);
          setCompletions(transformedLogs);
          setUsingLocalStorage(false);
          
        } catch (error) {
          console.error('Error fetching data from Supabase:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };
    
    const loadFromLocalStorage = () => {
      const storedPacts = localStorage.getItem("2getherLoop_pacts");
      const storedCompletions = localStorage.getItem("2getherLoop_completions");
      
      setPacts(storedPacts ? JSON.parse(storedPacts) : []);
      setCompletions(storedCompletions ? JSON.parse(storedCompletions) : []);
      setUsingLocalStorage(true);
      
      toast({
        title: "Using local storage",
        description: "No connection to Supabase, using local storage instead.",
        variant: "warning"
      });
    };

    fetchPacts();
    
    if (isSupabaseConfigured()) {
      const pactsSubscription = supabase
        .channel('pacts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pacts' }, payload => {
          console.log('Pacts change received!', payload);
          fetchPacts();
        })
        .subscribe();
        
      const logsSubscription = supabase
        .channel('logs-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pact_logs' }, payload => {
          console.log('Logs change received!', payload);
          fetchPacts();
        })
        .subscribe();
        
      return () => {
        pactsSubscription.unsubscribe();
        logsSubscription.unsubscribe();
      };
    }
  }, [toast]);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("2getherLoop_pacts", JSON.stringify(pacts));
    }
  }, [pacts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("2getherLoop_completions", JSON.stringify(completions));
    }
  }, [completions, isLoading]);

  const addPact = async (pact: Omit<Pact, "id">) => {
    try {
      const newPact = { 
        id: uuidv4(), 
        ...pact,
        createdAt: pact.createdAt || new Date().toISOString(),
        startDate: pact.startDate || new Date().toISOString().split('T')[0]
      };
      
      if (!usingLocalStorage && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('pacts')
          .insert({
            id: newPact.id,
            title: newPact.title,
            description: newPact.description || null,
            frequency: newPact.frequency,
            assigned_to: newPact.assignedTo,
            proof_type: newPact.proofType,
            deadline: newPact.deadline,
            max_fail_count: newPact.maxFailCount,
            punishment: newPact.punishment,
            reward: newPact.reward,
            start_date: newPact.startDate,
            color: newPact.color || null,
            is_verified: newPact.isVerified || false,
            created_by: "user_a",
            created_at: newPact.createdAt
          });
          
        if (error) throw error;
      }
      
      setPacts(prevPacts => [...prevPacts, newPact]);
      
      toast({
        title: "Pact created",
        description: "Your new pact has been created successfully."
      });
    } catch (error) {
      console.error('Error adding pact:', error);
      toast({
        title: "Error creating pact",
        description: "There was an error creating your pact. Saved to local storage only.",
        variant: "destructive"
      });
    }
  };

  const updatePact = async (pact: Pact) => {
    try {
      if (!usingLocalStorage && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('pacts')
          .update({
            title: pact.title,
            description: pact.description || null,
            frequency: pact.frequency,
            assigned_to: pact.assignedTo,
            proof_type: pact.proofType,
            deadline: pact.deadline,
            max_fail_count: pact.maxFailCount,
            punishment: pact.punishment,
            reward: pact.reward,
            start_date: pact.startDate,
            color: pact.color || null,
            is_verified: pact.isVerified || false
          })
          .eq('id', pact.id);
          
        if (error) throw error;
      }
      
      setPacts(prevPacts =>
        prevPacts.map(p => (p.id === pact.id ? pact : p))
      );
      
      toast({
        title: "Pact updated",
        description: "Your pact has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating pact:', error);
      toast({
        title: "Error updating pact",
        description: "There was an error updating your pact on the server. Local copy updated.",
        variant: "warning"
      });
    }
  };

  const deletePact = async (pactId: string) => {
    try {
      const { error } = await supabase
        .from('pacts')
        .delete()
        .eq('id', pactId);
        
      if (error) throw error;
      
      setPacts(prevPacts => prevPacts.filter(pact => pact.id !== pactId));
      setCompletions(prevCompletions => prevCompletions.filter(completion => completion.pactId !== pactId));
      
      toast({
        title: "Pact deleted",
        description: "Your pact has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting pact:', error);
      toast({
        title: "Error deleting pact",
        description: "There was an error deleting your pact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addPactCompletion = async (pactId: string, userId: "user_a" | "user_b", data: Omit<PactLog, "id" | "date" | "completedAt">) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const newCompletion: PactLog = {
        id: `compl_${Date.now()}`,
        pactId,
        userId,
        date: today,
        completedAt: now,
        status: "completed",
        ...(data.note ? { note: data.note } : {}),
        ...(data.proofType ? { proofType: data.proofType } : {}),
        ...(data.proofUrl ? { proofUrl: data.proofUrl } : {})
      };
      
      const { error } = await supabase
        .from('pact_logs')
        .insert({
          id: newCompletion.id,
          pact_id: newCompletion.pactId,
          user_id: newCompletion.userId,
          date: newCompletion.date,
          status: newCompletion.status,
          completed_at: newCompletion.completedAt,
          note: newCompletion.note || null,
          proof_type: newCompletion.proofType || null,
          proof_url: newCompletion.proofUrl || null,
          comment: data.comment || null
        });
        
      if (error) throw error;
      
      setCompletions(prevCompletions => [...prevCompletions, newCompletion]);
      
      toast({
        title: "Task completed",
        description: "Your task has been marked as completed."
      });
    } catch (error) {
      console.error('Error adding completion:', error);
      toast({
        title: "Error completing task",
        description: "There was an error marking your task as completed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addPactLog = async (log: Omit<PactLog, "id">) => {
    try {
      const newLog: PactLog = {
        id: `log_${Date.now()}`,
        ...log
      };
      
      const { error } = await supabase
        .from('pact_logs')
        .insert({
          id: newLog.id,
          pact_id: newLog.pactId,
          user_id: newLog.userId,
          date: newLog.date,
          status: newLog.status,
          completed_at: newLog.completedAt,
          note: newLog.note || null,
          proof_type: newLog.proofType || null,
          proof_url: newLog.proofUrl || null,
          comment: newLog.comment || null
        });
        
      if (error) throw error;
      
      setCompletions(prev => [...prev, newLog]);
      
      if (newLog.status === "completed") {
        toast({
          title: "Task completed",
          description: "Your task has been marked as completed."
        });
      } else if (newLog.status === "failed") {
        toast({
          title: "Task failed",
          description: "Your task has been marked as failed."
        });
      }
    } catch (error) {
      console.error('Error adding log:', error);
      toast({
        title: "Error updating task",
        description: "There was an error updating your task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('pact_logs')
        .delete()
        .eq('id', logId);
        
      if (error) throw error;
      
      setCompletions(prevLogs => prevLogs.filter(log => log.id !== logId));
      
      toast({
        title: "Log deleted",
        description: "The log entry has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error deleting log",
        description: "There was an error deleting the log. Please try again.",
        variant: "destructive"
      });
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

  const getPactStreak = (pactId: string, userId?: "user_a" | "user_b") => {
    const pactCompletions = completions
      .filter(c => c.pactId === pactId && (userId ? c.userId === userId : true) && c.status === "completed")
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
      deleteLog
    }}>
      {children}
    </PactContext.Provider>
  );
};
