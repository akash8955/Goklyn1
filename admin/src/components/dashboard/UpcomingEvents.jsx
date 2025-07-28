import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FiPlus, FiClock, FiCalendar, FiX, FiSave } from 'react-icons/fi';
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
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000), // 1 hour later
    type: 'meeting',
  });
  const [tempDate, setTempDate] = useState({
    start: '',
    end: ''
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

  const formatForDateTimeLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field, value) => {
    setTempDate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const confirmDateTime = () => {
    try {
      let start = tempDate.start ? new Date(tempDate.start) : new Date(newEvent.start);
      let end = tempDate.end ? new Date(tempDate.end) : new Date(newEvent.end);

      // Ensure start is a valid date
      if (isNaN(start.getTime())) {
        start = new Date(newEvent.start);
      }
      
      // Ensure end is a valid date and after start
      if (isNaN(end.getTime()) || end <= start) {
        end = new Date(start);
        end.setHours(end.getHours() + 1); // Default to 1 hour duration
      }

      setNewEvent(prev => ({
        ...prev,
        start,
        end
      }));

    } catch (error) {
      console.error('Error parsing date:', error);
      toast.error('Invalid date format');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    // First, confirm the date and time from temp state
    confirmDateTime();
    
    // Use a timeout to allow state to update before creating event
    setTimeout(async () => {
      if (!newEvent.title) {
        toast.error('Event title is required');
        return;
      }
      
      try {
        await eventService.createEvent(newEvent);
        toast.success('Event added successfully');
        setIsAddingEvent(false);
        setNewEvent({ title: '', description: '', start: new Date(), end: new Date(Date.now() + 3600000), type: 'meeting' });
        fetchEvents(); // Refresh the list
      } catch (error) {
        console.error('Failed to add event:', error);
        toast.error(error.message || 'Failed to add event');
      }
    }, 100);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.error(error.message || 'Failed to delete event');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upcoming Events</h3>
        <button 
          className={styles.addButton} 
          onClick={() => setIsAddingEvent(!isAddingEvent)}
          aria-label={isAddingEvent ? 'Cancel' : 'Add new event'}
        >
          {isAddingEvent ? <FiX /> : <FiPlus />}
        </button>
      </div>

      {isAddingEvent && (
        <form onSubmit={handleAddEvent} className={styles.eventForm}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleInputChange}
            className={styles.inputField}
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={newEvent.description}
            onChange={handleInputChange}
            className={styles.inputField}
          />
          <div className={styles.dateTimeFields}>
            <div className={styles.dateTimeInput}>
              <label htmlFor="start-time">Start</label>
              <input 
                id="start-time"
                type="datetime-local" 
                onChange={(e) => handleDateTimeChange('start', e.target.value)}
                onBlur={confirmDateTime}
                defaultValue={formatForDateTimeLocal(newEvent.start)}
                className={styles.inputField}
              />
            </div>
            <div className={styles.dateTimeInput}>
              <label htmlFor="end-time">End</label>
              <input 
                id="end-time"
                type="datetime-local" 
                onChange={(e) => handleDateTimeChange('end', e.target.value)}
                onBlur={confirmDateTime}
                defaultValue={formatForDateTimeLocal(newEvent.end)}
                className={styles.inputField}
              />
            </div>
          </div>
          <select 
            name="type" 
            value={newEvent.type} 
            onChange={handleInputChange} 
            className={styles.inputField}
          >
            <option value="meeting">Meeting</option>
            <option value="deadline">Deadline</option>
            <option value="call">Call</option>
            <option value="reminder">Reminder</option>
          </select>
          <button type="submit" className={styles.saveButton}>
            <FiSave />
            Save Event
          </button>
        </form>
      )}

      {isLoading ? (
        <div className={styles.loader}>Loading events...</div>
      ) : events.length > 0 ? (
        <ul className={styles.eventList}>
          {events.map((event, index) => (
            <li 
                key={event._id || index} 
                className={styles.eventItem}
                onMouseEnter={() => setHoveredEventId(event._id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
              <div className={getEventTypeStyle(event.type)}></div>
              <div className={styles.eventDetails}>
                <div className={styles.eventHeader}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
                <div className={styles.eventTime}>
                  <FiClock />
                  <span>{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</span>
                </div>
              </div>
              {hoveredEventId === event._id && (
                <div 
                  className={styles.eventDeleteAction} 
                  onClick={() => handleDeleteEvent(event._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDeleteEvent(event._id);
                    }
                  }}
                  role="button"
                  tabIndex="0"
                  aria-label="Delete event"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noEvents}>
          <FiCalendar size={24} />
          <p>No upcoming events.</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
