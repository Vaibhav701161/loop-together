
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useConnectionStatus, ConnectionStatus } from "@/components/ui/connection-status";
import { hasValidSupabaseCredentials } from "@/lib/supabase";
import { AlertTriangle, Save, InfoIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Settings: React.FC = () => {
  const { activeUser, users, updateUser } = useAuth();
  const { toast } = useToast();
  const connectionStatus = useConnectionStatus();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("2getherLoop_theme") || "light";
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("2getherLoop_notifications") !== "disabled";
  });
  
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || localStorage.getItem("SUPABASE_URL") || ""
  );
  
  const [supabaseKey, setSupabaseKey] = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem("SUPABASE_ANON_KEY") || ""
  );
  
  const [userName, setUserName] = useState(activeUser?.name || "");
  const [partnerName, setPartnerName] = useState(users.find(u => u.id !== activeUser?.id)?.name || "");
  
  useEffect(() => {
    // Apply theme
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("2getherLoop_theme", theme);
  }, [theme]);
  
  useEffect(() => {
    // Save notification preferences
    localStorage.setItem("2getherLoop_notifications", notificationsEnabled ? "enabled" : "disabled");
  }, [notificationsEnabled]);
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  const handleSaveSupabase = () => {
    localStorage.setItem("SUPABASE_URL", supabaseUrl);
    localStorage.setItem("SUPABASE_ANON_KEY", supabaseKey);
    
    toast({
      title: "Settings Saved",
      description: "Please reload the app for changes to take effect."
    });
  };
  
  const handleSaveNames = () => {
    if (userName.trim() && partnerName.trim()) {
      const currentUser = users.find(u => u.id === activeUser?.id);
      const partner = users.find(u => u.id !== activeUser?.id);
      
      if (currentUser) {
        updateUser({
          ...currentUser,
          name: userName.trim()
        });
      }
      
      if (partner) {
        updateUser({
          ...partner,
          name: partnerName.trim()
        });
      }
      
      toast({
        title: "Names Updated",
        description: "Your names have been updated successfully."
      });
    } else {
      toast({
        title: "Names Required",
        description: "Both names must be filled out.",
        variant: "destructive"
      });
    }
  };
  
  const handleResetApp = () => {
    // Clear local storage except for theme
    const savedTheme = localStorage.getItem("2getherLoop_theme");
    localStorage.clear();
    if (savedTheme) localStorage.setItem("2getherLoop_theme", savedTheme);
    
    toast({
      title: "App Reset",
      description: "All app data has been cleared. Please reload the app."
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold gradient-heading mb-6">Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Connection Status</CardTitle>
                <ConnectionStatus status={connectionStatus} />
              </div>
              <CardDescription>
                Configure your Supabase connection for data sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
                <Input
                  id="supabaseKey"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  type="password"
                  placeholder="Your Supabase anon/public key"
                />
              </div>
              
              {!hasValidSupabaseCredentials() && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Supabase is not configured</p>
                    <p className="mt-1">The app is running in local storage mode. Your data won't be synced or backed up.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSupabase} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Connection Settings
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the app's appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>
                Update your names in the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="partnerName">Partner's Name</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNames}>Save Names</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure app notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer">
                  Enable app notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                Advanced settings and app management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Reset App Data</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset App Data</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <p className="mb-2">This will delete ALL app data, including:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>All pacts and their completion records</li>
                        <li>All notes and milestones</li>
                        <li>Connection settings and preferences</li>
                      </ul>
                      <p className="mt-4 font-semibold">This action cannot be undone!</p>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleResetApp}
                      >
                        Reset All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <div className="mt-4">
                  <Separator className="my-4" />
                  <div className="flex items-start gap-2 text-muted-foreground text-sm">
                    <InfoIcon className="h-4 w-4 mt-0.5" />
                    <p>
                      2getherLoop v1.0.0<br />
                      <span className="opacity-70">Last updated: April 2023</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
