
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BookmarkPlus, Share2, Rocket, ExternalLink, Users, Eye, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toolsData } from "../data/mockData";
import ToolPromptExecutor from "../components/tools/ToolPromptExecutor";

const ToolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  
  const tool = toolsData.find(tool => tool.id === id);
  
  if (!tool) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Tool not found</h1>
        <p className="mb-8 text-muted-foreground">The tool you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }
  
  const handleExecute = () => {
    // This would typically call an API, but we'll simulate it for now
    setExecutionResult(`This is a simulated result for the prompt: "${prompt}"\n\nThe actual integration would connect to ${tool.title}'s API and return real results.`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30">
              {tool.category}
            </Badge>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-secondary fill-secondary mr-1" />
              <span>{tool.rating} ({tool.reviewCount} reviews)</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{tool.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {tool.tags.map((tag) => (
              <Badge variant="outline" key={tag}>{tag}</Badge>
            ))}
          </div>
          
          <div className="mb-8">
            <p className="text-lg mb-4">{tool.longDescription}</p>
          </div>
          
          <Tabs defaultValue="use">
            <TabsList className="mb-4">
              <TabsTrigger value="use">Use Tool</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            </TabsList>
            
            <TabsContent value="use" className="mt-0">
              {tool.promptTemplate ? (
                <ToolPromptExecutor 
                  tool={tool} 
                  onExecute={handleExecute} 
                  result={executionResult}
                />
              ) : tool.apiEndpoint ? (
                <div className="bg-muted p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">API Integration</h3>
                  <p className="mb-4">This tool is available through an API endpoint. You can integrate it into your applications.</p>
                  <p className="font-mono text-sm bg-background p-3 rounded border mb-4">{tool.apiEndpoint}</p>
                  <div className="flex gap-4">
                    <Button>
                      View Documentation
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test API
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-6 rounded-lg">
                  <p>This tool requires external access. Click the button below to use it.</p>
                  <Button className="mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Tool
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-6">
                <div className="bg-muted p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">User Reviews</h3>
                  
                  {/* This would be populated with actual reviews */}
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between">
                        <p className="font-medium">Sarah J.</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= 5 ? "text-secondary fill-secondary" : "text-muted"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">2 weeks ago</p>
                      <p className="mt-2">This tool has completely transformed my workflow! The results are incredibly accurate and save me hours of work.</p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex justify-between">
                        <p className="font-medium">Michael T.</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= 4 ? "text-secondary fill-secondary" : "text-muted"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">1 month ago</p>
                      <p className="mt-2">Very good tool with excellent output quality. The only reason I'm not giving 5 stars is because it can be a bit slow sometimes.</p>
                    </div>
                  </div>
                  
                  {/* Add review form */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-2">Leave a Review</h4>
                    <div className="flex mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-secondary" 
                        />
                      ))}
                    </div>
                    <Textarea 
                      placeholder="Share your experience with this tool..."
                      className="mb-4"
                    />
                    <Button>Submit Review</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="alternatives" className="mt-0">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Similar Tools</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toolsData
                    .filter(t => t.category === tool.category && t.id !== tool.id)
                    .slice(0, 4)
                    .map((similarTool) => (
                      <div 
                        key={similarTool.id} 
                        className="border rounded-lg p-4 bg-background hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => navigate(`/tool/${similarTool.id}`)}
                      >
                        <h4 className="font-medium">{similarTool.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{similarTool.description}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-secondary fill-secondary mr-1" />
                          <span className="text-sm">{similarTool.rating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="border rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Badge variant={tool.monetization === "free" ? "outline" : tool.monetization === "freemium" ? "secondary" : "default"} className="px-3 py-1">
                    {tool.monetization === "free" ? "Free" : tool.monetization === "freemium" ? "Freemium" : "Paid"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {tool.monetization === "free" ? (
                  <Button className="w-full mb-4 gap-2">
                    <Rocket className="h-4 w-4" />
                    Use for Free
                  </Button>
                ) : tool.monetization === "freemium" ? (
                  <div className="space-y-2 mb-4">
                    <Button variant="outline" className="w-full">
                      Try Free Version
                    </Button>
                    <Button className="w-full gap-2">
                      <Rocket className="h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <p className="font-medium text-center mb-1">Starting at $19/month</p>
                    <Button className="w-full gap-2">
                      <Rocket className="h-4 w-4" />
                      Get Started
                    </Button>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Tool Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Created: {formatDate(tool.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Last Updated: {formatDate(tool.updatedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{tool.views.toLocaleString()} Views</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{tool.usages.toLocaleString()} Uses</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <h3 className="font-medium mb-3">Developer</h3>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {tool.developerName.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">{tool.developerName}</p>
                      <p className="text-xs text-muted-foreground">Developer</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2 text-sm h-8">
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Contact Developer
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to get updates on new AI tools and features.
              </p>
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm"
                />
                <Button className="w-full">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetails;
