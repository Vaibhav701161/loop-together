import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";

interface LogData {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const History: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { logs, getPact, deleteLog } = usePacts();
  const { toast } = useToast();
  
  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;

  const completedLogs = logs.filter(log => log.status === "completed" && (log.userId === currentUser.id || log.userId === otherUser.id));
  const failedLogs = logs.filter(log => log.status === "failed" && (log.userId === currentUser.id || log.userId === otherUser.id));
  const pendingLogs = logs.filter(log => log.status === "pending" && (log.userId === currentUser.id || log.userId === otherUser.id));

  const logData: LogData[] = [
    { name: "Completed", value: completedLogs.length, icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: "#22c55e" },
    { name: "Failed", value: failedLogs.length, icon: <XCircle className="h-4 w-4 text-red-500" />, color: "#ef4444" },
    { name: "Pending", value: pendingLogs.length, icon: <Clock className="h-4 w-4 text-gray-500" />, color: "#9ca3af" },
  ];

  const COLORS = logData.map(item => item.color);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as LogData;
      return (
        <div className="bg-white border rounded p-2 shadow-md">
          <p className="font-semibold">{data.name}</p>
          <p>Count: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteLog(logId);
      
      toast({
        title: "Log deleted",
        description: "The log entry has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        title: "Error",
        description: "Failed to delete the log entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold gradient-heading mb-8">History</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pact Completion Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {logData.every(item => item.value === 0) ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No pact history available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={logData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {logData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {logs.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No recent activity found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.sort((a, b) => parseISO(b.completedAt).getTime() - parseISO(a.completedAt).getTime()).map(log => {
                const pact = getPact(log.pactId);
                if (!pact) return null;

                const statusIcon =
                  log.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : log.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-500" />
                  );

                return (
                  <Card key={log.id}>
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {statusIcon}
                        <CardTitle className="text-sm font-medium">{pact.title}</CardTitle>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(log.completedAt), "MMM d, yyyy h:mm a")}
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="text-sm">
                        Status: {log.status} • User: {log.userId}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteLog(log.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;
