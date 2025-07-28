import api from '../api';

const ACTIVITY_ENDPOINT = '/activities'; // Base URL already includes /api

// Mock data for when API is not available
const mockActivities = [
  {
    _id: '1',
    title: 'System Initialized',
    description: 'Activity logging system initialized',
    type: 'system',
    entityType: 'system',
    user: { name: 'System' },
    createdAt: new Date().toISOString()
  }
];

// Map backend activity types to frontend display types
const mapActivityType = (type) => {
  const typeMap = {
    // Auth
    login: { icon: '🔑', color: '#4CAF50' },
    register: { icon: '👤', color: '#2196F3' },
    logout: { icon: '🚪', color: '#9E9E9E' },
    
    // Projects
    project_create: { icon: '🆕', color: '#4CAF50' },
    project_update: { icon: '✏️', color: '#FFC107' },
    project_delete: { icon: '🗑️', color: '#F44336' },
    
    // Internships
    internship_create: { icon: '🎓', color: '#4CAF50' },
    internship_update: { icon: '📝', color: '#FFC107' },
    internship_delete: { icon: '❌', color: '#F44336' },
    
    // Testimonials
    testimonial_create: { icon: '🌟', color: '#4CAF50' },
    testimonial_update: { icon: '✏️', color: '#FFC107' },
    testimonial_delete: { icon: '🗑️', color: '#F44336' },
    
    // Default
    default: { icon: 'ℹ️', color: '#9C27B0' }
  };
  
  return typeMap[type] || typeMap.default;
};

const activityService = {
  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      console.log('Fetching recent activities from:', ACTIVITY_ENDPOINT);
      
      // Try to get activities from the API
      const response = await api.get(`${ACTIVITY_ENDPOINT}?limit=${limit}&sort=-createdAt`);
      
      // The API might return data in different formats, handle various cases
      let activities = [];
      
      if (Array.isArray(response.data)) {
        // Case: Direct array response
        activities = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Case: { data: [...] }
        activities = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.activities)) {
        // Case: { data: { activities: [...] } }
        activities = response.data.data.activities;
      } else if (response.data && response.data.activities) {
        // Case: { activities: [...] }
        activities = response.data.activities;
      }
      
      console.log('Fetched recent activities from API:', activities);
      
      // Always format the activities, even if empty
      const formattedActivities = this.formatActivities(activities);
      
      // If we got activities from the API, return them (even if empty)
      if (formattedActivities && formattedActivities.length > 0) {
        return formattedActivities;
      }
      
      // Fall back to mock data if API returns empty and we're not in production
      if (process.env.NODE_ENV !== 'production') {
        console.log('No activities from API, using mock data');
        return this.formatActivities(mockActivities).slice(0, limit);
      }
      
      return [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || JSON.stringify(error);
      console.error('Error fetching recent activities from API:', errorMessage, error.response?.data);
      
      // Only use mock data in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data due to error');
        return this.formatActivities(mockActivities).slice(0, limit);
      }
      
      // In production, return empty array instead of mock data
      return [];
    }
  },

  // Format activities for display
  formatActivities(activities) {
    if (!Array.isArray(activities)) {
      console.warn('Expected activities to be an array, got:', activities);
      return [];
    }
    
    return activities.map(activity => {
      try {
        if (!activity) return null;
        
        const typeInfo = mapActivityType(activity.type || '');
        const userName = activity.user?.name || activity.userName || 'System';
        const userInitials = userName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        
        // Ensure we have a valid date
        const activityDate = activity.createdAt || activity.timestamp || new Date().toISOString();
        const formattedTime = this.formatTime(activityDate);
        
        return {
          id: activity._id || activity.id || Math.random().toString(36).substr(2, 9),
          title: activity.title || 'Activity',
          description: activity.description || '',
          type: activity.type || 'info',
          entityType: activity.entityType || '',
          entityId: activity.entityId || '',
          icon: typeInfo.icon,
          color: typeInfo.color,
          userName,
          userInitials,
          time: formattedTime,
          raw: activity // Keep original data
        };
      } catch (error) {
        console.error('Error formatting activity:', error, activity);
        return null;
      }
    }).filter(Boolean); // Remove any null entries
  },

  // Format timestamp to relative time (e.g., "2 hours ago")
  formatTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 
          ? `1 ${unit} ago` 
          : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  }
};

export default activityService;
