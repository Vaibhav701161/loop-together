
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Milestone } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Award, Check, Plus, PartyPopper, Gift, Target } from "lucide-react";
import confetti from 'canvas-confetti';

const useMilestones = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { pacts, logs, getPactStreak } = usePacts();
  
  useEffect(() => {
    const storedMilestones = localStorage.getItem("2getherLoop_milestones");
    if (storedMilestones) {
      setMilestones(JSON.parse(storedMilestones));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("2getherLoop_milestones", JSON.stringify(milestones));
  }, [milestones]);
  
  useEffect(() => {
    const updatedMilestones = milestones.map(milestone => {
      let currentProgress = 0;
      
      if (milestone.pactType === "gym") {
        const gymPacts = pacts.filter(pact => 
          pact.title.toLowerCase().includes("gym") ||
          pact.description?.toLowerCase().includes("gym") ||
          pact.description?.toLowerCase().includes("workout") ||
          pact.description?.toLowerCase().includes("exercise")
        );
        
        if (gymPacts.length > 0) {
          currentProgress = gymPacts.reduce((total, pact) => {
            const streak = getPactStreak(pact.id);
            return total + streak.current;
          }, 0);
        }
      } else if (milestone.pactType === "study") {
        const studyPacts = pacts.filter(pact => 
          pact.title.toLowerCase().includes("study") ||
          pact.description?.toLowerCase().includes("study") ||
          pact.description?.toLowerCase().includes("learn") ||
          pact.description?.toLowerCase().includes("reading")
        );
        
        if (studyPacts.length > 0) {
          currentProgress = studyPacts.reduce((total, pact) => {
            const streak = getPactStreak(pact.id);
            return total + streak.current;
          }, 0);
        }
      } else if (milestone.pactType === "diet") {
        const dietPacts = pacts.filter(pact => 
          pact.title.toLowerCase().includes("diet") ||
          pact.title.toLowerCase().includes("sugar") ||
          pact.title.toLowerCase().includes("food") ||
          pact.description?.toLowerCase().includes("eat") ||
          pact.description?.toLowerCase().includes("diet") ||
          pact.description?.toLowerCase().includes("nutrition")
        );
        
        if (dietPacts.length > 0) {
          currentProgress = dietPacts.reduce((total, pact) => {
            const streak = getPactStreak(pact.id);
            return total + streak.current;
          }, 0);
        }
      } else if (milestone.pactType === "any") {
        currentProgress = logs.filter(log => log.status === "completed").length;
      }
      
      const isCompleted = currentProgress >= milestone.targetDays && !milestone.isCompleted;
      
      if (isCompleted && !milestone.isCompleted) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          toast({
            title: "Milestone Achieved! 🎉",
            description: `You've reached the "${milestone.title}" milestone! Time to celebrate with your reward: ${milestone.reward}`,
          });
        }, 500);
      }
      
      return {
        ...milestone,
        progress: currentProgress,
        isCompleted: isCompleted || milestone.isCompleted
      };
    });
    
    setMilestones(updatedMilestones);
  }, [pacts, logs, getPactStreak]);
  
  const addMilestone = (milestoneData: Omit<Milestone, "id" | "createdAt" | "progress" | "isCompleted">) => {
    const id = `milestone_${Date.now().toString(36)}`;
    const newMilestone: Milestone = {
      ...milestoneData,
      id,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    
    setMilestones(prev => [...prev, newMilestone]);
    return id;
  };
  
  const deleteMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
  };
  
  const getActiveMilestones = () => {
    return milestones.filter(milestone => !milestone.isCompleted);
  };
  
  const getCompletedMilestones = () => {
    return milestones.filter(milestone => milestone.isCompleted);
  };
  
  return {
    milestones,
    addMilestone,
    deleteMilestone,
    getActiveMilestones,
    getCompletedMilestones,
  };
};

