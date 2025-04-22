
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Star, 
  Dumbbell, 
  Party 
} from "lucide-react";

const Comparison: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    pacts, 
    logs, 
    getPactStreak, 
    calculateSummary 
  } = usePacts();
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const user1Summary = calculateSummary(currentUser.id);
  const user2Summary = calculateSummary(otherUser.id);
  
  // Calculate weekly stats
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const getWeeklyCompletedCount = (userId: string) => {
    return logs.filter(log => 
      log.userId === userId && 
      log.status === "completed" && 
      isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd })
    ).length;
  };
  
  const getWeeklyFailedCount = (userId: string) => {
    return logs.filter(log => 
      log.userId === userId && 
      log.status === "failed" && 
      isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd })
    ).length;
  };
  
  const user1WeeklyCompleted = getWeeklyCompletedCount(currentUser.id);
  const user2WeeklyCompleted = getWeeklyCompletedCount(otherUser.id);
  const user1WeeklyFailed = getWeeklyFailedCount(currentUser.id);
  const user2WeeklyFailed = getWeeklyFailedCount(otherUser.id);
  
  // Get all active pacts for each user
  const user1Pacts = pacts.filter(pact => 
    pact.assignedTo === currentUser.id || pact.assignedTo === "both"
  );
  
  const user2Pacts = pacts.filter(pact => 
    pact.assignedTo === otherUser.id || pact.assignedTo === "both"
  );
  
  // Find longest streaks for each user
  const user1Streaks = user1Pacts.map(pact => getPactStreak(pact.id));
  const user2Streaks = user2Pacts.map(pact => getPactStreak(pact.id));
  
  const user1LongestStreak = user1Streaks.length > 0 
    ? Math.max(...user1Streaks.map(streak => streak.longest))
    : 0;
    
  const user2LongestStreak = user2Streaks.length > 0 
    ? Math.max(...user2Streaks.map(streak => streak.longest))
    : 0;
  
  // Find current longest streak for each user
  const user1CurrentLongestStreak = user1Streaks.length > 0 
    ? Math.max(...user1Streaks.map(streak => streak.current))
    : 0;
    
  const user2CurrentLongestStreak = user2Streaks.length > 0 
    ? Math.max(...user2Streaks.map(streak => streak.current))
    : 0;
  
  // Determine who's winning in different categories
  const activePactsWinner = user1Pacts.length > user2Pacts.length 
    ? currentUser.id 
    : user2Pacts.length > user1Pacts.length 
      ? otherUser.id 
      : "tie";
      
  const weeklyCompletedWinner = user1WeeklyCompleted > user2WeeklyCompleted 
    ? currentUser.id 
    : user2WeeklyCompleted > user1WeeklyCompleted 
      ? otherUser.id 
      : "tie";
      
  const failedTasksWinner = user1WeeklyFailed < user2WeeklyFailed 
    ? currentUser.id 
    : user2WeeklyFailed < user1WeeklyFailed 
      ? otherUser.id 
      : "tie";
      
  const longestStreakWinner = user1LongestStreak > user2LongestStreak 
    ? currentUser.id 
    : user2LongestStreak > user1LongestStreak 
      ? otherUser.id 
      : "tie";
      
  const currentStreakWinner = user1CurrentLongestStreak > user2CurrentLongestStreak 
    ? currentUser.id 
    : user2CurrentLongestStreak > user1CurrentLongestStreak 
      ? otherUser.id 
      : "tie";
  
  // Get winner emoji
  const getWinnerEmoji = (winnerId: string | "tie") => {
    if (winnerId === "tie") return "🤝";
    return winnerId === currentUser.id ? "🔥" : "🚀";
  };
  
  // Calculate overall weekly success rate
  const user1WeeklyTotal = user1WeeklyCompleted + user1WeeklyFailed;
  const user2WeeklyTotal = user2WeeklyCompleted + user2WeeklyFailed;
  
  const user1SuccessRate = user1WeeklyTotal > 0 
    ? Math.round((user1WeeklyCompleted / user1WeeklyTotal) * 100) 
    : 0;
    
  const user2SuccessRate = user2WeeklyTotal > 0 
    ? Math.round((user2WeeklyCompleted / user2WeeklyTotal) * 100) 
    : 0;
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-heading mb-2">Partner Comparison</h1>
          <p className="text-muted-foreground">
            See how you and {otherUser.name} compare in your pact journey!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Stats
              </CardTitle>
              <CardDescription>
                {currentUser.name}'s Achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span>Active Pacts</span>
                  <Badge variant="outline" className="text-primary">
                    {user1Pacts.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed This Week</span>
                  <Badge variant="outline" className="text-green-500">
                    {user1WeeklyCompleted}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed This Week</span>
                  <Badge variant="outline" className="text-red-500">
                    {user1WeeklyFailed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Streak</span>
                  <Badge variant="outline" className="text-amber-500">
                    {user1CurrentLongestStreak} days
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Longest Streak</span>
                  <Badge variant="outline" className="text-purple-500">
                    {user1LongestStreak} days
                  </Badge>
                </div>
              </div>
              
              <div className="pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Weekly Success Rate</span>
                  <span className="text-sm font-medium">{user1SuccessRate}%</span>
                </div>
                <Progress value={user1SuccessRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-couple-orange">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                {otherUser.name}'s Stats
              </CardTitle>
              <CardDescription>
                Partner's Achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span>Active Pacts</span>
                  <Badge variant="outline" className="text-couple-orange">
                    {user2Pacts.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed This Week</span>
                  <Badge variant="outline" className="text-green-500">
                    {user2WeeklyCompleted}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed This Week</span>
                  <Badge variant="outline" className="text-red-500">
                    {user2WeeklyFailed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Streak</span>
                  <Badge variant="outline" className="text-amber-500">
                    {user2CurrentLongestStreak} days
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Longest Streak</span>
                  <Badge variant="outline" className="text-purple-500">
                    {user2LongestStreak} days
                  </Badge>
                </div>
              </div>
              
              <div className="pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Weekly Success Rate</span>
                  <span className="text-sm font-medium">{user2SuccessRate}%</span>
                </div>
                <Progress value={user2SuccessRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Who's Leading?
            </CardTitle>
            <CardDescription>
              This week's pact comparison between you and {otherUser.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="font-medium">Active Pacts</span>
                    </div>
                    <span className="text-xl">{getWinnerEmoji(activePactsWinner)}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1Pacts.length}</span>
                    <span>{otherUser.name}: {user2Pacts.length}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {activePactsWinner === "tie" 
                      ? "It's a tie!" 
                      : activePactsWinner === currentUser.id 
                        ? "You're taking on more pacts!" 
                        : `${otherUser.name} is taking on more pacts!`
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Completed Tasks</span>
                    </div>
                    <span className="text-xl">{getWinnerEmoji(weeklyCompletedWinner)}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1WeeklyCompleted}</span>
                    <span>{otherUser.name}: {user2WeeklyCompleted}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {weeklyCompletedWinner === "tie" 
                      ? "You're both equally productive!" 
                      : weeklyCompletedWinner === currentUser.id 
                        ? "You've completed more tasks!" 
                        : `${otherUser.name} has completed more tasks!`
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="font-medium">Failed Less</span>
                    </div>
                    <span className="text-xl">{getWinnerEmoji(failedTasksWinner)}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1WeeklyFailed}</span>
                    <span>{otherUser.name}: {user2WeeklyFailed}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {failedTasksWinner === "tie" 
                      ? "You both have the same number of failures." 
                      : failedTasksWinner === currentUser.id 
                        ? "You've failed fewer tasks!" 
                        : `${otherUser.name} has failed fewer tasks!`
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="font-medium">Current Streak</span>
                    </div>
                    <span className="text-xl">{getWinnerEmoji(currentStreakWinner)}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1CurrentLongestStreak} days</span>
                    <span>{otherUser.name}: {user2CurrentLongestStreak} days</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {currentStreakWinner === "tie" 
                      ? "You're both on the same streak!" 
                      : currentStreakWinner === currentUser.id 
                        ? "You're on a longer streak!" 
                        : `${otherUser.name} is on a longer streak!`
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-medium">Longest Streak</span>
                    </div>
                    <span className="text-xl">{getWinnerEmoji(longestStreakWinner)}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1LongestStreak} days</span>
                    <span>{otherUser.name}: {user2LongestStreak} days</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {longestStreakWinner === "tie" 
                      ? "You both have impressive streaks!" 
                      : longestStreakWinner === currentUser.id 
                        ? "Your record streak is longer!" 
                        : `${otherUser.name}'s record streak is longer!`
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Success Rate</span>
                    </div>
                    <span className="text-xl">
                      {user1SuccessRate > user2SuccessRate ? "🔥" : 
                       user2SuccessRate > user1SuccessRate ? "🚀" : "🤝"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>You: {user1SuccessRate}%</span>
                    <span>{otherUser.name}: {user2SuccessRate}%</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-muted text-center text-sm">
                    {user1SuccessRate === user2SuccessRate 
                      ? "You're both equally successful!" 
                      : user1SuccessRate > user2SuccessRate
                        ? "You have a higher success rate!" 
                        : `${otherUser.name} has a higher success rate!`
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Party className="h-5 w-5 mr-2" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-xl font-bold">
                {user1SuccessRate === user2SuccessRate
                  ? "It's a tie! You're both doing great!"
                  : user1SuccessRate > user2SuccessRate
                    ? `You're in the lead this week! ${Math.abs(user1SuccessRate - user2SuccessRate)}% ahead of ${otherUser.name}.`
                    : `${otherUser.name} is ahead this week! ${Math.abs(user2SuccessRate - user1SuccessRate)}% ahead of you.`
                }
              </div>
              
              <p className="text-muted-foreground">
                Remember, this isn't about competition but about supporting each other! 
                Keep working together to achieve your goals.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
                <div className="bg-muted/30 p-3 rounded-md text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Pacts</div>
                  <div className="text-xl font-bold">{user1Pacts.length + user2Pacts.length}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Completed</div>
                  <div className="text-xl font-bold text-green-500">{user1Summary.totalCompleted + user2Summary.totalCompleted}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Comparison;
