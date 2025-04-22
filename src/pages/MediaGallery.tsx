
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { Image, User, Calendar, Search } from "lucide-react";

const MediaGallery: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { pacts, completions } = usePacts();
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterPact, setFilterPact] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "", 
    to: ""
  });

  const mediaCompletions = completions.filter(
    completion => completion.proofType === "image" && completion.proofUrl
  );

  // Apply filters
  const filteredMedia = mediaCompletions.filter(completion => {
    // User filter
    if (filterUser !== "all" && completion.userId !== filterUser) {
      return false;
    }

    // Pact filter
    if (filterPact !== "all" && completion.pactId !== filterPact) {
      return false;
    }

    // Search term
    const pact = pacts.find(p => p.id === completion.pactId);
    const searchString = `${pact?.title || ""} ${pact?.description || ""} ${completion.note || ""}`.toLowerCase();
    
    if (searchTerm && !searchString.includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      const completionDate = parseISO(completion.timestamp);
      
      if (isBefore(completionDate, fromDate) && !isEqual(completionDate, fromDate)) {
        return false;
      }
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      const completionDate = parseISO(completion.timestamp);
      
      if (isAfter(completionDate, toDate) && !isEqual(completionDate, toDate)) {
        return false;
      }
    }

    return true;
  });

  const groupedByDate = filteredMedia.reduce((acc, completion) => {
    const date = format(parseISO(completion.timestamp), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(completion);
    return acc;
  }, {} as Record<string, typeof mediaCompletions>);

  // Sort dates newest to oldest
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return parseISO(b).getTime() - parseISO(a).getTime();
  });

  const getPactTitle = (pactId: string): string => {
    const pact = pacts.find(p => p.id === pactId);
    return pact?.title || "Unknown Pact";
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown User";
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Media Gallery</h1>
          <span className="text-muted-foreground">
            {filteredMedia.length} {filteredMedia.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in gallery..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm mb-1 block">User</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-1 block">Pact</label>
              <Select value={filterPact} onValueChange={setFilterPact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Pacts</SelectItem>
                    {pacts.map(pact => (
                      <SelectItem key={pact.id} value={pact.id}>
                        {pact.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-1 block">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span>Grid</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0">
            {filteredMedia.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Image className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2">No media found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    No images match your current search criteria. Try adjusting your filters or add more pact completions with image proofs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map(completion => (
                  <div key={completion.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-muted/50">
                      <img 
                        src={completion.proofUrl} 
                        alt={getPactTitle(completion.pactId)}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 rounded-lg">
                      <div className="text-white text-sm font-medium truncate">
                        {getPactTitle(completion.pactId)}
                      </div>
                      <div className="flex items-center text-white/80 text-xs gap-1 mt-1">
                        <User className="h-3 w-3" />
                        <span>{getUserName(completion.userId)}</span>
                      </div>
                      <div className="text-white/80 text-xs">
                        {format(parseISO(completion.timestamp), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            {sortedDates.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2">No timeline data</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    No images match your current search criteria. Try adjusting your filters or add more pact completions with image proofs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="font-medium text-lg mb-3">
                      {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {groupedByDate[date].map(completion => (
                        <div key={completion.id} className="group relative">
                          <div className="aspect-square rounded-lg overflow-hidden border bg-muted/50">
                            <img 
                              src={completion.proofUrl} 
                              alt={getPactTitle(completion.pactId)}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 rounded-lg">
                            <div className="text-white text-sm font-medium truncate">
                              {getPactTitle(completion.pactId)}
                            </div>
                            <div className="flex items-center text-white/80 text-xs gap-1 mt-1">
                              <User className="h-3 w-3" />
                              <span>{getUserName(completion.userId)}</span>
                            </div>
                            <div className="text-white/80 text-xs">
                              {format(parseISO(completion.timestamp), "h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MediaGallery;
