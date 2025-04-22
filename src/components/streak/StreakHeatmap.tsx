
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, format } from 'date-fns';
import { Thermometer } from 'lucide-react';
import { usePacts } from '@/context/PactContext';
import { User } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakHeatmapProps {
  userId: User['id'];
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ userId }) => {
  const { completions } = usePacts();
  const userCompletions = completions.filter(c => c.userId === userId);

  // Show only the current month
  const today = new Date();
  const startDate = startOfMonth(today);
  const endDate = endOfMonth(today);

  // Days of current month
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Week structure: group by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  days.forEach((day, i) => {
    // Start of the week (Sunday) or first day
    if (day.getDay() === 0 || i === 0) {
      if (currentWeek.length > 0) weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
    if (i === days.length - 1) weeks.push(currentWeek);
  });

  const getCompletionsForDay = (date: Date) => {
    // Accept timestamp or completedAt for backward compat
    return userCompletions.filter(c => {
      let compareDate: Date | null = null;
      if (c.timestamp) {
        compareDate = new Date(c.timestamp);
      } else if (c.completedAt) {
        compareDate = parseISO(c.completedAt);
      } else if (c.date) {
        compareDate = parseISO(c.date);
      }
      return compareDate && isSameDay(compareDate, date);
    }).length;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-green-100';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-500';
    return 'bg-green-700'; // 4+
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Thermometer className="h-5 w-5" /> 
          Streak Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* WeekDay Labels */}
        <div className="flex mb-1">
          <div className="w-8"></div>
          <div className="grid grid-cols-7 flex-1 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="text-xs text-center text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current month */}
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">{format(today, 'MMMM yyyy')}</div>
            <div className="space-y-1">
              {weeks.map((week, weekIndex) => {
                const emptyCellsStart = weekIndex === 0 ? week[0].getDay() : 0;
                const emptyCellsEnd = weekIndex === weeks.length - 1 ? 6 - week[week.length - 1].getDay() : 0;
                return (
                  <div key={weekIndex} className="flex">
                    <div className="w-8 text-xs text-right pr-2 text-muted-foreground">
                      {format(week[0], 'd')}
                    </div>
                    <div className="grid grid-cols-7 flex-1 gap-1">
                      {/* Empty cells at start */}
                      {Array.from({ length: emptyCellsStart }).map((_, i) => (
                        <div key={`empty-start-${i}`} className="aspect-square"></div>
                      ))}
                      {/* Actual days */}
                      {week.map((day, dayIndex) => {
                        const completionsCount = getCompletionsForDay(day);
                        const isToday = isSameDay(day, today);

                        return (
                          <TooltipProvider key={dayIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`aspect-square rounded ${getHeatmapColor(completionsCount)} ${
                                    isToday ? 'ring-2 ring-primary' : ''
                                  }`}
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p className="font-medium">{format(day, 'EEEE, MMM d, yyyy')}</p>
                                  <p>{completionsCount} {completionsCount === 1 ? 'pact' : 'pacts'} completed</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                      {/* Empty cells at end */}
                      {Array.from({ length: emptyCellsEnd }).map((_, i) => (
                        <div key={`empty-end-${i}`} className="aspect-square"></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Fewer</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted"></div>
            <div className="w-3 h-3 rounded bg-green-100"></div>
            <div className="w-3 h-3 rounded bg-green-300"></div>
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <div className="w-3 h-3 rounded bg-green-700"></div>
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakHeatmap;

