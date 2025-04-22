import React, { createContext, useContext, useState, useEffect } from "react";
import { Pact, PactLog, User, CompletionStatus } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface PactContextType {
  pacts: Pact[];
  completions: PactLog[];
  addPact: (pact: Omit<Pact, "id">) => void;
  updatePact: (pact: Pact) => void;
  deletePact: (pactId: string) => void;
  addPactCompletion: (pactId: string, userId: "user_a" | "user_b", data: Omit<PactLog, "id" | "completedAt">) => void;
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
  const [pacts, setPacts] = useState<Pact[]>(() => {
    const storedPacts = localStorage.getItem("2getherLoop_pacts");
    return storedPacts ? JSON.parse(storedPacts) : [];
  });
  const [completions, setCompletions] = useState<PactLog[]>(() => {
    const storedCompletions = localStorage.getItem("2getherLoop_completions");
    return storedCompletions ? JSON.parse(storedCompletions) : [];
  });

  useEffect(() => {
    localStorage.setItem("2getherLoop_pacts", JSON.stringify(pacts));
  }, [pacts]);

  useEffect(() => {
    localStorage.setItem("2getherLoop_completions", JSON.stringify(completions));
  }, [completions]);

  const addPact = (pact: Omit<Pact, "id">) => {
    const newPact: Pact = { id: uuidv4(), ...pact };
    setPacts(prevPacts => [...prevPacts, newPact]);
  };

  const updatePact = (pact: Pact) => {
    setPacts(prevPacts =>
      prevPacts.map(p => (p.id === pact.id ? pact : p))
    );
  };

  const deletePact = (pactId: string) => {
    setPacts(prevPacts => prevPacts.filter(pact => pact.id !== pactId));
    setCompletions(prevCompletions => prevCompletions.filter(completion => completion.pactId !== pactId));
  };

  // Fix the addPactCompletion function to match the expected type
  const addPactCompletion = (pactId: string, userId: "user_a" | "user_b", data: Omit<PactLog, "id" | "completedAt">) => {
    const newCompletion: PactLog = {
      id: `compl_${Date.now()}`,
      pactId,
      userId,
      completedAt: new Date().toISOString(),
      status: "completed",
      // Make sure we're only using properties that exist on the type
      // If these properties should exist, update the PactLog type definition
      ...(data.note ? { note: data.note } : {}),
      ...(data.proofType ? { proofType: data.proofType } : {}),
      ...(data.proofUrl ? { proofUrl: data.proofUrl } : {})
    };

    setCompletions(prevCompletions => [...prevCompletions, newCompletion]);
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
      const completion = completions.find(c => c.pactId === pact.id && c.userId === userId);
      return !completion || completion.status !== "completed";
    });
  };

  const getUserCompletedPacts = (userId: "user_a" | "user_b") => {
    return getTodaysPacts().filter(pact => {
      const completion = completions.find(c => c.pactId === pact.id && c.userId === userId);
      return completion && completion.status === "completed";
    });
  };

  // Fix the comparison for status checks (they should be checking against "completed" not another status)
  const getPactStatus = (pactId: string, userId: "user_a" | "user_b"): CompletionStatus => {
    const pactCompletions = completions.filter(c => c.pactId === pactId && c.userId === userId);
    
    if (pactCompletions.length > 0) {
      // Return the status of the most recent completion
      return pactCompletions[0].status;
    }
    
    // If no completions found, check if pact is overdue
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
    }}>
      {children}
    </PactContext.Provider>
  );
};
