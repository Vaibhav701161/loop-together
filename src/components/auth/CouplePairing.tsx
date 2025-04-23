
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserPlus, Users, KeyRound, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCoupleCode, createCouplePairing, validateCoupleCode } from "@/lib/supabase";

interface CouplePairingProps {
  onCreatePair: (code: string) => void;
  onJoinPair: (code: string) => void;
  isConfigured: boolean;
}

const CouplePairing: React.FC<CouplePairingProps> = ({ onCreatePair, onJoinPair, isConfigured }) => {
  const [pairingCode, setPairingCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Generate a random 6-character code
      const code = generateCoupleCode();
      setGeneratedCode(code);
      
      // Create the pairing in Supabase/localStorage
      const success = await createCouplePairing(code, "user_a");
      
      if (success) {
        // Copy to clipboard
        navigator.clipboard.writeText(code).catch(() => {
          // Clipboard API might not be available in some browsers
          console.warn("Could not copy to clipboard");
        });
        
        toast({
          title: "Code Generated",
          description: "Your couple code has been generated and copied to clipboard."
        });
        
        // Notify parent component
        onCreatePair(code);
      } else {
        setError("Could not generate couple code. Please try again.");
        toast({
          title: "Error",
          description: "Could not generate couple code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setError("Could not generate couple code. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate couple code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinWithCode = async () => {
    setError(null);
    
    if (!pairingCode.trim()) {
      setError("Please enter a valid pairing code.");
      toast({
        title: "Invalid Code",
        description: "Please enter a valid pairing code.",
        variant: "destructive"
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Validate the code with Supabase/localStorage
      const partnerUserId = await validateCoupleCode(pairingCode.trim());
      
      if (partnerUserId) {
        // Save the connection locally as well
        localStorage.setItem("2getherLoop_partner_code", pairingCode.trim());
        localStorage.setItem("2getherLoop_partner_id", partnerUserId);
        
        toast({
          title: "Success",
          description: "Successfully connected with your partner's account.",
        });
        onJoinPair(pairingCode.trim());
      } else {
        setError("The code you entered is invalid or expired.");
        toast({
          title: "Invalid Code",
          description: "The code you entered is invalid or expired.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating code:", error);
      setError("Could not validate couple code. Please try again.");
      toast({
        title: "Error",
        description: "Could not validate couple code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (!isConfigured) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Required</AlertTitle>
        <AlertDescription>
          To pair with your partner, you need to configure Supabase in the Settings page.
          For now, you can continue in offline mode.
        </AlertDescription>
        <div className="mt-2">
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => onCreatePair("LOCAL_MODE")}
          >
            Continue in Offline Mode
          </Button>
        </div>
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
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Couple Code"}
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
                  disabled={isJoining}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isJoining ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CouplePairing;
