
import React, { useState } from "react";
import { Bell, Key, User, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useConnectionStatus } from "../components/ui/connection-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasValidSupabaseCredentials } from "@/lib/supabase";

const Settings: React.FC = () => {
  const connectionStatus = useConnectionStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      // Show success message
    }, 1500);
  };
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Tabs defaultValue="profile" orientation="vertical" className="w-full">
            <TabsList className="flex flex-col items-start h-auto bg-transparent space-y-1">
              <TabsTrigger value="profile" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="connections" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Connections
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1">
          <Card>
            <TabsContent value="profile" className="mt-0">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and public profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Alex" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Johnson" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="alex@example.com" />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      defaultValue="AI enthusiast interested in generative models and productivity tools."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="public-profile" />
                    <Label htmlFor="public-profile">Make profile public</Label>
                  </div>
                  
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="security">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-2fa" />
                    <Label htmlFor="enable-2fa">Enable two-factor authentication</Label>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="notifications">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">New Tool Alerts</p>
                      <p className="text-sm text-muted-foreground">Notify when new tools are added</p>
                    </div>
                    <Switch id="new-tool-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Tool Updates</p>
                      <p className="text-sm text-muted-foreground">Notify when tools you use are updated</p>
                    </div>
                    <Switch id="tool-updates" defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">Receive promotional content</p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="billing">
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Current Plan</h3>
                    <div className="bg-muted/50 border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">Free Plan</p>
                          <p className="text-sm text-muted-foreground">500 credits/month</p>
                        </div>
                        <Button>Upgrade</Button>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full w-[65%]"></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>325 / 500 credits used</span>
                        <span>Resets in 12 days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Payment Methods</h3>
                    <div className="border rounded-lg divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded mr-3">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-3">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Billing History</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 text-sm font-medium grid grid-cols-3">
                        <span>Date</span>
                        <span>Amount</span>
                        <span>Status</span>
                      </div>
                      <div className="divide-y">
                        <div className="px-4 py-3 grid grid-cols-3 text-sm">
                          <span>Nov 15, 2023</span>
                          <span>$0.00</span>
                          <span className="text-green-600">Free Plan</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-3 text-sm">
                          <span>Oct 15, 2023</span>
                          <span>$0.00</span>
                          <span className="text-green-600">Free Plan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="connections">
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>
                  Manage integrations with external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">API Credentials</h3>
                    <div className="p-4 bg-muted/30 rounded-lg mb-4">
                      <p className="text-sm mb-2">
                        Your API key allows you to integrate AI ToolKart with other services
                      </p>
                      <div className="flex items-center mb-2">
                        <div className="flex-grow bg-background rounded border px-3 py-2 font-mono text-sm">
                          ••••••••••••••••••••••••••6f3a
                        </div>
                        <Button variant="outline" className="ml-2">
                          Copy
                        </Button>
                        <Button variant="ghost" className="ml-2">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Supabase Connection</h3>
                    <div className="bg-muted/30 p-4 rounded-lg border mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium mb-1">Database Connection</p>
                          <div className="flex items-center">
                            <div 
                              className={`h-2 w-2 rounded-full mr-2 ${
                                connectionStatus === "connected" ? "bg-green-500" : 
                                connectionStatus === "checking" ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`} 
                            />
                            <p className="text-sm text-muted-foreground">
                              {connectionStatus === "connected" ? "Connected" : 
                               connectionStatus === "checking" ? "Checking connection..." :
                               connectionStatus === "unconfigured" ? "Not configured" :
                               "Disconnected"}
                            </p>
                          </div>
                        </div>
                        <Button disabled={!hasValidSupabaseCredentials()}>
                          {hasValidSupabaseCredentials() ? "Configure" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Connected Apps</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded mr-3">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Stripe</p>
                            <p className="text-xs text-muted-foreground">Payment processing</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded mr-3">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">GitHub</p>
                            <p className="text-xs text-muted-foreground">Code repository</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect New Service
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
