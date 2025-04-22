
import React, { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Calendar as CalendarIcon, Search, User, Image, FileText, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

const MediaGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState("images");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterPact, setFilterPact] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { users } = useAuth();
  const { pacts, completions } = usePacts();
  
  // Filter completions to only include those with proof media (images or text)
  const mediaProofs = useMemo(() => {
    return completions.filter(completion => 
      completion.proofType && completion.proofUrl
    );
  }, [completions]);
  
  // Filter text notes
  const textNotes = useMemo(() => {
    return completions.filter(completion => 
      completion.note && completion.note.trim().length > 0
    );
  }, [completions]);

  // Apply all filters
  const filteredMedia = useMemo(() => {
    const mediaList = activeTab === "images" ? mediaProofs : textNotes;
    
    return mediaList.filter(item => {
      // Check search term
      const pact = pacts.find(p => p.id === item.pactId);
      const user = users.find(u => u.id === item.userId);
      const searchMatch = 
        (pact && pact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Check user filter
      const userMatch = filterUser === "all" || item.userId === filterUser;
      
      // Check pact filter
      const pactMatch = filterPact === "all" || item.pactId === filterPact;
      
      // Check date filter
      const dateMatch = !selectedDate || 
        format(new Date(item.completedAt), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      
      return searchMatch && userMatch && pactMatch && dateMatch;
    });
  }, [activeTab, mediaProofs, textNotes, searchTerm, filterUser, filterPact, selectedDate, pacts, users]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterUser("all");
    setFilterPact("all");
    setSelectedDate(undefined);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Media Gallery</h1>
        </div>
        
        <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="mb-0">
              <TabsTrigger value="images" className="flex items-center">
                <Image className="mr-2 h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Text Notes
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPact} onValueChange={setFilterPact}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by pact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pacts</SelectItem>
                {pacts.map(pact => (
                  <SelectItem key={pact.id} value={pact.id}>
                    {pact.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <TabsContent value="images" className="space-y-4 mt-2">
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMedia.map((item) => {
                  const pact = pacts.find(p => p.id === item.pactId);
                  const user = users.find(u => u.id === item.userId);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        {item.proofUrl && (
                          <img 
                            src={item.proofUrl} 
                            alt={`Proof for ${pact?.title || 'Pact'}`}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{pact?.title || 'Unknown Pact'}</h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <User className="h-3 w-3 mr-1" /> {user?.name || 'Unknown User'}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(item.completedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-3 opacity-25" />
                <p>No image proofs found matching your filters.</p>
                <Button variant="link" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4 mt-2">
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMedia.map((item) => {
                  const pact = pacts.find(p => p.id === item.pactId);
                  const user = users.find(u => u.id === item.userId);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-3 flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{pact?.title || 'Unknown Pact'}</h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <User className="h-3 w-3 mr-1" /> {user?.name || 'Unknown User'}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(item.completedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 text-sm">
                          {item.note}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-25" />
                <p>No text notes found matching your filters.</p>
                <Button variant="link" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MediaGallery;
