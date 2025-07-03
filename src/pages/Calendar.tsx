import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useJournal } from '../contexts/JournalContext';
import { JournalEntry } from '../types';
import SentimentBadge from '../components/ui/SentimentBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface CalendarDay {
  date: Date;
  entries: JournalEntry[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading } = useJournal();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEntries, setSelectedDateEntries] = useState<JournalEntry[]>([]);
  
  // Generate calendar data when month or entries change
  useEffect(() => {
    const days = generateCalendarDays(currentMonth, entries);
    setCalendarDays(days);
  }, [currentMonth, entries]);
  
  // Update selected date entries when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateEntries = getEntriesForDate(selectedDate, entries);
      setSelectedDateEntries(dateEntries);
    }
  }, [selectedDate, entries]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Go to current month
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };
  
  // Format month and year
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Generate array of calendar days for the current month view
  const generateCalendarDays = (month: Date, journalEntries: JournalEntry[]): CalendarDay[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    
    // Last day of the month
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days needed (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDayOfMonth.getDate();
    
    // Add days to fill complete weeks (7-day rows)
    const totalCalendarDays = Math.ceil(totalDays / 7) * 7;
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add days from previous month
    const prevMonth = new Date(year, monthIndex - 1);
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthLastDay - daysFromPrevMonth + i + 1);
      days.push({
        date,
        entries: getEntriesForDate(date, journalEntries),
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, monthIndex, i);
      days.push({
        date,
        entries: getEntriesForDate(date, journalEntries),
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    // Add days from next month to fill the remaining slots
    const nextMonth = new Date(year, monthIndex + 1);
    for (let i = 1; i <= totalCalendarDays - days.length; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push({
        date,
        entries: getEntriesForDate(date, journalEntries),
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    return days;
  };
  
  // Get entries for a specific date
  const getEntriesForDate = (date: Date, journalEntries: JournalEntry[]): JournalEntry[] => {
    return journalEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Get mood color based on entries
  const getMoodColor = (day: CalendarDay): string => {
    if (day.entries.length === 0) return '';
    
    // Calculate average sentiment score
    const totalScore = day.entries.reduce((sum, entry) => {
      return sum + (entry.sentiment?.score || 0);
    }, 0);
    
    const avgScore = totalScore / day.entries.length;
    
    // Determine color based on average score
    if (avgScore > 0.3) return 'bg-green-500';
    if (avgScore > 0) return 'bg-green-300';
    if (avgScore > -0.3) return 'bg-yellow-400';
    return 'bg-red-400';
  };
  
  // Format date for displaying in the sidebar
  const formatSelectedDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6">Mood Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <h2 className="text-xl font-medium">
                    {formatMonthYear(currentMonth)}
                  </h2>
                  
                  <button
                    onClick={goToNextMonth}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-sm text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square p-1 cursor-pointer border rounded-md
                      ${day.isToday ? 'border-primary-500 dark:border-primary-400' : 'border-transparent'}
                      ${day.isCurrentMonth ? '' : 'opacity-40'}
                      ${selectedDate && day.date.getTime() === selectedDate.getTime() ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                    `}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="h-full flex flex-col">
                      <div className="text-right text-sm mb-1 px-1">
                        {day.date.getDate()}
                      </div>
                      
                      {day.entries.length > 0 && (
                        <div className="flex-grow flex items-center justify-center">
                          {day.entries.some(entry => entry.scrapbookLayout) ? (
                            <div 
                              className="w-8 h-8 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden"
                              title={`${day.entries.length} entries with scrapbook gallery`}
                            >
                              <div className="w-full h-full flex flex-wrap p-0.5">
                                {/* Miniature gallery wall icon */}
                                <div className="w-1/2 h-1/2 rounded-full bg-blue-300 dark:bg-blue-900 p-px m-px transform scale-90"></div>
                                <div className="w-1/2 h-1/2 rounded-full bg-green-300 dark:bg-green-900 p-px m-px transform scale-90"></div>
                                <div className="w-1/2 h-1/2 rounded-full bg-pink-300 dark:bg-pink-900 p-px m-px transform scale-90"></div>
                                <div className="w-1/2 h-1/2 rounded-full bg-yellow-300 dark:bg-yellow-900 p-px m-px transform scale-90"></div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`w-6 h-6 rounded-full ${getMoodColor(day)}`}
                              title={`${day.entries.length} entries, average mood: ${getMoodColor(day).includes('green') ? 'Positive' : getMoodColor(day).includes('yellow') ? 'Neutral' : 'Negative'}`}
                            >
                              <span className="text-xs text-white font-medium flex items-center justify-center h-full">
                                {day.entries.length}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">
                {selectedDate ? formatSelectedDate(selectedDate) : 'Select a date'}
              </h3>
            </CardHeader>
            
            <CardBody>
              {!selectedDate ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                  Select a date to view entries
                </p>
              ) : selectedDateEntries.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No entries for this date
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/new-entry')}
                  >
                    Create Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/entries/${entry.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {entry.sentiment && <SentimentBadge sentiment={entry.sentiment} />}
                      </div>
                      <p className="text-sm line-clamp-2">
                        {entry.steps.step1}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;