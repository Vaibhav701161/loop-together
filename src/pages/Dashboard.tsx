
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ProofDialog from "@/components/pact/ProofDialog";
import StreakHeatmap from "@/components/streak/StreakHeatmap";
import { Pact, CompletionStatus } from "@/types";
import SuccessAnimation from "@/components/pact/SuccessAnimation";
import { useConnectionStatus } from "@/components/ui/connection-status";
import { useSupabase } from "@/context/SupabaseContext";

// Import the new components
import UserStatsCard from "@/components/dashboard/UserStatsCard";
import PendingPactsSection from "@/components/dashboard/PendingPactsSection";
import CompletedPactsSection from "@/components/dashboard/CompletedPactsSection";
import ConnectionAlert from "@/components/dashboard/ConnectionAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

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

  return (
    <Layout>
      <SuccessAnimation show={showSuccessAnimation}>
        <div className="container mx-auto max-w-4xl">
          <DashboardHeader connectionStatus={connectionStatus} />
          
          <ConnectionAlert 
            isDisconnected={connectionStatus === 'disconnected'} 
            isConfigured={isConfigured} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <UserStatsCard 
              user={currentUser} 
              stats={userStats} 
              colorClass="border-l-couple-purple" 
              nameClass="text-couple-purple" 
            />
            <UserStatsCard 
              user={otherUser} 
              stats={otherUserStats} 
              colorClass="border-l-couple-orange" 
              nameClass="text-couple-orange" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <PendingPactsSection 
              pendingCount={userStats.pendingCount}
              pendingPacts={getUserPendingPacts(currentUserId)}
              getStatusBadge={(status) => getStatusBadge(status)}
              onProofSubmit={handleProofSubmit}
            />
            
            <div>
              <StreakHeatmap userId={currentUserId} />
            </div>
          </div>
          
          <CompletedPactsSection 
            completedCount={userStats.completedCount}
            completedPacts={getUserCompletedPacts(currentUserId)}
          />
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
