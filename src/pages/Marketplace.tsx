
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, BookmarkPlus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toolsData } from "../data/mockData";

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredTools = toolsData.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  const featuredTools = toolsData.filter(tool => tool.featured).slice(0, 3);
  
  return (
    <div className="container mx-auto">
      <section className="mb-10 pt-4 lg:pt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 gradient-heading">
            Discover & Use AI Tools Instantly
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Browse hundreds of AI tools, execute them directly in your browser, and find the perfect solution for your needs.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search for AI tools by name, description or category..." 
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="absolute right-3 top-2">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {searchQuery === "" && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Featured Tools</h2>
            <Button variant="link">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <div 
                key={tool.id}
                className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow card-hover"
              >
                <div 
                  className="h-40 bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${tool.imageUrl})` }}
                ></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30">
                        {tool.category}
                      </Badge>
                      <h3 className="text-xl font-medium mb-2">{tool.title}</h3>
                    </div>
                    <Button variant="ghost" size="icon">
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary fill-secondary mr-1" />
                      <span className="text-sm">{tool.rating} ({tool.reviewCount})</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => navigate(`/tool/${tool.id}`)}
                    >
                      <Rocket className="h-4 w-4" />
                      {tool.monetization === "free" ? "Use Free" : "Try Now"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">All Tools</h2>
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/tool/${tool.id}`)}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30">
                            {tool.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-secondary fill-secondary" />
                            <span className="text-sm">{tool.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-1">{tool.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{tool.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant={tool.monetization === "free" ? "outline" : "secondary"} className="text-xs">
                            {tool.monetization === "free" ? "Free" : tool.monetization === "freemium" ? "Freemium" : "Paid"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle bookmark logic
                            }}
                          >
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-muted-foreground">No tools found matching your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <section className="my-12 py-8 px-6 bg-muted/30 rounded-xl border border-border">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Are you a developer?</h2>
          <p className="text-muted-foreground mb-6">
            Showcase your AI tools to thousands of users and monetize your creations.
            Join our developer community today!
          </p>
          <Button onClick={() => navigate("/developer")} className="gap-2">
            <Rocket className="h-4 w-4" />
            Publish Your Tool
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
