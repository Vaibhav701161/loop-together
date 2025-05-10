
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Pact, CompletionStatus } from "@/types";

interface PendingPactsSectionProps {
  pendingCount: number;
  pendingPacts: Pact[];
  getStatusBadge: (status: CompletionStatus) => React.ReactNode;
  onProofSubmit: (pact: Pact) => void;
}

const PendingPactsSection: React.FC<PendingPactsSectionProps> = ({ 
  pendingCount, 
  pendingPacts, 
  getStatusBadge, 
  onProofSubmit 
}) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Your Pending Pacts</h2>
        <Button size="sm" onClick={() => navigate("/create")}>
          Create New
        </Button>
      </div>
      
      {pendingCount === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-10 w-10 text-secondary mb-2" />
            <p className="text-lg mb-2">🎉 All done for today!</p>
            <p className="text-sm text-muted-foreground">You have completed all your pacts for today.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingPacts.map((pact) => (
            <PendingPactCard 
              key={pact.id} 
              pact={pact} 
              getStatusBadge={getStatusBadge} 
              onProofSubmit={onProofSubmit} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PendingPactCardProps {
  pact: Pact;
  getStatusBadge: (status: CompletionStatus) => React.ReactNode;
  onProofSubmit: (pact: Pact) => void;
}

const PendingPactCard: React.FC<PendingPactCardProps> = ({ pact, getStatusBadge, onProofSubmit }) => {
  return (
    <Card key={pact.id} className="card-hover border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{pact.title}</CardTitle>
          {getStatusBadge(pact.status as CompletionStatus)}
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
          onClick={() => onProofSubmit(pact)}
        >
          Complete Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingPactsSection;
