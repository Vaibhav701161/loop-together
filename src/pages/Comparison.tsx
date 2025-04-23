
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import StreakHeatmap from "@/components/streak/StreakHeatmap";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { checkSupabaseConnection } from "@/lib/supabase";

interface StreakData {
  name: string;
  current: number;
  longest: number;
  total: number;
}

interface LogData {
  date: string;
  user_a: number;
  user_b: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Comparison: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { pacts, logs, getPactStreak } = usePacts();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    
    checkConnection();
  }, []);
  
  if (!activeUser) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl p-4 text-center py-12">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Fetching comparison data</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const currentUser = activeUser;
  const otherUser = users.find(user => user.id !== currentUser.id)!;
  const currentUserId = currentUser.id as "user_a" | "user_b";

  const calculateStreakData = (userId: "user_a" | "user_b") => {
    return pacts.filter(pact => 
      pact.assignedTo === userId || pact.assignedTo === "both"
    ).map(pact => {
      const streak = getPactStreak(pact.id, userId);
      return {
        name: pact.title,
        ...streak
      };
    });
  };

  const streakDataUserA = calculateStreakData(currentUser.id);
  const streakDataUserB = calculateStreakData(otherUser.id);

  const totalPactsUserA = streakDataUserA.reduce((sum, data) => sum + data.total, 0);
  const totalPactsUserB = streakDataUserB.reduce((sum, data) => sum + data.total, 0);

  const pieChartData = [
    { name: currentUser.name, value: totalPactsUserA },
    { name: otherUser.name, value: totalPactsUserB },
  ];

  const calculateDailyLogs = (): LogData[] => {
    const today = new Date();
    const lastWeek = subDays(today, 7);
  
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i);
      dates.push(format(date, "yyyy-MM-dd"));
    }
  
    return dates.map(date => {
      const userALogs = logs.filter(log => log.userId === currentUser.id && log.date === date).length;
      const userBLogs = logs.filter(log => log.userId === otherUser.id && log.date === date).length;
  
      return {
        date: date,
        user_a: userALogs,
        user_b: userBLogs,
      };
    }).reverse();
  };

  const dailyLogsData = calculateDailyLogs();

  const handleExportData = () => {
    const data = {
      users: users,
      pacts: pacts,
      logs: logs,
      timestamp: new Date().toISOString()
    };
    
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = "2getherLoop_data.json";
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported."
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Comparison</h1>
          <div className="flex gap-2">
            <ConnectionStatus status={connectionStatus} />
            <button onClick={handleExportData} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm">
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Pacts Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyLogsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="user_a" name={currentUser.name} fill="#8884d8" />
                  <Bar dataKey="user_b" name={otherUser.name} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Streak Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentUser.name}'s Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                {streakDataUserA.map((data: StreakData) => (
                  <div key={data.name} className="mb-4">
                    <h3 className="font-medium">{data.name}</h3>
                    <p className="text-sm">Current: {data.current}, Longest: {data.longest}, Total: {data.total}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{otherUser.name}'s Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                {streakDataUserB.map((data: StreakData) => (
                  <div key={data.name} className="mb-4">
                    <h3 className="font-medium">{data.name}</h3>
                    <p className="text-sm">Current: {data.current}, Longest: {data.longest}, Total: {data.total}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Streak Heatmap</h2>
          <StreakHeatmap userId={currentUserId} />
        </div>
      </div>
    </Layout>
  );
};

export default Comparison;
