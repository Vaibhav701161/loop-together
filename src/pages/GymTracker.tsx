
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GymVisit, User } from "@/types";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isToday } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Dumbbell, Calendar, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

const useGymVisits = () => {
  const [visits, setVisits] = useState<GymVisit[]>([]);
  
  useEffect(() => {
    const storedVisits = localStorage.getItem("2getherLoop_gymVisits");
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("2getherLoop_gymVisits", JSON.stringify(visits));
  }, [visits]);
  
  const addVisit = (userId: User["id"], comment?: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const existingVisit = visits.find(
      visit => visit.userId === userId && visit.date === today
    );
    
    if (existingVisit) {
      setVisits(prev => 
        prev.map(visit => 
          visit.id === existingVisit.id
            ? { ...visit, comment }
            : visit
        )
      );
      return existingVisit.id;
    } else {
      const id = `gym_${Date.now().toString(36)}`;
      const newVisit: GymVisit = {
        id,
        userId,
        date: today,
        comment,
      };
      
      setVisits(prev => [...prev, newVisit]);
      return id;
    }
  };
  
  const removeVisit = (userId: string, date: string) => {
    setVisits(prev => 
      prev.filter(visit => !(visit.userId === userId && visit.date === date))
    );
  };
  
  const hasVisitOnDate = (userId: string, date: string) => {
    return visits.some(visit => visit.userId === userId && visit.date === date);
  };
  
  const getVisitsForUser = (userId: string) => {
    return visits.filter(visit => visit.userId === userId);
  };
  
  const getVisitForDate = (userId: string, date: string) => {
    return visits.find(visit => visit.userId === userId && visit.date === date);
  };
  
  const getCurrentStreak = (userId: string) => {
    const userVisits = getVisitsForUser(userId);
    if (userVisits.length === 0) return 0;
    
    const sortedVisits = [...userVisits].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    const todayStr = format(currentDate, "yyyy-MM-dd");
    const hasTodayVisit = sortedVisits.some(visit => visit.date === todayStr);
    
    if (!hasTodayVisit) {
      const yesterdayStr = format(new Date(currentDate.getTime() - 86400000), "yyyy-MM-dd");
      const hasYesterdayVisit = sortedVisits.some(visit => visit.date === yesterdayStr);
      
      if (!hasYesterdayVisit) {
        const mostRecentVisitDate = sortedVisits[0]?.date;
        if (!mostRecentVisitDate) return 0;
        
        return 0;
      }
    }
    
    const visitDates = new Set(sortedVisits.map(visit => visit.date));
    let checkDate = hasTodayVisit ? new Date() : new Date(currentDate.getTime() - 86400000);
    
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      
      if (visitDates.has(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const getLongestStreak = (userId: string) => {
    const userVisits = getVisitsForUser(userId);
    if (userVisits.length === 0) return 0;
    
    const sortedVisits = [...userVisits].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedVisits.length; i++) {
      const prevDate = parseISO(sortedVisits[i - 1].date);
      const currDate = parseISO(sortedVisits[i].date);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak;
  };
  
  const getMonthlyVisitCount = (userId: string, date: Date = new Date()) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return visits.filter(visit => {
      const visitDate = parseISO(visit.date);
      return (
        visit.userId === userId &&
        visitDate >= monthStart &&
        visitDate <= monthEnd
      );
    }).length;
  };
  
  return {
    visits,
    addVisit,
    removeVisit,
    hasVisitOnDate,
    getVisitsForUser,
    getVisitForDate,
    getCurrentStreak,
    getLongestStreak,
    getMonthlyVisitCount,
  };
};

const GymTracker: React.FC = () => {
  const { activeUser, users } = useAuth();
  const {
    addVisit,
    removeVisit,
    hasVisitOnDate,
    getVisitForDate,
    getCurrentStreak,
    getLongestStreak,
    getMonthlyVisitCount,
  } = useGymVisits();
  
  const [wentToGymToday, setWentToGymToday] = useState(false);
  const [comment, setComment] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Ensure we have a valid user before using
  if (!activeUser) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <p>Please log in to access the Gym Tracker.</p>
        </div>
      </Layout>
    );
  }
  
  const currentUser = activeUser;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const currentUserStreak = getCurrentStreak(currentUser.id);
  const otherUserStreak = getCurrentStreak(otherUser.id);
  const currentUserLongestStreak = getLongestStreak(currentUser.id);
  const otherUserLongestStreak = getLongestStreak(otherUser.id);
  const currentUserMonthlyVisits = getMonthlyVisitCount(currentUser.id, currentMonth);
  const otherUserMonthlyVisits = getMonthlyVisitCount(otherUser.id, currentMonth);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const today = format(new Date(), "yyyy-MM-dd");
    const hasVisit = hasVisitOnDate(currentUser.id, today);
    
    if (hasVisit) {
      setWentToGymToday(true);
      
      const visit = getVisitForDate(currentUser.id, today);
      if (visit?.comment) {
        setComment(visit.comment);
      }
    } else {
      setWentToGymToday(false);
      setComment("");
    }
  }, [currentUser.id, hasVisitOnDate, getVisitForDate]);
  
  const handleToggleGymVisit = (checked: boolean) => {
    setWentToGymToday(checked);
    
    if (checked) {
      addVisit(currentUser.id, comment);
      
      toast({
        title: "Gym Visit Recorded",
        description: "Keep up the good work! 💪",
      });
    } else {
      const today = format(new Date(), "yyyy-MM-dd");
      removeVisit(currentUser.id, today);
      
      toast({
        title: "Gym Visit Removed",
        description: "Your gym visit has been removed.",
      });
    }
  };
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    
    if (wentToGymToday) {
      addVisit(currentUser.id, e.target.value);
    }
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const firstDayOfMonth = monthStart.getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-heading mb-2">Gym Tracker</h1>
          <p className="text-muted-foreground">
            Track your gym visits and keep up the momentum!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Your Gym Progress
              </CardTitle>
              <CardDescription>
                Today is {format(new Date(), "EEEE, MMMM do")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="went-to-gym" className="font-medium">
                    I went to the gym today
                  </Label>
                  <Switch 
                    id="went-to-gym" 
                    checked={wentToGymToday}
                    onCheckedChange={handleToggleGymVisit}
                  />
                </div>
                <span className={wentToGymToday ? "text-green-500 font-medium" : "text-muted-foreground"}>
                  {wentToGymToday ? "Completed ✓" : "Not completed"}
                </span>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="gym-comment">Workout details (optional)</Label>
                <Textarea
                  id="gym-comment"
                  placeholder="What did you work on today? E.g. Leg day, 5k run, etc."
                  value={comment}
                  onChange={handleCommentChange}
                  disabled={!wentToGymToday}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{currentUserStreak}</div>
                  <div className="text-xs text-muted-foreground">Current streak</div>
                </div>
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{currentUserLongestStreak}</div>
                  <div className="text-xs text-muted-foreground">Longest streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-couple-orange">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                {otherUser.name}'s Progress
              </CardTitle>
              <CardDescription>
                See how your partner is doing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Went to gym today?</span>
                <span className={hasVisitOnDate(otherUser.id, format(new Date(), "yyyy-MM-dd")) 
                  ? "text-green-500 font-medium" 
                  : "text-muted-foreground"
                }>
                  {hasVisitOnDate(otherUser.id, format(new Date(), "yyyy-MM-dd")) 
                    ? "Yes ✓" 
                    : "Not yet"
                  }
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-couple-orange">{otherUserStreak}</div>
                  <div className="text-xs text-muted-foreground">Current streak</div>
                </div>
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-couple-orange">{otherUserLongestStreak}</div>
                  <div className="text-xs text-muted-foreground">Longest streak</div>
                </div>
              </div>
              
              {currentUserStreak > 0 && otherUserStreak > 0 && (
                <div className="bg-muted/30 p-3 rounded-md text-center mt-4">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Combined streak: {currentUserStreak + otherUserStreak} days</p>
                  <p className="text-xs text-muted-foreground">
                    Keep motivating each other! 🔥
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Gym Calendar
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {currentUserMonthlyVisits} visits this month • {otherUserMonthlyVisits} visits by {otherUser.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="h-12 rounded-md"></div>
              ))}
              
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const userVisited = hasVisitOnDate(currentUser.id, dateStr);
                const otherVisited = hasVisitOnDate(otherUser.id, dateStr);
                const todayDate = isToday(day);
                
                const isFutureDate = day > new Date();
                
                return (
                  <div 
                    key={dateStr} 
                    className={`h-12 rounded-md flex flex-col items-center justify-center text-sm relative ${
                      todayDate ? "ring-2 ring-primary ring-inset" : ""
                    } ${
                      isFutureDate ? "text-muted-foreground/50" : ""
                    }`}
                  >
                    <span className={`font-medium ${todayDate ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    <div className="flex space-x-1 mt-1">
                      {userVisited && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                      {otherVisited && (
                        <div className="w-2 h-2 rounded-full bg-couple-orange"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>You</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-couple-orange"></div>
                <span>{otherUser.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GymTracker;
