
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, BarChart3, Eye, Users, CreditCard, Star, 
  MoreHorizontal, PlusCircle, FileCode, Settings, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toolsData, Tool } from "../data/mockData";

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [developerTools, setDeveloperTools] = useState<Tool[]>([]);
  
  useEffect(() => {
    // Check authentication and redirect if needed
    const token = localStorage.getItem("userToken");
    const role = localStorage.getItem("userRole");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUserRole(role);
    
    // If user is not a developer, redirect to user dashboard
    if (role !== "developer") {
      navigate("/dashboard");
    }
    
    // Mock developer's tools
    setDeveloperTools(toolsData.slice(0, 3));
  }, [navigate]);
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor your AI tools</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button onClick={() => navigate("/developer/publish")} className="gap-2">
            <Plus className="h-4 w-4" />
            Publish New Tool
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Views</CardTitle>
            <CardDescription>Total tool views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">1.2k</span>
              <span className="ml-2 text-xs text-muted-foreground">this month</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              +18% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Usages</CardTitle>
            <CardDescription>Total tool executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">738</span>
              <span className="ml-2 text-xs text-muted-foreground">this month</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              +24% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Revenue</CardTitle>
            <CardDescription>Monthly earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">$342</span>
              <span className="ml-2 text-xs text-muted-foreground">this month</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              +5% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg. Rating</CardTitle>
            <CardDescription>User satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">4.8</span>
              <span className="ml-2 text-xs text-muted-foreground">/ 5</span>
            </div>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`h-3 w-3 ${star <= 4 ? "text-secondary fill-secondary" : "text-secondary fill-secondary"}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="tools">
            <TabsList className="mb-4">
              <TabsTrigger value="tools">My Tools</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <FileCode className="mr-2 h-5 w-5" />
                    Your Published Tools
                  </CardTitle>
                  <CardDescription>
                    Manage and monitor your AI tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {developerTools.length > 0 ? (
                      developerTools.map(tool => (
                        <div key={tool.id} className="border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center mr-4">
                                <Zap className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{tool.title}</h3>
                                <p className="text-sm text-muted-foreground">{tool.category}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
                            <div className="flex space-x-6">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{tool.views} Views</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{tool.usages} Uses</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{tool.rating} Rating</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/developer/tool/${tool.id}`)}>
                              Manage
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileCode className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium mb-2">No tools published yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Start by publishing your first AI tool to reach users
                        </p>
                        <Button onClick={() => navigate("/developer/publish")}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Publish Your First Tool
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => navigate("/developer/publish")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>
                    Insights into how your tools are performing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Monthly Views</h3>
                      <div className="h-40 bg-muted/50 rounded-md flex items-end justify-around p-4">
                        {[40, 65, 50, 80, 120, 100, 90, 110, 130, 95, 105, 150].map((height, i) => (
                          <div key={i} className="relative w-4 group">
                            <div 
                              className="bg-primary rounded-t h-full transition-opacity hover:opacity-80" 
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {height * 10}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-3">Tool Performance</h3>
                      <div className="space-y-3">
                        {developerTools.map(tool => (
                          <div key={tool.id} className="bg-muted/30 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <p className="font-medium">{tool.title}</p>
                                <p className="text-xs text-muted-foreground">{tool.category}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Views</p>
                                <p className="font-medium">{tool.views.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Uses</p>
                                <p className="font-medium">{tool.usages.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Rating</p>
                                <p className="font-medium">{tool.rating} / 5</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Available for withdrawal</h3>
                  <Button variant="outline" size="sm">Withdraw</Button>
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="text-3xl font-bold mb-1">$462.50</div>
                  <p className="text-sm text-muted-foreground">
                    Next payout: Dec 15, 2023
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Recent Transactions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Monthly Payout</p>
                      <p className="text-xs text-muted-foreground">Nov 15, 2023</p>
                    </div>
                    <p className="text-green-600">+$285.20</p>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Tool Purchase: TextGenie Pro</p>
                      <p className="text-xs text-muted-foreground">Nov 8, 2023</p>
                    </div>
                    <p className="text-green-600">+$29.99</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Monthly Payout</p>
                      <p className="text-xs text-muted-foreground">Oct 15, 2023</p>
                    </div>
                    <p className="text-green-600">+$210.75</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Payment Settings</h3>
                <div className="bg-muted/30 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">••••4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <Settings className="h-4 w-4" />
                    </Button>
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

export default DeveloperDashboard;
