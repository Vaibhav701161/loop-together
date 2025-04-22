
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import ProofDialog from "@/components/pact/ProofDialog";
import { Pact, CompletionStatus } from "@/types";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    getTodaysPacts,
    getUserPendingPacts,
    getUserCompletedPacts,
    getPactStatus,
    calculateSummary,
  } = usePacts();
  const navigate = useNavigate();
  const [selectedPact, setSelectedPact] = useState<Pact | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);

  const currentUser = activeUser!;
  const otherUser = users.find(u => u.id !== currentUser.id)!;
  
  const userSummary = calculateSummary(currentUser.id);
  const otherUserSummary = calculateSummary(otherUser.id);
  
  const userPendingPacts = getUserPendingPacts(currentUser.id);
  const userCompletedPacts = getUserCompletedPacts(currentUser.id);
  const userPendingCount = userPendingPacts.length;
  const userCompletedCount = userCompletedPacts.length;
  const userTotalPacts = userPendingCount + userCompletedCount;
  const userProgress = userTotalPacts > 0 
    ? Math.round((userCompletedCount / userTotalPacts) * 100) 
    : 0;
    
  const handleProofSubmit = (pact: Pact) => {
    setSelectedPact(pact);
    setProofDialogOpen(true);
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

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-2 gradient-heading">Today's Dashboard</h1>
        <p className="text-muted-foreground mb-6">{today}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* User stats card */}
          <Card className="border-l-4 border-l-couple-purple card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <span className="text-couple-purple">{currentUser.name}'s</span> Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Today's pacts: {userCompletedCount}/{userTotalPacts}</span>
                <Badge variant={userProgress === 100 ? "default" : "outline"}>
                  {userProgress}%
                </Badge>
              </div>
              <Progress value={userProgress} className="h-2 mb-4" />
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-purple">{userSummary.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Current streak</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-purple">{userSummary.totalPacts}</p>
                  <p className="text-xs text-muted-foreground">Active pacts</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-purple">{userSummary.totalCompleted}</p>
                  <p className="text-xs text-muted-foreground">Total completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Partner stats card */}
          <Card className="border-l-4 border-l-couple-orange card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <span className="text-couple-orange">{otherUser.name}'s</span> Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-orange">{otherUserSummary.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Current streak</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-orange">{otherUserSummary.totalPacts}</p>
                  <p className="text-xs text-muted-foreground">Active pacts</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-2xl font-bold text-couple-orange">{otherUserSummary.totalCompleted}</p>
                  <p className="text-xs text-muted-foreground">Total completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Your Pending Pacts</h2>
            <Button size="sm" onClick={() => navigate("/create")}>
              Create New
            </Button>
          </div>
          
          {userPendingPacts.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-lg mb-2">🎉 All done for today!</p>
                <p className="text-sm text-muted-foreground">You have completed all your pacts for today.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userPendingPacts.map((pact) => (
                <Card key={pact.id} className="card-hover border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pact.title}</CardTitle>
                      {getStatusBadge(getPactStatus(pact.id, currentUser.id))}
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
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Completed Today</h2>
          
          {userCompletedPacts.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  No completed pacts yet today. Get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userCompletedPacts.map((pact) => (
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
          pact={selectedPact}
          open={proofDialogOpen}
          onOpenChange={setProofDialogOpen}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