const Milestones: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    addMilestone, 
    deleteMilestone, 
    getActiveMilestones, 
    getCompletedMilestones 
  } = useMilestones();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pactType, setPactType] = useState<string>("any");
  const [targetDays, setTargetDays] = useState<number>(7);
  const [reward, setReward] = useState("");
  
  const { toast } = useToast();
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const activeMilestones = getActiveMilestones();
  const completedMilestones = getCompletedMilestones();
  
  const handleCreateMilestone = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your milestone.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reward.trim()) {
      toast({
        title: "Reward required",
        description: "Please enter a reward for completing this milestone.",
        variant: "destructive",
      });
      return;
    }
    
    addMilestone({
      title,
      description,
      pactType,
      targetDays,
      reward
    });
    
    setTitle("");
    setDescription("");
    setPactType("any");
    setTargetDays(7);
    setReward("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Milestone Created",
      description: "Your couple milestone has been created. Work together to achieve it!",
    });
  };
  
  const handleDelete = (id: string) => {
    deleteMilestone(id);
    
    toast({
      title: "Milestone Deleted",
      description: "The milestone has been removed.",
    });
  };
  
  const getPactTypeLabel = (type: string) => {
    switch (type) {
      case "gym": return "Gym/Exercise";
      case "study": return "Study/Learning";
      case "diet": return "Diet/Nutrition";
      case "any": return "Any Pact Type";
      default: return type;
    }
  };
  
  const renderMilestoneCard = (milestone: Milestone) => {
    const progressPercentage = Math.min((milestone.progress / milestone.targetDays) * 100, 100);
    
    return (
      <Card key={milestone.id} className={`overflow-hidden ${
        milestone.isCompleted ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : ""
      }`}>
        {milestone.isCompleted && (
          <div className="bg-green-500 h-1 w-full" />
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center">
              {milestone.isCompleted ? (
                <Award className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
              )}
              {milestone.title}
            </CardTitle>
            {milestone.isCompleted ? (
              <Badge className="bg-green-500">
                <Check className="h-3 w-3 mr-1" /> Achieved
              </Badge>
            ) : (
              <Badge variant="outline">In Progress</Badge>
            )}
          </div>
          <CardDescription>
            {getPactTypeLabel(milestone.pactType)} • {milestone.targetDays} days
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {milestone.description && (
            <p className="text-sm mb-3">{milestone.description}</p>
          )}
          
          {!milestone.isCompleted && (
            <>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span>{milestone.progress} of {milestone.targetDays} days</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-3" />
            </>
          )}
          
          <div className="bg-muted/40 p-3 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Reward:</div>
            <div className="text-sm font-medium flex items-center">
              <Gift className="h-4 w-4 mr-1 text-pink-500" />
              {milestone.reward}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-0">
          {milestone.isCompleted ? (
            <div className="flex items-center">
              <PartyPopper className="h-3 w-3 mr-1" />
              <span>Completed! Enjoy your reward together.</span>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <span>Created {format(new Date(milestone.createdAt), "MMM d, yyyy")}</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-auto p-0 text-destructive hover:text-destructive text-xs"
                onClick={() => handleDelete(milestone.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Couple Milestones</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Couple Milestone</DialogTitle>
                <DialogDescription>
                  Set a goal that you and {otherUser.name} can achieve together!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Milestone Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., One Month Gym Challenge"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add some details about this milestone..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="pactType">Pact Type</Label>
                  <Select
                    value={pactType}
                    onValueChange={setPactType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Pact Type</SelectItem>
                      <SelectItem value="gym">Gym/Exercise</SelectItem>
                      <SelectItem value="study">Study/Learning</SelectItem>
                      <SelectItem value="diet">Diet/Nutrition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="targetDays">
                    Target Days
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({targetDays} days)
                    </span>
                  </Label>
                  <Input
                    id="targetDays"
                    type="range"
                    min="1"
                    max="365"
                    step="1"
                    value={targetDays}
                    onChange={(e) => setTargetDays(parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 day</span>
                    <span>1 week</span>
                    <span>1 month</span>
                    <span>1 year</span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="reward">Reward</Label>
                  <Input
                    id="reward"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="E.g., Movie night with ice cream 🍿🍦"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateMilestone}>Create Milestone</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Active Milestones</h2>
          </div>
          
          {activeMilestones.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-10 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  You don't have any active milestones yet.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Create Your First Milestone
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMilestones.map(renderMilestoneCard)}
            </div>
          )}
        </div>
        
        {completedMilestones.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 mr-2 text-green-500" />
              <h2 className="text-xl font-semibold">Completed Milestones</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMilestones.map(renderMilestoneCard)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Milestones;
