import React, { createContext, useContext, useState, useEffect } from "react";
import { Pact, PactLog, Streak, User, CompletionStatus } from "@/types";
import { useAuth } from "./AuthContext";
import { format, isToday, parseISO, startOfDay, subDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PactContextType {
  pacts: Pact[];
  logs: PactLog[];
  streaks: Record<string, Streak>;
  addPact: (pact: Omit<Pact, "id" | "createdAt">) => string;
  updatePact: (pact: Pact) => void;
  deletePact: (pactId: string) => void;
  addPactLog: (log: Omit<PactLog, "id" | "completedAt">, notify?: boolean) => void;
  getTodaysPactLogs: (userId?: User["id"]) => PactLog[];
  getTodaysPacts: (userId?: User["id"]) => Pact[];
  getUserPendingPacts: (userId: User["id"], date?: string) => Pact[];
  getUserCompletedPacts: (userId: User["id"], date?: string) => Pact[];
  getUserFailedPacts: (userId: User["id"], date?: string) => Pact[];
  getPactStatus: (pactId: string, userId: User["id"], date?: string) => CompletionStatus;
  getPactStreak: (pactId: string) => Streak;
  getPactLogs: (pactId: string, limit?: number) => PactLog[];
  getPact: (pactId: string) => Pact | undefined;
  calculateSummary: (userId?: User["id"]) => {
    totalPacts: number;
    completedPacts: number;
    currentStreak: number;
    totalCompleted: number;
  };
  isPactLost: (pactId: string, userId: User["id"]) => boolean;
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
  const [logs, setLogs] = useState<PactLog[]>([]);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const { activeUser, users } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    const storedLogs = localStorage.getItem("2getherLoop_pactLogs");
    const storedStreaks = localStorage.getItem("2getherLoop_streaks");

    if (storedPacts) {
      setPacts(JSON.parse(storedPacts));
    }
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
    if (storedStreaks) {
      setStreaks(JSON.parse(storedStreaks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("2getherLoop_pacts", JSON.stringify(pacts));
  }, [pacts]);

  useEffect(() => {
    localStorage.setItem("2getherLoop_pactLogs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("2getherLoop_streaks", JSON.stringify(streaks));
  }, [streaks]);

  useEffect(() => {
    updateAllStreaks();
  }, [logs]);

  const addPact = (pactData: Omit<Pact, "id" | "createdAt">) => {
    const id = `pact_${Date.now().toString(36)}`;
    const newPact: Pact = {
      ...pactData,
      id,
      createdAt: new Date().toISOString(),
    };
    
    setPacts(prev => [...prev, newPact]);
    
    setStreaks(prev => ({
      ...prev,
      [id]: {
        pactId: id,
        current: 0,
        longest: 0,
        total: 0
      }
    }));
    
    toast({
      title: "Pact Created!",
      description: `'${pactData.title}' has been created successfully.`,
    });
    
    return id;
  };

  const updatePact = (updatedPact: Pact) => {
    setPacts(prev => prev.map(pact => 
      pact.id === updatedPact.id ? updatedPact : pact
    ));
    
    toast({
      title: "Pact Updated",
      description: `'${updatedPact.title}' has been updated.`,
    });
  };

  const deletePact = (pactId: string) => {
    const pactToDelete = pacts.find(p => p.id === pactId);
    if (!pactToDelete) return;
    
    setPacts(prev => prev.filter(pact => pact.id !== pactId));
    
    setLogs(prev => prev.filter(log => log.pactId !== pactId));
    
    setStreaks(prev => {
      const newStreaks = { ...prev };
      delete newStreaks[pactId];
      return newStreaks;
    });
    
    toast({
      title: "Pact Deleted",
      description: `'${pactToDelete.title}' has been deleted.`,
    });
  };

  const addPactLog = (logData: Omit<PactLog, "id" | "completedAt">, notify = true) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const existingLogIndex = logs.findIndex(log => 
      log.pactId === logData.pactId && 
      log.userId === logData.userId && 
      log.date === logData.date
    );
    
    const id = existingLogIndex >= 0 
      ? logs[existingLogIndex].id 
      : `log_${Date.now().toString(36)}`;
    
    const newLog: PactLog = {
      ...logData,
      id,
      completedAt: new Date().toISOString(),
    };
    
    if (existingLogIndex >= 0) {
      const updatedLogs = [...logs];
      updatedLogs[existingLogIndex] = newLog;
      setLogs(updatedLogs);
    } else {
      setLogs(prev => [...prev, newLog]);
    }
    
    if (logData.status === "failed") {
      const pact = pacts.find(p => p.id === logData.pactId);
      
      if (pact) {
        const failureCount = logs.filter(log => 
          log.pactId === logData.pactId && 
          log.userId === logData.userId && 
          log.status === "failed"
        ).length + 1;
        
        if (failureCount >= pact.maxFailCount && notify) {
          toast({
            title: "Pact Lost 😢",
            description: `You've reached the maximum number of failures for "${pact.title}". ${pact.punishment}`,
            variant: "destructive",
            duration: 10000
          });
        }
      }
    }
    
    if (logData.status === "completed" && notify) {
      const pact = pacts.find(p => p.id === logData.pactId);
      
      if (pact) {
        toast({
          title: "Pact Completed! 🎉",
          description: `Your pact "${pact.title}" has been marked as completed.`,
          duration: 5000
        });
      }
    } else if (notify) {
      toast({
        title: logData.status === "failed" ? "Pact Failed 😢" : "Pact Updated",
        description: `Your pact has been marked as ${logData.status}.`,
        variant: logData.status === "failed" ? "destructive" : "default",
        duration: 5000
      });
    }
  };

  const updateAllStreaks = () => {
    const newStreaks: Record<string, Streak> = {};
    
    pacts.forEach(pact => {
      const pactLogs = logs.filter(log => log.pactId === pact.id);
      
      if (pactLogs.length === 0) {
        newStreaks[pact.id] = {
          pactId: pact.id,
          current: 0,
          longest: 0,
          total: 0
        };
        return;
      }
      
      const sortedLogs = [...pactLogs].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let current = 0;
      let longest = 0;
      let total = 0;
      
      total = sortedLogs.filter(log => log.status === "completed").length;
      
      const today = new Date();
      let checkDate = today;
      let streakBroken = false;
      
      while (!streakBroken) {
        const dateStr = format(checkDate, "yyyy-MM-dd");
        const relevantLogs = sortedLogs.filter(log => log.date === dateStr);
        
        if (relevantLogs.length > 0) {
          const allCompleted = relevantLogs.every(log => log.status === "completed");
          
          if (allCompleted) {
            current++;
          } else {
            streakBroken = true;
          }
        } else {
          if (!isToday(checkDate)) {
            streakBroken = true;
          } else {
            break;
          }
        }
        
        checkDate = subDays(checkDate, 1);
        
        if (current > 365) break;
      }
      
      let tempStreak = 0;
      let previousDate: Date | null = null;
      
      for (const log of sortedLogs) {
        if (log.status === "completed") {
          const logDate = parseISO(log.date);
          
          if (previousDate === null) {
            tempStreak = 1;
          } else {
            const diffDays = Math.floor(
              (startOfDay(logDate).getTime() - startOfDay(previousDate).getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            
            if (diffDays === 1) {
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          }
          
          previousDate = logDate;
          longest = Math.max(longest, tempStreak);
        } else {
          tempStreak = 0;
          previousDate = null;
        }
      }
      
      newStreaks[pact.id] = {
        pactId: pact.id,
        current,
        longest,
        total
      };
    });
    
    setStreaks(newStreaks);
  };

  const getTodaysPactLogs = (userId?: User["id"]) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return logs.filter(log => {
      if (log.date !== today) return false;
      if (userId && log.userId !== userId) return false;
      return true;
    });
  };

  const getTodaysPacts = (userId?: User["id"]) => {
    if (!userId && !activeUser) return [];
    
    const userIdToUse = userId || activeUser?.id || "";
    
    return pacts.filter(pact => {
      if (
        pact.assignedTo !== userIdToUse && 
        pact.assignedTo !== "both"
      ) {
        return false;
      }
      
      return true;
    });
  };

  const getPactStatus = (pactId: string, userId: User["id"], date?: string): CompletionStatus => {
    const dateToCheck = date || format(new Date(), "yyyy-MM-dd");
    
    const log = logs.find(
      log => log.pactId === pactId && log.userId === userId && log.date === dateToCheck
    );
    
    return log?.status || "pending";
  };

  const getUserPendingPacts = (userId: User["id"], date?: string): Pact[] => {
    const dateToCheck = date || format(new Date(), "yyyy-MM-dd");
    const userPacts = pacts.filter(pact => 
      pact.assignedTo === userId || pact.assignedTo === "both"
    );
    
    return userPacts.filter(pact => {
      const status = getPactStatus(pact.id, userId, dateToCheck);
      return status === "pending";
    });
  };

  const getUserCompletedPacts = (userId: User["id"], date?: string): Pact[] => {
    const dateToCheck = date || format(new Date(), "yyyy-MM-dd");
    const userPacts = pacts.filter(pact => 
      pact.assignedTo === userId || pact.assignedTo === "both"
    );
    
    return userPacts.filter(pact => {
      const status = getPactStatus(pact.id, userId, dateToCheck);
      return status === "completed";
    });
  };

  const getUserFailedPacts = (userId: User["id"], date?: string): Pact[] => {
    const dateToCheck = date || format(new Date(), "yyyy-MM-dd");
    const userPacts = pacts.filter(pact => 
      pact.assignedTo === userId || pact.assignedTo === "both"
    );
    
    return userPacts.filter(pact => {
      const status = getPactStatus(pact.id, userId, dateToCheck);
      return status === "failed";
    });
  };

  const getPactStreak = (pactId: string): Streak => {
    return streaks[pactId] || { pactId, current: 0, longest: 0, total: 0 };
  };

  const getPactLogs = (pactId: string, limit?: number): PactLog[] => {
    const filteredLogs = logs
      .filter(log => log.pactId === pactId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? filteredLogs.slice(0, limit) : filteredLogs;
  };

  const getPact = (pactId: string): Pact | undefined => {
    return pacts.find(pact => pact.id === pactId);
  };

  const calculateSummary = (userId?: User["id"]) => {
    const userIdToUse = userId || activeUser?.id;
    
    if (!userIdToUse) {
      return {
        totalPacts: 0,
        completedPacts: 0,
        currentStreak: 0,
        totalCompleted: 0,
      };
    }
    
    const userPacts = pacts.filter(pact => 
      pact.assignedTo === userIdToUse || pact.assignedTo === "both"
    );
    
    const today = format(new Date(), "yyyy-MM-dd");
    const todayLogs = logs.filter(
      log => log.userId === userIdToUse && log.date === today
    );
    
    const completedToday = todayLogs.filter(log => log.status === "completed").length;
    
    let maxCurrentStreak = 0;
    for (const pact of userPacts) {
      const streak = getPactStreak(pact.id);
      maxCurrentStreak = Math.max(maxCurrentStreak, streak.current);
    }
    
    const totalCompleted = logs.filter(
      log => log.userId === userIdToUse && log.status === "completed"
    ).length;
    
    return {
      totalPacts: userPacts.length,
      completedPacts: completedToday,
      currentStreak: maxCurrentStreak,
      totalCompleted,
    };
  };

  const isPactLost = (pactId: string, userId: User["id"]): boolean => {
    const pact = pacts.find(p => p.id === pactId);
    if (!pact) return false;
    
    const failureCount = logs.filter(log => 
      log.pactId === pactId && 
      log.userId === userId && 
      log.status === "failed"
    ).length;
    
    return failureCount >= pact.maxFailCount;
  };

  useEffect(() => {
    if (!activeUser) return;
    
    const checkMissedDeadlines = () => {
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      
      users.forEach(user => {
        const userPacts = pacts.filter(pact => 
          (pact.assignedTo === user.id || pact.assignedTo === "both") &&
          getPactStatus(pact.id, user.id, today) === "pending"
        );
        
        userPacts.forEach(pact => {
          const [hours, minutes] = pact.deadline.split(":").map(Number);
          
          const deadlineDate = new Date();
          deadlineDate.setHours(hours, minutes, 0, 0);
          
          if (isPast(deadlineDate)) {
            const existingLog = logs.find(log => 
              log.pactId === pact.id && 
              log.userId === user.id && 
              log.date === today
            );
            
            if (!existingLog) {
              addPactLog({
                pactId: pact.id,
                userId: user.id,
                date: today,
                status: "failed"
              }, false);
            }
          }
        });
      });
    };
    
    checkMissedDeadlines();
    
    const interval = setInterval(checkMissedDeadlines, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [activeUser, pacts, logs]);

  return (
    <PactContext.Provider value={{
      pacts,
      logs,
      streaks,
      addPact,
      updatePact,
      deletePact,
      addPactLog,
      getTodaysPactLogs,
      getTodaysPacts,
      getUserPendingPacts,
      getUserCompletedPacts,
      getUserFailedPacts,
      getPactStatus,
      getPactStreak,
      getPactLogs,
      getPact,
      calculateSummary,
      isPactLost,
    }}>
      {children}
    </PactContext.Provider>
  );
};
