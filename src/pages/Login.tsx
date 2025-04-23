
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { checkSupabaseConnection } from "@/lib/supabase";
import { AlertCircle, CloudOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const Login: React.FC = () => {
  const { users, updateUsers, login, isLoading } = useAuth();
  const [personA, setPersonA] = useState(users[0]?.name || "Person A");
  const [personB, setPersonB] = useState(users[1]?.name || "Person B");
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    
    checkConnection();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (personA.trim() === "" || personB.trim() === "") {
      return; // Don't submit if names are empty
    }
    
    // Update user names
    const updatedUsers = [
      { ...users[0], name: personA.trim() },
      { ...users[1], name: personB.trim() }
    ];
    updateUsers(updatedUsers);
    
    // Log in as person A
    login("user_a");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-couple-purple/20 to-couple-light-pink/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-heading">2getherLoop</h1>
          <p className="text-xl text-purple-700">Track habits together, grow closer 👫</p>
          
          {connectionStatus === 'connected' ? (
            <Badge variant="outline" className="mt-2">
              Cloud Sync Enabled
            </Badge>
          ) : connectionStatus === 'disconnected' ? (
            <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-800 border-amber-300">
              <CloudOff className="h-3 w-3 mr-1" />
              Offline Mode
            </Badge>
          ) : null}
        </div>
        
        {connectionStatus === 'disconnected' && (
          <Alert className="mb-4" variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Working Offline</AlertTitle>
            <AlertDescription>
              No connection to the cloud database. Your data will be stored locally until connection is restored.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Welcome to 2getherLoop!</CardTitle>
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
                  className="border-couple-purple/50"
                  disabled={isLoading}
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
                  className="border-couple-orange/50"
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-couple-purple to-couple-pink"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start Tracking Together"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Made with 💖 for couples tracking their journey together</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
