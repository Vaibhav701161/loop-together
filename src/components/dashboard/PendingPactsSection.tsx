
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pact } from "@/types";
import { format } from "date-fns";

interface PendingPactsSectionProps {
  pendingPacts: Pact[];
  onPactClick: (id: string) => void;
}

const PendingPactsSection: React.FC<PendingPactsSectionProps> = ({ 
  pendingPacts,
  onPactClick
}) => {
  // Helper function to format dates
  const formatDate = (date: Date | string) => {
    if (!date) return "No date";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Helper function to determine background class based on pact type
  const getPactTypeClass = (pactType: string | undefined) => {
    if (!pactType) return "border-l-muted";
    
    switch (pactType) {
      case "fitness":
        return "border-l-bit-purple";
      case "study":
        return "border-l-bit-orange";
      case "productivity":
        return "border-l-bit-pink";
      default:
        return "border-l-muted";
    }
  };

  if (pendingPacts.length === 0) {
    return (
      <Card className="mb-6 neumorph animate-fade-in">
        <CardHeader>
          <CardTitle>Pending Pacts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending pacts yet. Create a new pact to get started!</p>
          <Button className="mt-4 gradient-btn text-white" onClick={() => window.location.href = "/create"}>
            Create New Pact
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 neumorph animate-fade-in">
      <CardHeader>
        <CardTitle>Pending Pacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingPacts.map((pact) => (
            <div
              key={pact.id}
              className={`p-4 border-l-4 bg-card rounded-md shadow-sm hover:shadow transition-all cursor-pointer ${getPactTypeClass(pact.type)}`}
              onClick={() => onPactClick(pact.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{pact.title}</h3>
                  <p className="text-muted-foreground text-sm">{pact.description}</p>
                </div>
                <div className="text-right">
                  {pact.deadline && (
                    <>
                      <span className="text-xs text-muted-foreground">Due by:</span>
                      <p className="font-medium">{formatDate(pact.startDate)}</p>
                    </>
                  )}
                  
                  {/* Connection status indicator - using a simple colored dot for now */}
                  <div className="flex items-center justify-end mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    <span className="text-xs text-muted-foreground">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingPactsSection;
