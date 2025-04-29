
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Star, BarChart3, Zap, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toolsData } from "../data/mockData";

interface UserActivity {
  id: string;
  type: "view" | "use" | "favorite";
  toolId: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  
  useEffect(() => {
    // Check authentication and redirect if needed
    const token = localStorage.getItem("userToken");
    const role = localStorage.getItem("userRole");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUserRole(role);
    
    // If user is a developer, redirect to developer dashboard
    if (role === "developer") {
      navigate("/developer");
    }
    
    // Generate mock activity data
    const mockActivity: UserActivity[] = [
      {
        id: "1",
        type: "use",
        toolId: "1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: "2",
        type: "favorite",
        toolId: "2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: "3",
        type: "view",
        toolId: "4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
      },
      {
        id: "4",
        type: "use",
        toolId: "3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        id: "5",
        type: "view",
        toolId: "5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
      }
    ];
    
    setRecentActivity(mockActivity);
  }, [navigate]);
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  const getToolById = (id: string) => {
    return toolsData.find(tool => tool.id === id) || { title: 'Unknown Tool', category: 'other' };
  };
  
  const favoriteTools = toolsData.slice(0, 3); // Mock favorite tools
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Tools Used</CardTitle>
            <CardDescription>Total usage across all tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">24</span>
              <span className="ml-2 text-sm text-muted-foreground">times</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Saved Tools</CardTitle>
            <CardDescription>Tools you've favorited</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">7</span>
              <span className="ml-2 text-sm text-muted-foreground">tools</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Added 2 new this month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Credits Balance</CardTitle>
            <CardDescription>Available API usage credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">500</span>
              <span className="ml-2 text-sm text-muted-foreground">credits</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Free tier - 500 credits/month
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="activity">
            <TabsList className="mb-4">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="favorites">Favorite Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Your Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your interactions with AI tools over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentActivity.map(activity => {
                      const tool = getToolById(activity.toolId);
                      return (
                        <div key={activity.id} className="flex items-start">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mr-3">
                            {activity.type === 'view' && <History className="h-4 w-4" />}
                            {activity.type === 'use' && <Zap className="h-4 w-4" />}
                            {activity.type === 'favorite' && <Star className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">
                                {activity.type === 'view' && 'Viewed'}
                                {activity.type === 'use' && 'Used'}
                                {activity.type === 'favorite' && 'Favorited'}
                                {' '}
                                <span className="text-primary">{tool.title}</span>
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Category: {tool.category}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/history")}
                    >
                      View Full History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Your Favorite Tools
                  </CardTitle>
                  <CardDescription>
                    Tools you've saved for quick access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {favoriteTools.map(tool => (
                      <div 
                        key={tool.id}
                        className="border rounded-lg p-4 hover:bg-accent/10 transition-colors cursor-pointer"
                        onClick={() => navigate(`/tool/${tool.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{tool.title}</h3>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <Star className="h-4 w-4 text-secondary fill-secondary" />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/favorites")}
                    >
                      View All Favorites
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Monthly Usage</p>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[65%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>325 / 500 credits</span>
                    <span>65%</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Top Categories Used</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Writing</span>
                        <span>42%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div className="h-1.5 bg-primary rounded-full w-[42%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Design</span>
                        <span>28%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div className="h-1.5 bg-secondary rounded-full w-[28%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Analysis</span>
                        <span>18%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div className="h-1.5 bg-accent rounded-full w-[18%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Other</span>
                        <span>12%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div className="h-1.5 bg-muted-foreground rounded-full w-[12%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Subscription Plan</p>
                  <div className="bg-muted/50 rounded-lg border p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-xs text-muted-foreground">500 credits/month</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
                        <Settings className="h-3 w-3 mr-1" />
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
