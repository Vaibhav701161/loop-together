
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { format, isPast, parseISO, isSameDay, addMinutes } from "date-fns";
import { toast } from "@/hooks/use-toast";

export const useReminders = () => {
  const { activeUser } = useAuth();
  const { pacts, getPactStatus } = usePacts();
  const [lastNotified, setLastNotified] = useState<Record<string, Date>>({});
  
  useEffect(() => {
    if (!activeUser) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      
      // Get all active pacts for this user
      const userPacts = pacts.filter(pact => 
        (pact.assignedTo === activeUser.id || pact.assignedTo === "both") &&
        getPactStatus(pact.id, activeUser.id, today) === "pending"
      );
      
      userPacts.forEach(pact => {
        const [hours, minutes] = pact.deadline.split(":").map(Number);
        
        // Create a deadline date object for today
        const deadlineDate = new Date();
        deadlineDate.setHours(hours, minutes, 0, 0);
        
        // Calculate reminder time (30 minutes before deadline)
        const reminderDate = addMinutes(deadlineDate, -30);
        
        // Check if it's time to send a reminder
        const shouldRemind = now >= reminderDate && now < deadlineDate;
        const wasNotified = lastNotified[pact.id] && isSameDay(lastNotified[pact.id], now);
        
        if (shouldRemind && !wasNotified) {
          toast({
            title: "Pact Reminder",
            description: `Don't forget to complete "${pact.title}" before ${format(deadlineDate, "h:mm a")}!`,
            duration: 10000
          });
          
          // Update last notified time
          setLastNotified(prev => ({
            ...prev,
            [pact.id]: now
          }));
        }
        
        // Check if deadline has passed (auto-fail after deadline)
        const deadlinePassed = isPast(deadlineDate) && 
          !isSameDay(lastNotified[`failed_${pact.id}`] || new Date(0), now);
          
        if (deadlinePassed) {
          toast({
            title: "Pact Missed",
            description: `You missed the deadline for "${pact.title}"! It has been marked as failed.`,
            variant: "destructive",
            duration: 10000
          });
          
          // Update last notified time for failures to avoid duplicate notifications
          setLastNotified(prev => ({
            ...prev,
            [`failed_${pact.id}`]: now
          }));
        }
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [activeUser, pacts, getPactStatus, lastNotified]);
  
  return { lastNotified };
};
