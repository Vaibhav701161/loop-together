
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { checkSupabaseConnection, hasValidSupabaseCredentials } from "@/lib/supabase";
import { AlertCircle, CloudOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import CouplePairing from "@/components/auth/CouplePairing";
import { useSupabase } from "@/context/SupabaseContext";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { users, updateUsers, login, isLoading } = useAuth();
  const { isConfigured, connectionStatus, initializeSchema } = useSupabase();
  const [personA, setPersonA] = useState(users[0]?.name || "Person A");
  const [personB, setPersonB] = useState(users[1]?.name || "Person B");
  const [showCouplePairing, setShowCouplePairing] = useState(false);
  const [initializingDb, setInitializingDb] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If names were previously set and we're returning to login page,
    // populate the fields
    if (users[0]?.name) setPersonA(users[0].name);
    if (users[1]?.name) setPersonB(users[1].name);
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (personA.trim() === "" || personB.trim() === "") {
      toast({
        title: "Missing Names",
        description: "Please enter names for both people.",
        variant: "destructive"
      });
      return;
    }
    
    // Update user names
    const updatedUsers = [
      { ...users[0], name: personA.trim() },
      { ...users[1], name: personB.trim() }
    ];
    updateUsers(updatedUsers);
    
    // Try to initialize schema if Supabase is configured
    if (isConfigured && connectionStatus !== 'connected') {
      setInitializingDb(true);
      try {
        await initializeSchema();
        setInitializingDb(false);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setInitializingDb(false);
      }
    }
    
    // Check if we need to show couple pairing first
    if (isConfigured && !showCouplePairing) {
      setShowCouplePairing(true);
    } else {
      // Log in as person A
      login("user_a");
      navigate("/dashboard");
    }
  };

  const handleCreatePair = (code: string) => {
    // Save the code locally
    localStorage.setItem("BitBuddies_couple_code", code);
    toast({
      title: "Buddy Code Created",
      description: `Your buddy code is: ${code}. Share this with your buddy.`
    });
    
    // Continue to login
    login("user_a");
    navigate("/dashboard");
  };

  const handleJoinPair = (code: string) => {
    toast({
      title: "Successfully Paired",
      description: "You have successfully connected with your buddy's account."
    });
    
    login("user_b");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bit-light-purple to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/1431f3f2-33e9-448e-95bc-c31245063ba3.png" 
              alt="BitBuddies logo" 
              className="h-20 w-auto" 
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-heading">BitBuddies</h1>
          <p className="text-xl text-bit-purple">Track habits together, grow closer 👫</p>
          
          {connectionStatus === 'connected' ? (
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-800 border-green-300">
              Cloud Sync Ready
            </Badge>
          ) : connectionStatus === 'checking' ? (
            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-800 border-blue-300">
              Checking Connection...
            </Badge>
          ) : (
            <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-800 border-amber-300">
              <CloudOff className="h-3 w-3 mr-1" />
              Offline Mode
            </Badge>
          )}
        </div>
        
        {connectionStatus === 'unconfigured' && (
          <Alert className="mb-4 neumorph" variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Working Offline</AlertTitle>
            <AlertDescription>
              No connection to the cloud database. Your data will be stored locally until connection is configured.
            </AlertDescription>
          </Alert>
        )}
        
        {showCouplePairing ? (
          <CouplePairing 
            onCreatePair={handleCreatePair}
            onJoinPair={handleJoinPair}
            isConfigured={isConfigured}
          />
        ) : null}
        
        <Card className="w-full neumorph">
          <CardHeader>
            <CardTitle className="text-center gradient-heading">Welcome to BitBuddies!</CardTitle>
            <CardDescription className="text-center">
              Enter your names to get started with tracking goals together
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personA">Person A</Label>
                <Input
                  id="personA"
                  value={personA}
                  onChange={(e) => setPersonA(e.target.value)}
                  placeholder="Enter person A's name"
                  className="border-bit-purple/50 neumorph-inset"
                  disabled={isLoading || initializingDb}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personB">Person B</Label>
                <Input
                  id="personB"
                  value={personB}
                  onChange={(e) => setPersonB(e.target.value)}
                  placeholder="Enter person B's name"
                  className="border-bit-orange/50 neumorph-inset"
                  disabled={isLoading || initializingDb}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gradient-btn"
                disabled={isLoading || initializingDb}
              >
                {isLoading || initializingDb ? "Loading..." : (showCouplePairing ? "Next" : "Start Tracking Together")}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Made with 💖 for buddies tracking their journey together</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
