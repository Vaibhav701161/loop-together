import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const History: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    pacts, 
    logs, 
    getPactStreak, 
    getPactStatus, 
    getPact,
    calculateSummary,
  } = usePacts();
  
  const [selectedUser, setSelectedUser] = useState<"user_a" | "user_b">(activeUser?.id || "user_a");
  
  const userPacts = pacts.filter(pact => 
    pact.assignedTo === selectedUser || pact.assignedTo === "both"
  );
  
  const userSummary = calculateSummary(selectedUser);
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });
  
  const dailyCompletionData = last7Days.map(date => {
    const dayLogs = logs.filter(log => 
      log.date === date && log.userId === selectedUser
    );
    
    const completed = dayLogs.filter(log => log.status === "completed").length;
    const total = userPacts.length;
    
    return {
      date,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  });

  const pactStreaks = userPacts.map(pact => ({
    pact,
    streak: getPactStreak(pact.id)
  })).sort((a, b) => b.streak.current - a.streak.current);

  const recentLogs = [...logs]
    .filter(log => log.userId === selectedUser)
    .sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime())
    .slice(0, 10);

  const { toast } = useToast();

  const handleDelete = (logId: string) => {
    deleteLog(logId);
    toast({
      title: "Log Deleted",
      description: "The activity log has been removed."
    });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Analytics & History</h1>
          <Select
            value={selectedUser}
            onValueChange={value => setSelectedUser(value as "user_a" | "user_b")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-3xl font-bold text-primary">{userSummary.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Current streak</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-3xl font-bold text-primary">{userSummary.totalCompleted}</p>
                    <p className="text-sm text-muted-foreground">Total completed</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-3xl font-bold text-primary">{userPacts.length}</p>
                    <p className="text-sm text-muted-foreground">Active pacts</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Last 7 Days Completion Rate</h3>
                  <div className="space-y-2">
                    {dailyCompletionData.map((day, index) => (
                      <div key={day.date} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{format(parseISO(day.date), "EEE, MMM d")}</span>
                          <span>{Math.round(day.percentage)}%</span>
                        </div>
                        <Progress value={day.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="streaks" className="mt-4">
            <div className="space-y-4">
              {pactStreaks.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No pacts found for this user.</p>
                  </CardContent>
                </Card>
              ) : (
                pactStreaks.map(({ pact, streak }) => (
                  <Card key={pact.id} className="overflow-hidden">
                    <div className={`h-1 ${pact.color || "bg-primary"}`} />
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{pact.title}</h3>
                        <Badge>
                          {streak.current} day{streak.current !== 1 ? "s" : ""} streak
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div className="bg-muted/40 rounded p-2">
                          <p className="font-bold">{streak.current}</p>
                          <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <p className="font-bold">{streak.longest}</p>
                          <p className="text-xs text-muted-foreground">Longest</p>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <p className="font-bold">{streak.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentLogs.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    No recent activity found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentLogs.map(log => {
                      const pact = getPact(log.pactId);
                      if (!pact) return null;
                      
                      return (
                        <div key={log.id} className="flex items-start gap-2 pb-3 border-b">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            log.status === "completed" ? "bg-green-500" : 
                            log.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                          }`} />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{pact.title}</p>
                              <Badge variant={
                                log.status === "completed" ? "default" :
                                log.status === "failed" ? "destructive" : "outline"
                              }>
                                {log.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {log.completedAt && format(new Date(log.completedAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default History;
