import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasValidSupabaseCredentials, checkSupabaseConnection } from "@/lib/supabase";
import { AlertTriangle, Save, Trash, User, Database, Users, Cloud, CloudOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabase } from "@/context/SupabaseContext";

const Settings = () => {
  const { users, updateUser, activeUser } = useAuth();
  const { isConfigured } = useSupabase();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [isSupabaseSet, setIsSupabaseSet] = useState(false);
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === "user_a") || users[0]);
  const [partnerUser, setPartnerUser] = useState(users.find(u => u.id === "user_b") || users[1]);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  
  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("2getherLoop_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("2getherLoop_theme", "light");
    }
    
    toast({
      title: `${newMode ? "Dark" : "Light"} mode activated`,
      description: `Theme has been set to ${newMode ? "dark" : "light"} mode.`
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (hasValidSupabaseCredentials()) {
          const isConnected = await checkSupabaseConnection();
          setConnectionStatus(isConnected ? 'online' : 'offline');
          setIsSupabaseSet(true);
        } else {
          setConnectionStatus('offline');
          setIsSupabaseSet(false);
        }
      } catch (error) {
        console.error("Supabase connection check failed:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnection();
    
    const storedSupabaseUrl = localStorage.getItem("VITE_SUPABASE_URL");
    const storedSupabaseAnonKey = localStorage.getItem("VITE_SUPABASE_ANON_KEY");
    
    if (storedSupabaseUrl) setSupabaseUrl(storedSupabaseUrl);
    if (storedSupabaseAnonKey) setSupabaseAnonKey(storedSupabaseAnonKey);
    
    if (activeUser) {
      if (activeUser.id === "user_a") {
        setCurrentUser(users.find(u => u.id === "user_a") || users[0]);
        setPartnerUser(users.find(u => u.id === "user_b") || users[1]);
      } else {
        setCurrentUser(users.find(u => u.id === "user_b") || users[1]);
        setPartnerUser(users.find(u => u.id === "user_a") || users[0]);
      }
    }
  }, [activeUser, users]);

  const handleUserUpdate = (userId: string, name: string) => {
    const userToUpdate = users.find(user => user.id === userId);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, name };
      updateUser(updatedUser);
      
      if (userId === currentUser.id) {
        setCurrentUser(updatedUser);
      } else {
        setPartnerUser(updatedUser);
      }
      
      toast({
        title: "User Updated",
        description: "User name has been updated successfully."
      });
    }
  };

  const saveSupabaseConfig = () => {
    localStorage.setItem("VITE_SUPABASE_URL", supabaseUrl);
    localStorage.setItem("VITE_SUPABASE_ANON_KEY", supabaseAnonKey);
    
    toast({
      title: "Supabase Config Saved",
      description: "Please reload the application for changes to take effect.",
    });
    
    localStorage.setItem("2getherLoop_reload_needed", "true");
    
    setTimeout(() => {
      if (confirm("The application needs to reload to apply Supabase settings. Reload now?")) {
        window.location.reload();
      }
    }, 1000);
  };

  const clearSupabaseConfig = () => {
    setSupabaseUrl("");
    setSupabaseAnonKey("");
    localStorage.removeItem("VITE_SUPABASE_URL");
    localStorage.removeItem("VITE_SUPABASE_ANON_KEY");
    
    toast({
      title: "Supabase Config Cleared",
      description: "Supabase configuration has been cleared. App is now in offline mode.",
      variant: "destructive"
    });
    
    localStorage.setItem("2getherLoop_reload_needed", "true");
    
    setTimeout(() => {
      if (confirm("The application needs to reload to apply changes. Reload now?")) {
        window.location.reload();
      }
    }, 1000);
  };

  const generateCoupleCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem("2getherLoop_couple_code", code);
    
    toast({
      title: "Couple Code Generated",
      description: `Your couple code is: ${code}. Share this with your partner to connect.`
    });
  };

  const connectWithPartnerCode = (code: string) => {
    toast({
      title: "Connected with Partner",
      description: "Successfully connected with your partner's account."
    });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4">
        <h1 className="text-2xl font-bold mb-6 gradient-heading">Settings</h1>
        
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="connection">
              <Database className="mr-2 h-4 w-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="couple">
              <Users className="mr-2 h-4 w-4" />
              Couple Sync
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your profile and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Your Name</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="username" 
                      value={currentUser?.name || ""} 
                      onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))} 
                    />
                    <Button onClick={() => handleUserUpdate(currentUser.id, currentUser.name)}>
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partnername">Partner's Name</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="partnername" 
                      value={partnerUser?.name || ""} 
                      onChange={(e) => setPartnerUser(prev => ({ ...prev, name: e.target.value }))} 
                    />
                    <Button onClick={() => handleUserUpdate(partnerUser.id, partnerUser.name)}>
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleDarkModeToggle} />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connection" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Database Connection</CardTitle>
                  <CardDescription>
                    Configure your Supabase backend connection
                  </CardDescription>
                </div>
                {connectionStatus === 'online' ? (
                  <div className="flex items-center text-green-500">
                    <Cloud className="mr-1 h-5 w-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-500">
                    <CloudOff className="mr-1 h-5 w-5" />
                    <span className="text-sm font-medium">Local Mode</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!isSupabaseSet && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Local Storage Mode</AlertTitle>
                    <AlertDescription>
                      You're currently using local storage. Data won't sync between devices.
                      Configure Supabase to enable real-time sync with your partner.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">Supabase URL</Label>
                  <Input 
                    id="supabaseUrl" 
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
                  <Input 
                    id="supabaseKey" 
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="your-anon-key"
                    type="password"
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button onClick={saveSupabaseConfig} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Supabase Config
                  </Button>
                  <Button variant="destructive" onClick={clearSupabaseConfig} className="flex items-center">
                    <Trash className="mr-2 h-4 w-4" />
                    Clear Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="couple" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Couple Synchronization</CardTitle>
                <CardDescription>
                  Connect and sync with your partner across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConfigured ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Supabase Required</AlertTitle>
                    <AlertDescription>
                      You need to configure Supabase in the Connection tab before using couple sync.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2 border p-4 rounded-md bg-secondary/20">
                      <h3 className="font-semibold">Generate Your Couple Code</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Generate a unique code that your partner can use to connect with your account
                      </p>
                      <Button onClick={generateCoupleCode}>
                        Generate Couple Code
                      </Button>
                    </div>
                    
                    <div className="h-px bg-border my-4"></div>
                    
                    <div className="space-y-2 border p-4 rounded-md bg-secondary/20">
                      <h3 className="font-semibold">Connect With Partner</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter the code your partner has shared with you
                      </p>
                      <div className="flex gap-2">
                        <Input placeholder="Enter partner code (e.g. AB123C)" />
                        <Button>Connect</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
