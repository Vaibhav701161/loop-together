
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/types";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addDays } from "date-fns";
import { HandCoins, Receipt, Image, AlertTriangle, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// This would be a context in a real app
const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [weeklyLimits, setWeeklyLimits] = useState<Record<string, number>>({
    user_a: 3000, // Default weekly limit for user A
    user_b: 3000, // Default weekly limit for user B
  });
  
  // Load expenses and limits from localStorage
  useEffect(() => {
    const storedExpenses = localStorage.getItem("2getherLoop_expenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
    
    const storedLimits = localStorage.getItem("2getherLoop_weeklyLimits");
    if (storedLimits) {
      setWeeklyLimits(JSON.parse(storedLimits));
    }
  }, []);
  
  // Save expenses and limits to localStorage
  useEffect(() => {
    localStorage.setItem("2getherLoop_expenses", JSON.stringify(expenses));
  }, [expenses]);
  
  useEffect(() => {
    localStorage.setItem("2getherLoop_weeklyLimits", JSON.stringify(weeklyLimits));
  }, [weeklyLimits]);
  
  const addExpense = (expenseData: Omit<Expense, "id">) => {
    const id = `expense_${Date.now().toString(36)}`;
    const newExpense: Expense = {
      ...expenseData,
      id,
    };
    
    setExpenses(prev => [...prev, newExpense]);
    
    // Check if exceeding weekly limit
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const userWeeklyTotal = expenses
      .filter(exp => 
        exp.userId === expenseData.userId && 
        isWithinInterval(parseISO(exp.date), { start: weekStart, end: weekEnd })
      )
      .reduce((total, exp) => total + exp.amount, 0) + expenseData.amount;
    
    const userLimit = weeklyLimits[expenseData.userId];
    
    if (userWeeklyTotal > userLimit) {
      toast({
        title: "Weekly Limit Exceeded!",
        description: `You've gone over your weekly spending limit of ${userLimit.toLocaleString()}.`,
        variant: "destructive",
      });
    }
    
    return id;
  };
  
  const updateWeeklyLimit = (userId: string, limit: number) => {
    setWeeklyLimits(prev => ({
      ...prev,
      [userId]: limit,
    }));
  };
  
  const getWeeklyExpenses = (userId: string) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    return expenses.filter(expense => 
      expense.userId === userId && 
      isWithinInterval(parseISO(expense.date), { start: weekStart, end: weekEnd })
    );
  };
  
  const getWeeklyTotal = (userId: string) => {
    return getWeeklyExpenses(userId).reduce((total, expense) => total + expense.amount, 0);
  };
  
  const getWeeklyLimit = (userId: string) => {
    return weeklyLimits[userId] || 0;
  };
  
  return {
    expenses,
    addExpense,
    updateWeeklyLimit,
    getWeeklyExpenses,
    getWeeklyTotal,
    getWeeklyLimit,
  };
};

