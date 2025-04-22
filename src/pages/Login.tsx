
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { users, updateUsers, login } = useAuth();
  const [personA, setPersonA] = useState(users[0]?.name || "Person A");
  const [personB, setPersonB] = useState(users[1]?.name || "Person B");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user names
    const updatedUsers = [
      { ...users[0], name: personA },
      { ...users[1], name: personB }
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
        </div>
        
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
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-couple-purple to-couple-pink">
                Start Tracking Together
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
