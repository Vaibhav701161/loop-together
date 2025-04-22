
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudyTask, CompletionStatus } from "@/types";
import { format, parseISO, isToday, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ClipboardCheck, Book, BookOpen, PenLine, Check, X } from "lucide-react";

// This would be a context in a real app
const useStudyTasks = () => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  
  // Load tasks from localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem("2getherLoop_studyTasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);
  
  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("2getherLoop_studyTasks", JSON.stringify(tasks));
  }, [tasks]);
  
  const addTask = (taskData: Omit<StudyTask, "id" | "createdAt" | "status">) => {
    const id = `study_${Date.now().toString(36)}`;
    const newTask: StudyTask = {
      ...taskData,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    setTasks(prev => [...prev, newTask]);
    return id;
  };
  
  const updateTaskStatus = (taskId: string, status: CompletionStatus, proof?: string, comment?: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status, proof, comment } 
          : task
      )
    );
  };
  
  const getTasksAssignedByUser = (userId: string) => {
    return tasks.filter(task => task.assignedBy === userId);
  };
  
  const getTasksAssignedToUser = (userId: string) => {
    return tasks.filter(task => task.assignedTo === userId);
  };
  
  const getRecentTasks = (userId: string, days: number = 7) => {
    const cutoffDate = subDays(new Date(), days);
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return (
        (task.assignedBy === userId || task.assignedTo === userId) &&
        taskDate >= cutoffDate
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  return {
    tasks,
    addTask,
    updateTaskStatus,
    getTasksAssignedByUser,
    getTasksAssignedToUser,
    getRecentTasks,
  };
};

const StudyTracker: React.FC = () => {
  const { activeUser, users } = useAuth();
  const {
    addTask,
    updateTaskStatus,
    getTasksAssignedByUser,
    getTasksAssignedToUser,
    getRecentTasks,
  } = useStudyTasks();
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("23:59");
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [proofText, setProofText] = useState("");
  const [comment, setComment] = useState("");
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const tasksAssignedByMe = getTasksAssignedByUser(currentUser.id);
  const tasksAssignedToMe = getTasksAssignedToUser(currentUser.id);
  const todaysTasksForMe = tasksAssignedToMe.filter(task => isToday(parseISO(task.date)));
  const pendingTasksForMe = todaysTasksForMe.filter(task => task.status === "pending");
  const recentTasks = getRecentTasks(currentUser.id);
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for the study task.",
        variant: "destructive",
      });
      return;
    }
    
    addTask({
      title: taskTitle,
      description: taskDescription,
      assignedBy: currentUser.id,
      assignedTo: otherUser.id,
      deadline: taskDeadline,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    
    // Reset form
    setTaskTitle("");
    setTaskDescription("");
    
    toast({
      title: "Study Task Created",
      description: `Study task has been assigned to ${otherUser.name}.`,
    });
  };
  
  const openSubmitDialog = (task: StudyTask) => {
    setSelectedTask(task);
    setProofText("");
    setComment("");
    setIsSubmitDialogOpen(true);
  };
  
  const handleCompleteTask = () => {
    if (!selectedTask) return;
    
    updateTaskStatus(
      selectedTask.id,
      "completed",
      proofText,
      comment
    );
    
    setIsSubmitDialogOpen(false);
    
    toast({
      title: "Task Completed",
      description: "Great job! Your study task has been marked as completed.",
    });
  };
  
  const handleFailTask = () => {
    if (!selectedTask) return;
    
    updateTaskStatus(
      selectedTask.id,
      "failed",
      undefined,
      comment
    );
    
    setIsSubmitDialogOpen(false);
    
    toast({
      title: "Task Failed",
      description: "Your study task has been marked as failed.",
      variant: "destructive",
    });
  };
  
  const getStatusBadge = (status: CompletionStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed ✓</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed ✗</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-heading mb-2">Study Tracker</h1>
          <p className="text-muted-foreground">
            Assign and track study tasks between you and {otherUser.name}
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="assign">Assign Task</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    Your Study Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks assigned to you by {otherUser.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todaysTasksForMe.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No study tasks assigned to you today.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {todaysTasksForMe.map((task) => (
                        <div key={task.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Due by {task.deadline} today
                              </p>
                            </div>
                            {getStatusBadge(task.status)}
                          </div>
                          {task.description && (
                            <p className="text-sm mt-2 text-muted-foreground">{task.description}</p>
                          )}
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => openSubmitDialog(task)}
                              className="mt-3"
                            >
                              Complete Task
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {pendingTasksForMe.length > 0 ? (
                    <div className="text-sm text-primary">
                      You have {pendingTasksForMe.length} pending task(s) for today.
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      All caught up! You have no pending study tasks.
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <Card className="border-l-4 border-l-couple-orange">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    {otherUser.name}'s Study Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks you've assigned to {otherUser.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksAssignedByMe.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      You haven't assigned any study tasks to {otherUser.name} yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tasksAssignedByMe.slice(0, 3).map((task) => (
                        <div key={task.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(task.date), "MMM d")} • Due by {task.deadline}
                              </p>
                            </div>
                            {getStatusBadge(task.status)}
                          </div>
                          {task.comment && (
                            <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                              "{task.comment}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => document.getElementById('assign-tab')?.click()}>
                    Assign New Task
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {recentTasks.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">
                      No recent study tasks found.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentTasks.slice(0, 5).map((task) => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(task.date), "MMM d, yyyy")} • 
                              {task.assignedBy === currentUser.id 
                                ? ` Assigned to ${otherUser.name}` 
                                : ` Assigned by ${otherUser.name}`}
                            </p>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                        {task.proof && (
                          <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                            <div className="font-medium text-xs mb-1">Proof:</div>
                            {task.proof}
                          </div>
                        )}
                        {task.comment && (
                          <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                            <div className="font-medium text-xs mb-1">Comment:</div>
                            {task.comment}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="my-tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assigned Study Tasks</CardTitle>
                <CardDescription>
                  Tasks {otherUser.name} has assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksAssignedToMe.length === 0 ? (
                  <div className="text-center py-10">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      You don't have any study tasks assigned yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasksAssignedToMe.map((task) => (
                      <Card key={task.id} className={`overflow-hidden border-l-4 ${
                        task.status === "completed" 
                          ? "border-l-green-500" 
                          : task.status === "failed" 
                            ? "border-l-red-500" 
                            : "border-l-primary"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(task.date), "MMM d, yyyy")} • Due by {task.deadline}
                              </p>
                            </div>
                            {getStatusBadge(task.status)}
                          </div>
                          {task.description && (
                            <p className="text-sm mt-2">{task.description}</p>
                          )}
                          {task.proof && (
                            <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                              <div className="font-medium text-xs mb-1">Your proof:</div>
                              {task.proof}
                            </div>
                          )}
                          {task.comment && (
                            <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                              <div className="font-medium text-xs mb-1">Your comment:</div>
                              {task.comment}
                            </div>
                          )}
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => openSubmitDialog(task)}
                              className="mt-3"
                            >
                              Complete Task
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assign" id="assign-tab" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign a Study Task</CardTitle>
                <CardDescription>
                  Create a new study task for {otherUser.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input
                      id="taskTitle"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="E.g., Read 3 chapters of physics textbook"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="taskDescription">Description (optional)</Label>
                    <Textarea
                      id="taskDescription"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Add details about the task..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="taskDeadline">Deadline Time</Label>
                    <Input
                      id="taskDeadline"
                      type="time"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Assign Task to {otherUser.name}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Tasks You've Assigned</h2>
              {tasksAssignedByMe.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">
                      You haven't assigned any study tasks yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {tasksAssignedByMe.map((task) => (
                    <Card key={task.id} className={`overflow-hidden border-l-4 ${
                      task.status === "completed" 
                        ? "border-l-green-500" 
                        : task.status === "failed" 
                          ? "border-l-red-500" 
                          : "border-l-primary"
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(task.date), "MMM d, yyyy")} • Due by {task.deadline}
                            </p>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                        {task.description && (
                          <p className="text-sm mt-2">{task.description}</p>
                        )}
                        {task.proof && (
                          <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                            <div className="font-medium text-xs mb-1">Proof submitted:</div>
                            {task.proof}
                          </div>
                        )}
                        {task.comment && (
                          <div className="mt-2 bg-muted/30 p-2 rounded text-sm">
                            <div className="font-medium text-xs mb-1">Comment:</div>
                            {task.comment}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Study Task</DialogTitle>
              <DialogDescription>
                {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="proofText">Proof of Completion</Label>
                <Textarea
                  id="proofText"
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe how you completed the task..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="comment">Additional Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any additional comments..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleFailTask} className="sm:w-1/2">
                <X className="w-4 h-4 mr-2" /> Couldn't Complete
              </Button>
              <Button onClick={handleCompleteTask} className="sm:w-1/2" disabled={!proofText}>
                <Check className="w-4 h-4 mr-2" /> Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default StudyTracker;
