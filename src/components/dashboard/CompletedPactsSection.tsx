
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pact } from "@/types";

interface CompletedPactsSectionProps {
  completedCount: number;
  completedPacts: Pact[];
}

const CompletedPactsSection: React.FC<CompletedPactsSectionProps> = ({ 
  completedCount, 
  completedPacts 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Completed Today</h2>
      
      {completedCount === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              No completed pacts yet today. Get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {completedPacts.map((pact) => (
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
  );
};

export default CompletedPactsSection;
