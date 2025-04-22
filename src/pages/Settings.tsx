import React, { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { exportAppData, importAppData } from "@/utils/dataExport";
import { 
  Download, Upload, Palette, Moon, Sun, CloudCog, 
  User, UserCog, Database, RefreshCw, ArrowLeftRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { users, activeUser, updateUser } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("2getherLoop_theme") || "light");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("2getherLoop_theme", newTheme);
    
    // Apply theme to document
    document.documentElement.classList.remove("light", "dark", "couple-mode");
    document.documentElement.classList.add(newTheme);
    
    toast({
      title: "Theme updated",
      description: `Theme set to ${newTheme}`,
    });
  };

  const handleExport = () => {
    const success = exportAppData();
    if (success) {
      toast({
        title: "Data exported successfully",
        description: "Your backup file has been downloaded",
      });
    } else {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const message = await importAppData(file);
      toast({
        title: "Import successful",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateUsername = (userId: string, newName: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      updateUser({ ...userToUpdate, name: newName });
      toast({
        title: "Name updated",
        description: `User profile name updated to ${newName}`,
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 gradient-heading">Settings</h1>

        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="h-4 w-4 mr-2" />
              Data & Backup
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserCog className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-4">
                    <Label>Select Theme</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-24 p-4"
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="h-8 w-8 mb-2" />
                        <span>Light</span>
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-24 p-4"
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="h-8 w-8 mb-2" />
                        <span>Dark</span>
                      </Button>
                      <Button 
                        variant={theme === "couple-mode" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-24 p-4"
                        onClick={() => handleThemeChange("couple-mode")}
                      >
                        <Palette className="h-8 w-8 mb-2" />
                        <span>Couple Mode</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="animations" defaultChecked />
                    <Label htmlFor="animations">Enable animations</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, import, or reset your app data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2 flex items-center">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Backup & Restore
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your data to a file for backup or to transfer to another device.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleExport}
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleImportClick}
                      disabled={importing}
                      className="flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {importing ? "Importing..." : "Import Data"}
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CloudCog className="h-4 w-4 mr-2" />
                    Sync Options
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Local storage is currently being used. Cloud sync is coming soon!
                  </p>
                  <div className="flex items-center space-x-2 opacity-60">
                    <Switch id="cloud-sync" disabled />
                    <Label htmlFor="cloud-sync">Enable cloud sync (Coming Soon)</Label>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <h3 className="font-medium mb-2 text-destructive">Reset Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete all your data and cannot be undone.
                  </p>
                  <Button variant="destructive" disabled>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Profiles</CardTitle>
                <CardDescription>
                  Update user profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-primary/10 rounded-full p-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`name-${user.id}`} className="text-sm">
                          Display Name
                        </Label>
                        <Input 
                          id={`name-${user.id}`}
                          defaultValue={user.name}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          const input = document.getElementById(`name-${user.id}`) as HTMLInputElement;
                          handleUpdateUsername(user.id, input.value);
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
