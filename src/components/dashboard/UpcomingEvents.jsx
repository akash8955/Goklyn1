import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FiPlus, FiClock, FiCalendar, FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eventService from '../../services/eventService';
import styles from './UpcomingEvents.module.css';

const getEventTypeStyle = (type) => {
  const styleMap = {
    meeting: styles.eventTypeMeeting,
    deadline: styles.eventTypeDeadline,
    call: styles.eventTypeCall,
    reminder: styles.eventTypeReminder,
  };
  return styleMap[type] || styles.eventTypeDefault;
};

const getEventTypeBadge = (type) => {
  const styleMap = {
    meeting: styles.badge + ' ' + styles.eventTypeMeeting,
    deadline: styles.badge + ' ' + styles.eventTypeDeadline,
    call: styles.badge + ' ' + styles.eventTypeCall,
    reminder: styles.badge + ' ' + styles.eventTypeReminder,
  };
  return (
    <span className={styleMap[type] || (styles.badge + ' ' + styles.eventTypeDefault)}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const formatForDateTimeLocal = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: formatForDateTimeLocal(new Date()),
    end: formatForDateTimeLocal(new Date(Date.now() + 3600000)), // 1 hour later
    type: 'meeting',
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getUpcomingEvents(5);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error(error.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    try {
      const startDate = new Date(newEvent.start);
      const endDate = new Date(newEvent.end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error('Please select valid start and end times.');
        return;
      }

      // Ensure end time is after start time
      if (startDate >= endDate) {
        toast.error('End time must be after start time');
        return;
      }

      // Create the event with proper date strings
      const eventToCreate = {
        title: newEvent.title.trim(),
        description: newEvent.description?.trim() || '',
        type: newEvent.type || 'meeting',
        start: startDate.toISOString(),
        end: endDate.toISOString()
      };
      
      console.log('Creating event:', eventToCreate);
      
      // Show loading state
      const loadingToast = toast.loading('Adding event...');
      
      // Use the eventService for consistency
      await eventService.createEvent(eventToCreate);
      
      await fetchEvents();
      
      // Reset form and close
      setNewEvent({
        title: '',
        description: '',
        start: formatForDateTimeLocal(new Date()),
        end: formatForDateTimeLocal(new Date(Date.now() + 3600000)),
        type: 'meeting',
      });
      setIsAddingEvent(false);
      
      toast.update(loadingToast, {
        render: 'Event added successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

    } catch (error) {
      console.error('Failed to add event:', error);
      // The loading toast is already active, so we just update it.
      toast.update(toast.loading, {
        render: `Failed to add event: ${error.message || 'Please try again'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        toastId: 'add-event-error' // prevent duplicate toasts
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const loadingToast = toast.loading('Deleting event...');
      try {
        await eventService.deleteEvent(eventId);
        setEvents(events.filter(event => event._id !== eventId));
        toast.update(loadingToast, {
          render: 'Event deleted successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.update(loadingToast, {
          render: `Failed to delete event: ${error.message || 'Please try again'}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FiCalendar className="h-5 w-5" />
          </div>
          <h3 className={styles.title}>Upcoming Events</h3>
        </div>
        <button
          onClick={() => setIsAddingEvent(!isAddingEvent)}
          className={styles.addButton}
        >
          <FiPlus className="mr-1.5 h-4 w-4" />
          Add Event
        </button>
      </div>

      {isAddingEvent && (
        <form onSubmit={handleAddEvent} className={styles.eventForm}>
          <div className={styles.formHeader}>
            <h4 className={styles.formTitle}>
              <FiPlus className="mr-2 h-4 w-4 text-blue-600" />
              New Event
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className={styles.closeButton}
              aria-label="Close"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Event title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    name="start"
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 pr-6 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <FiCalendar className="absolute right-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    name="end"
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 pr-6 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={newEvent.start}
                    required
                  />
                  <FiClock className="absolute right-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
              <div className="flex">
                <button
                  type="submit"
                  className="w-full py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Event
                </button>
              </div>
            </div>
            <select
              name="type"
              value={newEvent.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="call">Call</option>
              <option value="reminder">Reminder</option>
            </select>
            <div>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Add description (optional)"
                rows="2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </form>
      )}

      <div className={styles.eventList}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>
              <FiCalendar className={styles.loadingIcon} />
            </div>
            <p className={styles.loadingText}>Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div>
            {events.map((event, index) => (
              <div 
                key={event._id} 
                className={`${styles.eventItem} ${getEventTypeStyle(event.type)}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitleContainer}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      {getEventTypeBadge(event.type)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event._id);
                      }}
                      className={styles.deleteButton}
                      title="Delete event"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={styles.eventTime}>
                    <FiCalendar className={styles.eventTimeIcon} />
                    <span className="font-medium">
                      {format(event.start, 'MMM d, yyyy')}
                    </span>
                    <span className={styles.timeSeparator}>•</span>
                    <FiClock className={styles.eventTimeIcon} />
                    <span>
                      {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                    </span>
                  </div>
                  {event.description && (
                    <p className={styles.eventDescription}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <div className={styles.emptyIconCircle}>
                <FiCalendar className={styles.emptyIconInner} />
              </div>
              <div className={styles.emptyBadge}>
                <FiPlus className={styles.emptyBadgeIcon} />
              </div>
            </div>
            <h4 className={styles.emptyTitle}>No events scheduled</h4>
            <p className={styles.emptyText}>You don't have any upcoming events. Add your first event to get started!</p>
            <button
              onClick={() => setIsAddingEvent(true)}
              className={styles.emptyButton}
            >
              Add your first event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
