import api from '../api';

const EVENT_ENDPOINT = '/events';

// Mock data for when API is not available
const mockEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    type: 'meeting',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    description: 'Weekly team sync',
    allDay: false
  },
  {
    id: '2',
    title: 'Project Deadline',
    type: 'deadline',
    start: new Date(Date.now() + 86400000),
    end: new Date(Date.now() + 86400000),
    description: 'Submit final report',
    allDay: true
  }
];

const eventService = {
  // Get all events
  async getEvents() {
    try {
      const response = await api.get(EVENT_ENDPOINT);
      // The response now contains the full response object
      const data = response.data?.data || response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.events)) {
        return data.events;
      }
      
      console.warn('API did not return an array for events. Using mock data instead.');
      return mockEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return mockEvents;
    }
  },

  // Create a new event
  async createEvent(eventData) {
    console.log('Creating event with data:', eventData);
    try {
      // Format dates for the API
      const formattedEvent = {
        ...eventData,
        start: eventData.start instanceof Date ? eventData.start.toISOString() : new Date(eventData.start).toISOString(),
        end: eventData.end instanceof Date ? eventData.end.toISOString() : new Date(eventData.end).toISOString()
      };
      
      console.log('Sending to API:', formattedEvent);
      
      // Send to backend API
      const response = await api.post(EVENT_ENDPOINT, formattedEvent);
      
      console.log('API Response:', response);
      
      // Return the created event
      return response.data.data || response.data;
      
    } catch (error) {
      console.error('Error creating event:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
    }
  },

  // Update an existing event
  async updateEvent(eventId, eventData) {
    try {
      // Ensure dates are properly formatted as ISO strings
      const formattedEvent = {
        ...eventData,
        ...(eventData.start && { start: new Date(eventData.start).toISOString() }),
        ...(eventData.end && { end: new Date(eventData.end).toISOString() })
      };
      
      const response = await api.put(`${EVENT_ENDPOINT}/${eventId}`, formattedEvent);
      
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error.message, error.response?.data);
      throw error.response?.data?.message || error.message || JSON.stringify(error);
    }
  },

  // Delete an event
  async deleteEvent(eventId) {
    console.log(`Deleting event ${eventId}`);
    try {
      const response = await api.delete(`${EVENT_ENDPOINT}/${eventId}`);
      
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Propagate a user-friendly error message.
      const errorMessage = error.response?.data?.message || 'Failed to delete event. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Get upcoming events (for the sidebar)
  async getUpcomingEvents(limit = 5) {
    try {
      // Try to get events from the API
      const response = await api.get(`${EVENT_ENDPOINT}/upcoming?limit=${limit}`);
      
      // The API might return { data: { events: [...] } } or just the array directly
      const events = response.data?.data?.events || response.data?.data || response.data || [];
      
      console.log('Fetched upcoming events from API:', events);
      
      // If we got events from the API, return them
      if (events && events.length > 0) {
        return events;
      }
      
      // Fall back to mock data if API returns empty
      console.log('No events from API, using mock data');
      return mockEvents
        .filter(event => new Date(event.end) >= new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching upcoming events from API:', error);
      
      // Fall back to mock data on error
      return mockEvents
        .filter(event => new Date(event.end) >= new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, limit);
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 5) {
    // Return mock activities
    console.log('Using mock recent activities');
    return [
      {
        id: 'mock-1',
        type: 'meeting',
        title: 'Team Standup',
        description: 'Daily standup meeting with the team',
        time: new Date().toISOString(),
        data: {}
      },
      {
        id: 'mock-2',
        type: 'project',
        title: 'Dashboard Updates',
        description: 'Updated the project dashboard',
        time: new Date(Date.now() - 3600000).toISOString(),
        data: { status: 'in-progress' }
      },
      {
        id: 'mock-3',
        type: 'deadline',
        title: 'Project Submission',
        description: 'Final project submission deadline',
        time: new Date(Date.now() - 86400000).toISOString(),
        data: {}
      }
    ].slice(0, limit);
  }
};

export default eventService;
