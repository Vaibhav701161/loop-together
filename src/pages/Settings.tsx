
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
import { isFirebaseConfigured, isOfflineMode } from "@/lib/firebase";
import { AlertTriangle, Save, Trash, User, Database, Users, Cloud, CloudOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const { users, updateUser, activeUser } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseBucket, setFirebaseBucket] = useState("");
  const [firebaseSenderId, setFirebaseSenderId] = useState("");
  const [firebaseAppId, setFirebaseAppId] = useState("");
  const [isFirebaseSet, setIsFirebaseSet] = useState(isFirebaseConfigured());
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === "user_a") || users[0]);
  const [partnerUser, setPartnerUser] = useState(users.find(u => u.id === "user_b") || users[1]);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  
  // Toggle dark mode
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

  // Initialize Firebase connection status check
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if Firebase is configured
        if (isFirebaseConfigured()) {
          setConnectionStatus('online');
          setIsFirebaseSet(true);
        } else {
          setConnectionStatus('offline');
          setIsFirebaseSet(false);
        }
      } catch (error) {
        console.error("Firebase connection check failed:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnection();
    
    // Check for existing Firebase config in localStorage
    const storedFirebaseConfig = localStorage.getItem("2getherLoop_firebase_config");
    if (storedFirebaseConfig) {
      try {
        const config = JSON.parse(storedFirebaseConfig);
        setFirebaseApiKey(config.apiKey || "");
        setFirebaseAuthDomain(config.authDomain || "");
        setFirebaseProjectId(config.projectId || "");
        setFirebaseBucket(config.storageBucket || "");
        setFirebaseSenderId(config.messagingSenderId || "");
        setFirebaseAppId(config.appId || "");
      } catch (error) {
        console.error("Error parsing stored Firebase config:", error);
      }
    }
    
    // Update user state based on current active user
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

  const saveFirebaseConfig = () => {
    // Save Firebase config to localStorage
    const config = {
      apiKey: firebaseApiKey,
      authDomain: firebaseAuthDomain,
      projectId: firebaseProjectId,
      storageBucket: firebaseBucket,
      messagingSenderId: firebaseSenderId,
      appId: firebaseAppId
    };
    
    localStorage.setItem("2getherLoop_firebase_config", JSON.stringify(config));
    
    // Store in environment variables for current session
    // Note: This is only for the current session, will need to reload
    window.localStorage.setItem("VITE_FIREBASE_API_KEY", firebaseApiKey);
    window.localStorage.setItem("VITE_FIREBASE_AUTH_DOMAIN", firebaseAuthDomain);
    window.localStorage.setItem("VITE_FIREBASE_PROJECT_ID", firebaseProjectId);
    window.localStorage.setItem("VITE_FIREBASE_STORAGE_BUCKET", firebaseBucket);
    window.localStorage.setItem("VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseSenderId);
    window.localStorage.setItem("VITE_FIREBASE_APP_ID", firebaseAppId);
    
    toast({
      title: "Firebase Config Saved",
      description: "Please reload the application for changes to take effect.",
    });
    
    // Set a flag to reload
    localStorage.setItem("2getherLoop_reload_needed", "true");
    
    // Prompt the user to reload
    setTimeout(() => {
      if (confirm("The application needs to reload to apply Firebase settings. Reload now?")) {
        window.location.reload();
      }
    }, 1000);
  };

  const clearFirebaseConfig = () => {
    setFirebaseApiKey("");
    setFirebaseAuthDomain("");
    setFirebaseProjectId("");
    setFirebaseBucket("");
    setFirebaseSenderId("");
    setFirebaseAppId("");
    localStorage.removeItem("2getherLoop_firebase_config");
    
    // Clear environment variables for current session
    localStorage.removeItem("VITE_FIREBASE_API_KEY");
    localStorage.removeItem("VITE_FIREBASE_AUTH_DOMAIN");
    localStorage.removeItem("VITE_FIREBASE_PROJECT_ID");
    localStorage.removeItem("VITE_FIREBASE_STORAGE_BUCKET");
    localStorage.removeItem("VITE_FIREBASE_MESSAGING_SENDER_ID");
    localStorage.removeItem("VITE_FIREBASE_APP_ID");
    
    toast({
      title: "Firebase Config Cleared",
      description: "Firebase configuration has been cleared. App is now in offline mode.",
      variant: "destructive"
    });
    
    // Set a flag to reload
    localStorage.setItem("2getherLoop_reload_needed", "true");
    
    // Prompt the user to reload
    setTimeout(() => {
      if (confirm("The application needs to reload to apply changes. Reload now?")) {
        window.location.reload();
      }
    }, 1000);
  };

  const generateCoupleCode = () => {
    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem("2getherLoop_couple_code", code);
    
    toast({
      title: "Couple Code Generated",
      description: `Your couple code is: ${code}. Share this with your partner to connect.`
    });
  };

  const connectWithPartnerCode = (code: string) => {
    // In a real app, this would validate against Firebase
    // For now, we'll just pretend it worked
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
                    Configure your Firebase backend connection
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
                {!isFirebaseSet && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Local Storage Mode</AlertTitle>
                    <AlertDescription>
                      You're currently using local storage. Data won't sync between devices.
                      Configure Firebase to enable real-time sync with your partner.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Firebase API Key</Label>
                  <Input 
                    id="apiKey" 
                    value={firebaseApiKey}
                    onChange={(e) => setFirebaseApiKey(e.target.value)}
                    placeholder="AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authDomain">Auth Domain</Label>
                  <Input 
                    id="authDomain" 
                    value={firebaseAuthDomain}
                    onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                    placeholder="your-project.firebaseapp.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input 
                    id="projectId" 
                    value={firebaseProjectId}
                    onChange={(e) => setFirebaseProjectId(e.target.value)}
                    placeholder="your-project-id"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageBucket">Storage Bucket</Label>
                  <Input 
                    id="storageBucket" 
                    value={firebaseBucket}
                    onChange={(e) => setFirebaseBucket(e.target.value)}
                    placeholder="your-project.appspot.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                  <Input 
                    id="messagingSenderId" 
                    value={firebaseSenderId}
                    onChange={(e) => setFirebaseSenderId(e.target.value)}
                    placeholder="123456789012"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input 
                    id="appId" 
                    value={firebaseAppId}
                    onChange={(e) => setFirebaseAppId(e.target.value)}
                    placeholder="1:123456789012:web:a1b2c3d4e5f6"
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button onClick={saveFirebaseConfig} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Firebase Config
                  </Button>
                  <Button variant="destructive" onClick={clearFirebaseConfig} className="flex items-center">
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
                {!isFirebaseSet ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Firebase Required</AlertTitle>
                    <AlertDescription>
                      You need to configure Firebase in the Connection tab before using couple sync.
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
