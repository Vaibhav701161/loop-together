import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  parseISO, 
  isToday, 
  isYesterday, 
  subDays, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  differenceInDays 
} from "date-fns";
import { BookOpen, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PactTimeline: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    pacts, 
    logs, 
    getPact, 
    getPactStatus,
  } = usePacts();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7" | "14" | "30">("7");
  const [selectedUser, setSelectedUser] = useState<"user_a" | "user_b" | "both">("both");
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const today = new Date();
  const startDate = subDays(today, parseInt(selectedTimeframe));
  const daysInTimeframe = eachDayOfInterval({ start: startDate, end: today });
  const daysToShow = [...daysInTimeframe].reverse();
  
  const getLogsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    return logs.filter(log => {
      if (log.date !== dateStr) return false;
      if (selectedUser !== "both" && log.userId !== selectedUser) return false;
      
      return true;
    }).sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "completed") return -1;
        if (b.status === "completed") return 1;
        if (a.status === "failed") return -1;
        if (b.status === "failed") return 1;
      }
      
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      
      return 0;
    });
  };
  
  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };
  
  const weeks = daysToShow.reduce((acc, day) => {
    const weekStartDate = startOfWeek(day, { weekStartsOn: 1 });
    const weekEndDate = endOfWeek(day, { weekStartsOn: 1 });
    const weekKey = `${format(weekStartDate, "MMM d")} - ${format(weekEndDate, "MMM d")}`;
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    
    acc[weekKey].push(day);
    return acc;
  }, {} as Record<string, Date[]>);
  
  const getUserName = (userId: string) => {
    return users.find(user => user.id === userId)?.name || userId;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const renderProof = (proof: string) => {
    if (!proof) return null;
    
    if (proof.startsWith('http') || proof.startsWith('blob:') || proof.startsWith('data:image')) {
      return (
        <div className="mt-2 relative w-full aspect-video bg-muted rounded-md overflow-hidden">
          <img src={proof} alt="Proof" className="object-cover w-full h-full" />
        </div>
      );
    }
    
    return (
      <div className="mt-2 bg-muted/30 p-3 rounded-md text-sm">
        {proof}
      </div>
    );
  };
  
  const renderTimelineLogs = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const logsForDay = getLogsForDay(date);
    
    if (logsForDay.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No pact activities recorded for this day.
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {logsForDay.map(log => {
          const pact = getPact(log.pactId);
          if (!pact) return null;
          
          const statusIcon = 
            log.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : log.status === "failed" ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            );
          
          return (
            <Card key={log.id} className={`border-l-4 ${
              log.status === "completed" 
                ? "border-l-green-500" 
                : log.status === "failed" 
                  ? "border-l-red-500" 
                  : "border-l-gray-300"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {statusIcon}
                    </div>
                    <div>
                      <h3 className="font-medium">{pact.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getUserName(log.userId)} • 
                        {log.completedAt ? ` ${format(parseISO(log.completedAt), "h:mm a")}` : ""}
                      </p>
                      
                      {log.proof && (
                        <div className="mt-2">
                          {renderProof(log.proof.content)}
                        </div>
                      )}
                      
                      {log.comment && (
                        <div className="bg-muted/30 p-2 rounded text-sm mt-2">
                          <p className="text-xs font-medium mb-1">Comment:</p>
                          {log.comment}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Pact Timeline</h1>
          <div className="flex gap-2">
            <Select
              value={selectedTimeframe}
              onValueChange={(value) => setSelectedTimeframe(value as "7" | "14" | "30")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedUser}
              onValueChange={(value) => setSelectedUser(value as "user_a" | "user_b" | "both")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Both users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both users</SelectItem>
                <SelectItem value={currentUser.id}>You</SelectItem>
                <SelectItem value={otherUser.id}>{otherUser.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-6 space-y-6">
            {daysToShow.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const formattedDate = formatDate(day);
              const logsForDay = getLogsForDay(day);
              
              return (
                <div key={dateStr}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">{formattedDate}</h2>
                    {logsForDay.length > 0 && (
                      <Badge variant="outline">{logsForDay.length} activities</Badge>
                    )}
                  </div>
                  
                  {renderTimelineLogs(day)}
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-6 space-y-8">
            {Object.entries(weeks).map(([weekLabel, days]) => {
              const totalLogs = days.reduce((total, day) => 
                total + getLogsForDay(day).length, 0
              );
              
              const completedLogs = days.reduce((total, day) => 
                total + getLogsForDay(day).filter(log => log.status === "completed").length, 0
              );
              
              const failedLogs = days.reduce((total, day) => 
                total + getLogsForDay(day).filter(log => log.status === "failed").length, 0
              );
              
              return (
                <Card key={weekLabel}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Week of {weekLabel}
                    </CardTitle>
                    <CardDescription>
                      {totalLogs} activities • {completedLogs} completed • {failedLogs} failed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {days.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayName = format(day, "EEEE");
                        const formattedDate = format(day, "MMM d");
                        const logsForDay = getLogsForDay(day);
                        
                        if (logsForDay.length === 0) return null;
                        
                        return (
                          <div key={dateStr}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium">
                                {dayName}, {formattedDate}
                              </span>
                              <Badge variant="outline">{logsForDay.length} activities</Badge>
                            </div>
                            
                            {renderTimelineLogs(day)}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PactTimeline;