const WeeklySpend: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { 
    addExpense, 
    updateWeeklyLimit, 
    getWeeklyExpenses, 
    getWeeklyTotal, 
    getWeeklyLimit 
  } = useExpenses();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageProof, setImageProof] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [weeklyLimit, setWeeklyLimit] = useState(getWeeklyLimit(activeUser?.id || ""));
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  
  const weeklyTotal = getWeeklyTotal(currentUser.id);
  const otherUserWeeklyTotal = getWeeklyTotal(otherUser.id);
  
  const weekProgress = (weeklyTotal / weeklyLimit) * 100;
  const otherUserWeekProgress = (otherUserWeeklyTotal / getWeeklyLimit(otherUser.id)) * 100;
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dateString: format(date, "yyyy-MM-dd"),
      day: format(date, "EEE"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    };
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageProof(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive",
      });
      return;
    }
    
    const expenseAmount = parseFloat(amount);
    
    addExpense({
      userId: currentUser.id,
      amount: expenseAmount,
      description: description,
      category: category || "general",
      date: format(new Date(), "yyyy-MM-dd"),
      imageProof: imageProof || undefined,
    });
    
    // Reset form fields
    setAmount("");
    setDescription("");
    setCategory("");
    setImageProof(null);
    
    toast({
      title: "Expense Added",
      description: `${expenseAmount.toLocaleString()} expense has been recorded.`,
    });
  };
  
  const handleUpdateLimit = () => {
    if (!weeklyLimit || isNaN(parseFloat(weeklyLimit.toString()))) {
      toast({
        title: "Invalid limit",
        description: "Please enter a valid weekly limit.",
        variant: "destructive",
      });
      return;
    }
    
    const limitAmount = parseFloat(weeklyLimit.toString());
    
    updateWeeklyLimit(currentUser.id, limitAmount);
    
    toast({
      title: "Weekly Limit Updated",
      description: `Your weekly spending limit is now ${limitAmount.toLocaleString()}.`,
    });
  };
  
  useEffect(() => {
    setWeeklyLimit(getWeeklyLimit(currentUser.id));
  }, [currentUser.id]);
  
  const userExpenses = getWeeklyExpenses(currentUser.id).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-heading mb-2">Weekly Spend Tracker</h1>
          <p className="text-muted-foreground">{weekRange}</p>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add">Add Expense</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HandCoins className="h-5 w-5 mr-2" />
                    Your Weekly Spending
                  </CardTitle>
                  <CardDescription>
                    Weekly Limit: {weeklyLimit.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between items-center">
                    <span>Total Spent: {weeklyTotal.toLocaleString()}</span>
                    <Badge variant={weekProgress >= 100 ? "destructive" : (weekProgress >= 80 ? "outline" : "default")}>
                      {Math.round(weekProgress)}%
                    </Badge>
                  </div>
                  <Progress value={Math.min(weekProgress, 100)} className="h-2" />
                  
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Daily Breakdown</div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((weekDay) => {
                        const dayTotal = userExpenses
                          .filter(exp => exp.date === weekDay.dateString)
                          .reduce((sum, exp) => sum + exp.amount, 0);
                        
                        return (
                          <div 
                            key={weekDay.dateString} 
                            className={`text-center p-2 rounded-sm ${
                              weekDay.isToday ? "bg-primary text-primary-foreground" : "bg-muted/50"
                            }`}
                          >
                            <div className="text-xs">{weekDay.day}</div>
                            <div className={`text-sm font-semibold ${dayTotal > 0 ? "" : "text-muted-foreground"}`}>
                              {dayTotal > 0 ? dayTotal.toLocaleString() : "-"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="weeklyLimit">Update Weekly Limit</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="weeklyLimit"
                        type="number"
                        value={weeklyLimit}
                        onChange={(e) => setWeeklyLimit(Number(e.target.value))}
                        placeholder="Enter amount"
                        className="flex-1"
                      />
                      <Button onClick={handleUpdateLimit}>Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-couple-orange">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HandCoins className="h-5 w-5 mr-2" />
                    {otherUser.name}'s Spending
                  </CardTitle>
                  <CardDescription>
                    Weekly Limit: {getWeeklyLimit(otherUser.id).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between items-center">
                    <span>Total Spent: {otherUserWeeklyTotal.toLocaleString()}</span>
                    <Badge variant={otherUserWeekProgress >= 100 ? "destructive" : (otherUserWeekProgress >= 80 ? "outline" : "default")}>
                      {Math.round(otherUserWeekProgress)}%
                    </Badge>
                  </div>
                  <Progress value={Math.min(otherUserWeekProgress, 100)} className="h-2" />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
              {userExpenses.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">
                      No expenses recorded this week. Add your first expense!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userExpenses.map((expense) => (
                    <Card key={expense.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        {expense.imageProof && (
                          <div className="sm:w-1/4 bg-muted/30">
                            <img 
                              src={expense.imageProof} 
                              alt="Expense proof" 
                              className="w-full h-full object-cover"
                              style={{ maxHeight: '120px' }}
                            />
                          </div>
                        )}
                        <div className={`flex-1 p-4 ${expense.imageProof ? "" : "w-full"}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{expense.description || "Expense"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(expense.date), "MMM d, yyyy")} • {expense.category || "General"}
                              </p>
                            </div>
                            <span className="font-bold">{expense.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>
                  Record your spending to keep track of your weekly budget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What was this expense for?"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category (optional)</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="E.g., Food, Transport, Entertainment"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="proof" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Upload Receipt (optional)
                    </Label>
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 hover:file:bg-primary/90"
                    />
                    
                    {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    
                    {imageProof && (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <img 
                          src={imageProof} 
                          alt="Receipt preview" 
                          className="max-h-[200px] w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!amount || isNaN(parseFloat(amount)) || isUploading}
                  >
                    Add Expense
                  </Button>
                  
                  {weekProgress >= 80 && (
                    <div className={`p-3 rounded-md flex items-start gap-2 ${
                      weekProgress >= 100 ? "bg-red-100 dark:bg-red-900/20" : "bg-yellow-100 dark:bg-yellow-900/20"
                    }`}>
                      {weekProgress >= 100 ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          weekProgress >= 100 ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300"
                        }`}>
                          {weekProgress >= 100 ? "Weekly limit exceeded!" : "You're nearing your weekly limit!"}
                        </p>
                        <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                          {weekProgress >= 100 
                            ? `You're ${Math.round(weekProgress - 100)}% over your weekly spending limit.`
                            : `You've used ${Math.round(weekProgress)}% of your weekly spending limit.`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WeeklySpend;
