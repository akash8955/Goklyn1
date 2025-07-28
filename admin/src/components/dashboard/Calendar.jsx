import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO, isSameDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// List of holidays (format: 'MM-DD')
const HOLIDAYS = [
  { date: '01-01', name: "New Year's Day" },
  { date: '01-26', name: 'Republic Day' },
  { date: '08-15', name: 'Independence Day' },
  { date: '10-02', name: 'Gandhi Jayanti' },
  { date: '12-25', name: 'Christmas Day' },
];

// Helper function to check if a date is a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Helper function to check if a date is a holiday
const isHoliday = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return HOLIDAYS.some(holiday => holiday.date === `${month}-${day}`);
};

// Helper function to get holiday name for a date
const getHolidayName = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const holiday = HOLIDAYS.find(h => h.date === `${month}-${day}`);
  return holiday ? holiday.name : null;
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Add holiday events to the events list
  const eventsWithHolidays = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const holidayEvents = HOLIDAYS.map(holiday => {
      const [month, day] = holiday.date.split('-').map(Number);
      const holidayDate = new Date(currentYear, month - 1, day);
      
      return {
        id: `holiday-${holiday.date}`,
        title: holiday.name,
        start: holidayDate,
        end: new Date(currentYear, month - 1, day, 23, 59, 59),
        allDay: true,
        type: 'holiday',
        isHoliday: true
      };
    });

    return [...events, ...holidayEvents];
  }, [events, currentDate]);

  // Mock events data
  const mockEvents = useMemo(() => [
    {
      id: 'mock-1',
      title: 'Team Meeting',
      type: 'meeting',
      start: new Date(),
      end: new Date(Date.now() + 3600000), // 1 hour later
      description: 'Weekly team sync',
      allDay: false
    },
    {
      id: 'mock-2',
      title: 'Project Deadline',
      type: 'deadline',
      start: new Date(Date.now() + 86400000), // Tomorrow
      end: new Date(Date.now() + 86400000),
      description: 'Submit project report',
      allDay: true
    },
    {
      id: 'mock-3',
      title: 'Client Call',
      type: 'call',
      start: new Date(Date.now() + 2 * 86400000), // 2 days later
      end: new Date(Date.now() + 2 * 86400000 + 1800000), // 30 minutes later
      description: 'Discuss project requirements',
      allDay: false
    }
  ], []);

  // Function to fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      let eventsData = [];
      
      try {
        // Try to fetch real events
        eventsData = await eventService.getEvents();
      } catch (error) {
        console.warn('Using mock events:', error.message);
        // If API fails, use mock events
        setEvents(mockEvents);
        toast.info('Using sample events - API not available');
        return;
      }
      
      // Process events to ensure proper date objects
      const processedEvents = eventsData.map(event => ({
        ...event,
        id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
        title: event.title || 'New Event',
        start: event.start instanceof Date ? event.start : new Date(event.start),
        end: event.end instanceof Date ? event.end : new Date(event.end),
        type: event.type || 'event',
        allDay: event.allDay || false,
        description: event.description || ''
      }));
      
      // If no events, use mock data
      setEvents(processedEvents.length > 0 ? processedEvents : mockEvents);
      
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      // Fall back to mock events on any error
      setEvents(mockEvents);
      toast.error('Using sample events - Error loading calendar');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Event style getter
  const eventStyleGetter = (event) => {
    const color = getEventColor(event.type);
    const isHolidayEvent = event.isHoliday;
    
    return {
      style: {
        backgroundColor: isHolidayEvent ? 'rgba(243, 232, 255, 0.9)' : color.background,
        borderLeft: `4px solid ${isHolidayEvent ? '#8B5CF6' : color.border}`,
        color: isHolidayEvent ? '#5B21B6' : color.text,
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '0.75rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        margin: '2px 4px',
        border: 'none',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      },
    };
  };

  // Day style getter
  const dayPropGetter = (date) => {
    if (isHoliday(date)) {
      return {
        className: 'holiday',
        style: {
          backgroundColor: '#FEE2E2', // red-100
          borderLeft: '4px solid #EF4444', // red-500
        }
      };
    }
    if (isWeekend(date)) {
      return {
        className: 'weekend',
        style: {
          backgroundColor: '#F9FAFB', // gray-50
          color: '#6B7280', // gray-500
        }
      };
    }
    return {};
  };

  // Custom day header component
  const CustomDayHeader = ({ date }) => {
    const holidayName = getHolidayName(date);
    const isWeekendDay = isWeekend(date);
    const isHolidayDay = isHoliday(date);
    
    return (
      <div className="flex flex-col items-center">
        <div className={`text-sm font-medium ${
          isWeekendDay ? 'text-gray-500' : 'text-gray-700'
        } ${isHolidayDay ? 'text-red-600 font-semibold' : ''}`}>
          {format(date, 'EEE')}
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full mt-1 ${
          isSameDay(date, new Date()) ? 'bg-blue-100 text-blue-700' : ''
        }`}>
          {format(date, 'd')}
        </div>
        {holidayName && (
          <div className="text-[10px] text-red-600 font-medium truncate max-w-full px-1">
            {holidayName}
          </div>
        )}
      </div>
    );
  };

  const handleSelectSlot = async ({ start, end }) => {
    const title = window.prompt('New Event Name');
    if (title) {
      try {
        const newEvent = {
          title,
          start,
          end,
          type: 'meeting',
          description: ''
        };
        
        await eventService.createEvent(newEvent);
        await fetchEvents(); // Refresh events
        toast.success('Event created successfully');
      } catch (error) {
        console.error('Failed to create event:', error);
        toast.error('Failed to create event');
      }
    }
  };

  const handleEventClick = (event) => {
    const newTitle = window.prompt('Edit Event', event.title);
    if (newTitle !== null && newTitle !== event.title) {
      handleUpdateEvent({
        ...event,
        title: newTitle
      });
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    await handleUpdateEvent({
      ...event,
      start,
      end
    });
  };

  const handleEventResize = async ({ event, start, end }) => {
    await handleUpdateEvent({
      ...event,
      start,
      end
    });
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await eventService.updateEvent(updatedEvent._id, {
        title: updatedEvent.title,
        start: updatedEvent.start,
        end: updatedEvent.end,
        type: updatedEvent.type,
        description: updatedEvent.description
      });
      await fetchEvents();
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter(event => event._id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="calendar-container bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <BigCalendar
        localizer={localizer}
        events={eventsWithHolidays}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        resizable
        draggableAccessor={() => true}
        defaultView="month"
        views={['month', 'week']}
        style={{ height: '600px', padding: '1rem' }}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        components={{
          toolbar: (props) => (
            <div className="rbc-toolbar flex flex-wrap items-center justify-between p-2 border-b border-gray-100">
              <div className="rbc-btn-group flex space-x-1">
                <button 
                  onClick={() => props.onView('month')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md ${props.view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Month
                </button>
                <button 
                  onClick={() => props.onView('week')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md ${props.view === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Week
                </button>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {format(props.date, 'MMMM yyyy')}
              </span>
              <div className="rbc-btn-group flex space-x-1">
                <button 
                  onClick={() => props.onNavigate('TODAY')}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Today
                </button>
                <button 
                  onClick={() => props.onNavigate('PREV')}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  ‹
                </button>
                <button 
                  onClick={() => props.onNavigate('NEXT')}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  ›
                </button>
              </div>
            </div>
          ),
          event: ({ event }) => (
            <div className="calendar-event p-1">
              <div className="event-time text-xs font-medium">
                {format(event.start, 'h:mm a')}
              </div>
              <div className="event-title text-xs truncate">{event.title}</div>
            </div>
          ),
          month: {
            header: ({ label }) => (
              <div className="rbc-header text-xs font-medium text-gray-500 py-1">
                {label}
              </div>
            ),
            dateHeader: ({ label, date }) => (
              <div className="rbc-date-cell py-1 px-1 text-right">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                  date.getDate() === new Date().getDate() && 
                  date.getMonth() === new Date().getMonth() && 
                  date.getFullYear() === new Date().getFullYear() 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
              </div>
            )
          }
        }}
      />
    </div>
  );
};

function getEventColor(type) {
  switch (type) {
    case 'meeting':
      return { background: '#DBEAFE', border: '#60A5FA', text: '#3B82F6' };
    case 'deadline':
      return { background: '#FEE2E2', border: '#F87171', text: '#EF4444' };
    case 'call':
      return { background: '#D1FAE5', border: '#34D399', text: '#10B981' };
    case 'holiday':
      return { background: '#F3E8FF', border: '#A78BFA', text: '#8B5CF6' };
    default:
      return { background: '#F3F4F6', border: '#9CA3AF', text: '#4B5563' };
  }
}

export default Calendar;
