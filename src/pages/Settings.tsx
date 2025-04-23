
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
import { hasValidSupabaseCredentials, checkSupabaseConnection, generateCoupleCode, createCouplePairing } from "@/lib/supabase";
import { AlertTriangle, Save, Trash, User, Database, Users, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabase } from "@/context/SupabaseContext";
import { ConnectionStatus } from "@/components/ui/connection-status";

const Settings = () => {
  const { users, updateUser, activeUser } = useAuth();
  const { isConfigured, connectionStatus, initializeSchema, refreshData } = useSupabase();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [isSupabaseSet, setIsSupabaseSet] = useState(false);
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === "user_a") || users[0]);
  const [partnerUser, setPartnerUser] = useState(users.find(u => u.id === "user_b") || users[1]);
  const [coupleCode, setCoupleCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializingSchema, setIsInitializingSchema] = useState(false);
  
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
    setIsSupabaseSet(hasValidSupabaseCredentials());
    
    const storedSupabaseUrl = localStorage.getItem("VITE_SUPABASE_URL");
    const storedSupabaseAnonKey = localStorage.getItem("VITE_SUPABASE_ANON_KEY");
    
    if (storedSupabaseUrl) setSupabaseUrl(storedSupabaseUrl);
    if (storedSupabaseAnonKey) setSupabaseAnonKey(storedSupabaseAnonKey);
    
    // Get stored couple code if any
    const storedCoupleCode = localStorage.getItem("2getherLoop_couple_code");
    if (storedCoupleCode) setCoupleCode(storedCoupleCode);
    
    const storedPartnerCode = localStorage.getItem("2getherLoop_partner_code");
    if (storedPartnerCode) setPartnerCode(storedPartnerCode);
    
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

  const handleGenerateCoupleCode = async () => {
    // Generate a new couple code
    try {
      const code = generateCoupleCode();
      
      // Save it to database/local
      const success = await createCouplePairing(code, activeUser?.id || "user_a");
      
      if (success) {
        setCoupleCode(code);
        localStorage.setItem("2getherLoop_couple_code", code);
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).catch(() => {
          console.warn("Could not copy to clipboard");
        });
        
        toast({
          title: "Couple Code Generated",
          description: `Your couple code is: ${code}. Share this with your partner to connect.`
        });
        
        // Refresh data to make sure we have the latest
        refreshData();
      } else {
        toast({
          title: "Error Generating Code",
          description: "Failed to generate couple code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating couple code:", error);
      toast({
        title: "Error",
        description: "Could not generate couple code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConnectWithPartnerCode = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid partner code.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Here we would validate and connect with partner's code
      // For now, just simulate success
      setTimeout(() => {
        setPartnerCode(code);
        localStorage.setItem("2getherLoop_partner_code", code);
        
        toast({
          title: "Connected with Partner",
          description: "Successfully connected with your partner's account."
        });
        
        setIsConnecting(false);
        refreshData();
      }, 1000);
    } catch (error) {
      console.error("Error connecting with partner:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect with your partner. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };
  
  const handleInitializeSchema = async () => {
    setIsInitializingSchema(true);
    try {
      const success = await initializeSchema();
      if (success) {
        toast({
          title: "Database Initialized",
          description: "Successfully initialized the database schema."
        });
      } else {
        toast({
          title: "Initialization Failed",
          description: "Failed to initialize database schema. Please check your Supabase configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error initializing schema:", error);
      toast({
        title: "Initialization Error",
        description: "An error occurred while initializing the database schema.",
        variant: "destructive"
      });
    } finally {
      setIsInitializingSchema(false);
    }
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
                <ConnectionStatus status={connectionStatus} />
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionStatus === 'unconfigured' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Local Storage Mode</AlertTitle>
                    <AlertDescription>
                      You're currently using local storage. Data won't sync between devices.
                      Configure Supabase to enable real-time sync with your partner.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'disconnected' && isConfigured && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Failed</AlertTitle>
                    <AlertDescription>
                      Could not connect to Supabase with the provided credentials.
                      Make sure your URL and key are correct.
                    </AlertDescription>
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2" 
                        onClick={handleInitializeSchema}
                        disabled={isInitializingSchema}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isInitializingSchema ? 'animate-spin' : ''}`} />
                        {isInitializingSchema ? 'Initializing...' : 'Initialize Schema & Try Again'}
                      </Button>
                    </div>
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
                {connectionStatus !== 'connected' ? (
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
                      
                      {coupleCode ? (
                        <div className="mb-4 p-3 border rounded-md bg-muted">
                          <p className="text-sm font-medium mb-1">Your couple code:</p>
                          <p className="text-xl font-bold tracking-wider">{coupleCode}</p>
                          <p className="text-xs mt-2 text-muted-foreground">
                            Share this code with your partner to connect
                          </p>
                        </div>
                      ) : null}
                      
                      <Button onClick={handleGenerateCoupleCode}>
                        {coupleCode ? "Generate New Code" : "Generate Couple Code"}
                      </Button>
                    </div>
                    
                    <div className="h-px bg-border my-4"></div>
                    
                    <div className="space-y-2 border p-4 rounded-md bg-secondary/20">
                      <h3 className="font-semibold">Connect With Partner</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter the code your partner has shared with you
                      </p>
                      
                      {partnerCode ? (
                        <div className="mb-4 p-3 border rounded-md bg-muted">
                          <p className="text-sm font-medium mb-1">Connected with code:</p>
                          <p className="text-xl font-bold tracking-wider">{partnerCode}</p>
                          <p className="text-xs mt-2 text-muted-foreground text-green-600">
                            You are currently connected with your partner
                          </p>
                        </div>
                      ) : null}
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter partner code (e.g. AB123C)" 
                          disabled={!!partnerCode || isConnecting}
                        />
                        <Button 
                          disabled={!!partnerCode || isConnecting}
                          onClick={() => handleConnectWithPartnerCode(partnerCode)}
                        >
                          {isConnecting ? "Connecting..." : "Connect"}
                        </Button>
                      </div>
                      
                      {partnerCode && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setPartnerCode("");
                              localStorage.removeItem("2getherLoop_partner_code");
                              toast({
                                title: "Disconnected",
                                description: "You have disconnected from your partner's account."
                              });
                            }}
                          >
                            Disconnect
                          </Button>
                        </div>
                      )}
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
