
import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useReminders } from "@/hooks/use-reminders";

interface ReminderContextType {
  snoozeReminder: (pactId: string, minutes: number) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminder must be used within a ReminderProvider");
  }
  return context;
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUser } = useAuth();
  
  // Initialize the reminders hook
  useReminders();
  
  // Function to snooze a reminder
  const snoozeReminder = (pactId: string, minutes: number) => {
    // Implementation would store the snooze time and re-notify after the specified time
    console.log(`Reminder for pact ${pactId} snoozed for ${minutes} minutes`);
    
    // This could store in local storage or state to prevent notifications during snooze period
  };
  
  return (
    <ReminderContext.Provider value={{
      snoozeReminder,
    }}>
      {children}
    </ReminderContext.Provider>
  );
};
