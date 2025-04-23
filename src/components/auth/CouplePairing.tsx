
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserPlus, Users, KeyRound, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CouplePairingProps {
  onCreatePair: (code: string) => void;
  onJoinPair: (code: string) => void;
  isConfigured: boolean;
}

const CouplePairing: React.FC<CouplePairingProps> = ({ onCreatePair, onJoinPair, isConfigured }) => {
  const [pairingCode, setPairingCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const { toast } = useToast();

  const handleGenerateCode = () => {
    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    onCreatePair(code);
    
    // Copy to clipboard
    navigator.clipboard.writeText(code);
    
    toast({
      title: "Code Generated",
      description: "Your couple code has been generated and copied to clipboard."
    });
  };

  const handleJoinWithCode = () => {
    if (!pairingCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid pairing code.",
        variant: "destructive"
      });
      return;
    }
    
    onJoinPair(pairingCode.trim());
  };

  if (!isConfigured) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Required</AlertTitle>
        <AlertDescription>
          To pair with your partner, you need to configure Firebase in the Settings page.
          For now, you can continue in offline mode.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="text-center">Pair with your Partner</CardTitle>
        <CardDescription className="text-center">
          Create or join a couple pairing to sync your pacts together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="create">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Pairing
            </TabsTrigger>
            <TabsTrigger value="join">
              <Users className="mr-2 h-4 w-4" />
              Join Existing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a unique code to share with your partner
              </p>
              
              <Button 
                onClick={handleGenerateCode}
                className="w-full bg-gradient-to-r from-couple-purple to-couple-pink"
              >
                Generate Couple Code
              </Button>
              
              {generatedCode && (
                <div className="mt-4 p-4 border rounded-md bg-muted">
                  <p className="text-sm font-medium mb-1">Your couple code:</p>
                  <p className="text-2xl font-bold tracking-wider">{generatedCode}</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Share this code with your partner to connect
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the code your partner shared with you
              </p>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter code (e.g. AB123C)" 
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                    className="text-center tracking-wider font-semibold"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  onClick={handleJoinWithCode}
                  className="w-full bg-gradient-to-r from-couple-purple to-couple-pink"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CouplePairing;
