
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, eachDayOfInterval, isSameDay, parseISO, subMonths } from 'date-fns';
import { Thermometer } from 'lucide-react';
import { usePacts } from '@/context/PactContext';
import { User } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakHeatmapProps {
  userId: User['id'];
  monthsToShow?: number;
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ userId, monthsToShow = 3 }) => {
  const { completions } = usePacts();
  
  // Get all completions for the user
  const userCompletions = completions.filter(c => c.userId === userId);
  
  // Generate date range
  const today = new Date();
  const startDate = startOfMonth(subMonths(today, monthsToShow - 1));
  
  // Group dates by month for display
  const months = Array.from({ length: monthsToShow }, (_, i) => {
    const monthStart = startOfMonth(subMonths(today, i));
    const monthEnd = i === 0 ? today : endOfWeek(startOfMonth(subMonths(today, i - 1)));
    
    return {
      label: format(monthStart, 'MMMM yyyy'),
      days: eachDayOfInterval({ start: monthStart, end: monthEnd })
    };
  }).reverse();
  
  // Get completions count for a specific date
  const getCompletionsForDay = (date: Date) => {
    return userCompletions.filter(c => isSameDay(parseISO(c.timestamp), date)).length;
  };
  
  // Get heatmap color based on completion count
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
        
        {/* Months */}
        <div className="space-y-4">
          {months.map((month, monthIndex) => {
            // Start from the first day of week for the first day of the month
            const firstDayOfMonth = month.days[0];
            const daysInFirstWeek = 7 - firstDayOfMonth.getDay();
            
            // Group days by weeks
            const weeks: Date[][] = [];
            let currentWeek: Date[] = [];
            
            month.days.forEach((day, index) => {
              // Start a new week if it's Sunday or the first day
              if (day.getDay() === 0 || index === 0) {
                if (currentWeek.length > 0) {
                  weeks.push(currentWeek);
                }
                currentWeek = [];
              }
              
              // Add the day to the current week
              currentWeek.push(day);
              
              // If it's the last day, push the remaining week
              if (index === month.days.length - 1) {
                weeks.push(currentWeek);
              }
            });
            
            return (
              <div key={monthIndex}>
                <div className="text-sm font-medium mb-1">{month.label}</div>
                
                <div className="space-y-1">
                  {weeks.map((week, weekIndex) => {
                    // Calculate empty cells at the start of the first week
                    const emptyCellsStart = weekIndex === 0 ? week[0].getDay() : 0;
                    
                    // Calculate empty cells at the end of the last week
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
            );
          })}
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
