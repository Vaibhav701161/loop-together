
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User } from "@/types";

interface UserStatsCardProps {
  user: User;
  stats: {
    summary: {
      currentStreak: number;
      longestStreak: number;
      totalPacts: number;
      totalCompleted: number;
    };
    pendingCount: number;
    completedCount: number;
    totalPacts: number;
    progress: number;
  };
  colorClass: string;
  nameClass: string;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ user, stats, colorClass, nameClass }) => {
  return (
    <Card className={`border-l-4 ${colorClass} card-hover`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <span className={nameClass}>{user.name}'s</span> Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Today's pacts: {stats.completedCount}/{stats.totalPacts}
          </span>
          <Badge variant={stats.progress === 100 ? "default" : "outline"}>
            {stats.progress}%
          </Badge>
        </div>
        <Progress value={stats.progress} className="h-2 mb-4" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{stats.summary.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{stats.summary.totalPacts}</p>
            <p className="text-xs text-muted-foreground">Active pacts</p>
          </div>
          <div className="bg-muted/50 rounded-md p-2">
            <p className={`text-2xl font-bold ${nameClass}`}>{stats.summary.totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
