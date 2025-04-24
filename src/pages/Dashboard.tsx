import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import ProofDialog from "@/components/pact/ProofDialog";
import StreakHeatmap from "@/components/streak/StreakHeatmap";
import { Pact, CompletionStatus } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuccessAnimation from "@/components/pact/SuccessAnimation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConnectionStatus, useConnectionStatus } from "@/components/ui/connection-status";
import { useSupabase } from "@/context/SupabaseContext";

const Dashboard: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    getTodaysPacts,
    getUserPendingPacts,
    getUserCompletedPacts,
    getPactStatus,
    calculateSummary,
    isLoading,
    isError
  } = usePacts();
  const { isConfigured } = useSupabase();
  const navigate = useNavigate();
  const [selectedPact, setSelectedPact] = useState<Pact | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const connectionStatus = useConnectionStatus();

  if (!activeUser || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl p-4 text-center py-12">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Fetching your pacts and data</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const currentUser = activeUser;
  const otherUser = users.find(u => u.id !== currentUser.id)!;

  const currentUserId = currentUser.id as "user_a" | "user_b";
  const otherUserId = otherUser.id as "user_a" | "user_b";

  const getUserStats = (userId: "user_a" | "user_b") => {
    const summary = calculateSummary(userId);
    const pendingPacts = getUserPendingPacts(userId);
    const completedPacts = getUserCompletedPacts(userId);
    const pendingCount = pendingPacts.length;
    const completedCount = completedPacts.length;
    const totalPacts = pendingCount + completedCount;
    const progress = totalPacts > 0 
      ? Math.round((completedCount / totalPacts) * 100) 
      : 0;
    return {
      summary,
      pendingCount,
      completedCount,
      totalPacts,
      progress,
    }
  }

  const userStats = getUserStats(currentUserId);
  const otherUserStats = getUserStats(otherUserId);

  const handleProofSubmit = (pact: Pact) => {
    setSelectedPact(pact);
    setProofDialogOpen(true);
  };

  const handleProofDialogOpenChange = (open: boolean) => {
    setProofDialogOpen(open);
    
    if (!open && selectedPact) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    }
  };

  const getStatusBadge = (status: CompletionStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed ✓</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed ✗</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const today = format(new Date(), "EEEE, MMMM do");

  const renderUserStatsCard = (
    user: typeof currentUser,
    userStats: ReturnType<typeof getUserStats>,
    colorClass: string,
    nameClass: string,
  ) => (
    <Card className={`border-l-4 ${colorClass} card-hover`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <span className={nameClass}>{user.name}'s</span> Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Today's pacts: {userStats.completedCount}/{userStats.totalPacts}
          </span>
          <Badge variant={userStats.progress === 100 ? "default" : "outline"}>
            {userStats.progress}%
          </Badge>
        </div>
        <Progress value={userStats.progress} className="h-2 mb-4" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{userStats.summary.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{userStats.summary.totalPacts}</p>
            <p className="text-xs text-muted-foreground">Active pacts</p>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{userStats.summary.totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <SuccessAnimation show={showSuccessAnimation}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold gradient-heading">Today's Dashboard</h1>
            <ConnectionStatus status={connectionStatus} />
          </div>
          
          <p className="text-muted-foreground mb-6">{today}</p>
          
          {connectionStatus === 'disconnected' && isConfigured && (
            <Alert className="mb-6" variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connecting to Cloud...</AlertTitle>
              <AlertDescription>
                Your data is currently stored locally. Your changes will be synced when connection is established.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {renderUserStatsCard(currentUser, userStats, "border-l-couple-purple", "text-couple-purple")}
            {renderUserStatsCard(otherUser, otherUserStats, "border-l-couple-orange", "text-couple-orange")}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Your Pending Pacts</h2>
                <Button size="sm" onClick={() => navigate("/create")}>
                  Create New
                </Button>
              </div>
              
              {userStats.pendingCount === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Sparkles className="h-10 w-10 text-secondary mb-2" />
                    <p className="text-lg mb-2">🎉 All done for today!</p>
                    <p className="text-sm text-muted-foreground">You have completed all your pacts for today.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {getUserPendingPacts(currentUserId).map((pact) => (
                    <Card key={pact.id} className="card-hover border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{pact.title}</CardTitle>
                          {getStatusBadge(getPactStatus(pact.id, currentUserId))}
                        </div>
                        <CardDescription>
                          Due by {pact.deadline} • {pact.frequency}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {pact.description && (
                          <p className="text-sm mb-2">{pact.description}</p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>Proof type: {pact.proofType}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={() => handleProofSubmit(pact)}
                        >
                          Complete Task
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <StreakHeatmap userId={currentUserId} />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Completed Today</h2>
            
            {userStats.completedCount === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground">
                    No completed pacts yet today. Get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getUserCompletedPacts(currentUserId).map((pact) => (
                  <Card key={pact.id} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-md">{pact.title}</CardTitle>
                        <Badge className="bg-green-500">Completed ✓</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {selectedPact && (
          <ProofDialog
            pactId={selectedPact.id}
            date={new Date().toISOString()}
            proofType={selectedPact.proofType as any}
            onComplete={() => setProofDialogOpen(false)}
          />
        )}
      </SuccessAnimation>
    </Layout>
  );
};

export default Dashboard;
