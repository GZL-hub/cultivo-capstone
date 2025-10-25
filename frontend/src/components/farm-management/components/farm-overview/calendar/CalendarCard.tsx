import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';

interface FarmEvent {
  id: string;
  title: string;
  date: Date;
  category: 'planting' | 'harvesting' | 'maintenance' | 'other';
}

interface CalendarCardProps {
  events?: FarmEvent[];
  onViewEvent?: (event: FarmEvent) => void;
  onAddEvent?: () => void;
  className?: string;
}

const CalendarCard: React.FC<CalendarCardProps> = ({ 
  events = [], 
  onViewEvent, 
  onAddEvent,
  className = ""
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeMonth, setActiveMonth] = useState(currentDate.getMonth());
  const [activeYear, setActiveYear] = useState(currentDate.getFullYear());
  
  // Get day names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setActiveMonth(prevMonth => {
      if (prevMonth === 0) {
        setActiveYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setActiveMonth(prevMonth => {
      if (prevMonth === 11) {
        setActiveYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };
  
  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(activeYear, activeMonth);
    const firstDay = getFirstDayOfMonth(activeYear, activeMonth);
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(activeYear, activeMonth, day);
      const isToday = 
        date.getDate() === currentDate.getDate() && 
        date.getMonth() === currentDate.getMonth() && 
        date.getFullYear() === currentDate.getFullYear();
      
      // Check if there are events on this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === activeMonth && 
               eventDate.getFullYear() === activeYear;
      });
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`relative h-8 w-8 flex items-center justify-center rounded-full 
            ${isToday ? 'bg-accent text-white font-medium' : 'hover:bg-gray-100 cursor-pointer'}`}
        >
          {day}
          {dayEvents.length > 0 && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CalendarIcon className="text-green-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold">Calendar</h3>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="text-center mb-2">
        <h4 className="font-medium">{monthNames[activeMonth]} {activeYear}</h4>
      </div>
      
      {/* Calendar weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarCard;