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
      return response.data;
    } catch (error) {
      console.warn('Falling back to mock events due to API error:', error.message);
      return mockEvents; // Return mock data when API fails
    }
  },

  // Create a new event
  async createEvent(eventData) {
    console.log('Creating event with data:', eventData);
    try {
      // Ensure dates are properly formatted as ISO strings
      const formattedEvent = {
        ...eventData,
        start: eventData.start instanceof Date ? eventData.start.toISOString() : new Date(eventData.start).toISOString(),
        end: eventData.end instanceof Date ? eventData.end.toISOString() : new Date(eventData.end).toISOString()
      };
      
      console.log('Sending to API:', formattedEvent);
      
      const response = await api.post(EVENT_ENDPOINT, formattedEvent);
      
      console.log('API Response:', response);
      
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      const result = {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end)
      };
      
      console.log('Created event:', result);
      return result;
      
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
      
      // Create a more helpful error message
      const errorMessage = error.response?.data?.message || 
                         (error.response?.status === 400 ? 'Invalid request data' : 'Failed to create event');
      
      const errorWithDetails = new Error(errorMessage);
      errorWithDetails.response = error.response;
      throw errorWithDetails;
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
      return {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end)
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const response = await fetch(`http://localhost:5000${EVENT_ENDPOINT}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete event';
        try {
          // Try to parse error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // For 204 No Content responses, return a success message
      if (response.status === 204) {
        return { success: true, message: 'Event deleted successfully' };
      }

      // For other successful responses, parse as JSON
      try {
        return await response.json();
      } catch (e) {
        // If response is not JSON but was successful, return success
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get upcoming events (for the sidebar)
  async getUpcomingEvents(limit = 5) {
    try {
      const response = await fetch(`http://localhost:5000/api/events/upcoming?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch upcoming events';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Log the response for debugging
      console.log('Upcoming events response:', responseData);
      
      // Ensure we have the expected data structure
      if (!responseData.data || !Array.isArray(responseData.data.events)) {
        console.error('Unexpected response format:', responseData);
        throw new Error('Unexpected response format from server');
      }
      
      // Convert ISO date strings to Date objects
      return responseData.data.events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      throw error;
    }
  }
};

export default eventService;
