import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiUser, 
  FiFileText, 
  FiCalendar, 
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
  FiMail,
  FiMessageSquare,
  FiPlus,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './RecentActivities.module.css';
import eventService from '../../services/eventService';
import projectService from '../../services/projectService';

// Mock data for when API is not available
const mockActivities = [
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
    time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    data: { status: 'in-progress' }
  },
  {
    id: 'mock-3',
    type: 'deadline',
    title: 'Project Submission',
    description: 'Final project submission deadline',
    time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    data: {}
  }
];

const getActivityIcon = (type) => {
  const iconProps = { className: styles.activityIcon };
  
  switch(type?.toLowerCase()) {
    case 'meeting':
      return <FiCalendar {...iconProps} />;
    case 'deadline':
      return <FiAlertCircle {...iconProps} />;
    case 'call':
      return <FiMessageSquare {...iconProps} />;
    case 'reminder':
      return <FiClock {...iconProps} />;
    case 'email':
      return <FiMail {...iconProps} />;
    case 'project':
      return <FiFileText {...iconProps} />;
    case 'user':
      return <FiUser {...iconProps} />;
    case 'completed':
      return <FiCheck {...iconProps} />;
    default:
      return <FiExternalLink {...iconProps} />;
  }
};

const getActivityClass = (type) => {
  switch(type?.toLowerCase()) {
    case 'meeting': return styles.activityMeeting;
    case 'deadline': return styles.activityDeadline;
    case 'call': return styles.activityCall;
    case 'reminder': return styles.activityReminder;
    case 'email': return styles.activityEmail;
    case 'project': return styles.activityProject;
    case 'user': return styles.activityUser;
    default: return '';
  }
};

const RecentActivities = ({ limit = 5 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true);
      
      let events = [];
      let projects = [];
      
      try {
        // Try to fetch real data
        [events, projects] = await Promise.all([
          eventService.getEvents({
            limit: Math.ceil(limit / 2),
            sort: '-createdAt'
          }),
          projectService.getProjects({
            limit: Math.ceil(limit / 2),
            sort: '-updatedAt'
          })
        ]);
      } catch (apiError) {
        console.warn('Using mock data due to API error:', apiError);
        // Fall back to mock data
        return setActivities(mockActivities);
      }

      // Transform data into activity format
      const eventActivities = (events || []).map(event => ({
        id: `event-${event._id || Math.random().toString(36).substr(2, 9)}`,
        type: event.type || 'event',
        title: event.title || 'New Event',
        description: event.description || 'No description',
        time: event.createdAt || new Date().toISOString(),
        data: event
      }));

      const projectActivities = (projects || []).map(project => ({
        id: `project-${project._id || Math.random().toString(36).substr(2, 9)}`,
        type: 'project',
        title: project.title || 'Project',
        description: `Project ${project.status || 'updated'}`,
        time: project.updatedAt || project.createdAt || new Date().toISOString(),
        data: project
      }));

      // Combine and sort by time
      let allActivities = [...eventActivities, ...projectActivities];
      
      // If no activities, use mock data
      if (allActivities.length === 0) {
        allActivities = mockActivities;
      } else {
        // Sort and limit the activities
        allActivities = allActivities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, limit);
      }
      
      setActivities(allActivities);
      setError(null);
      
    } catch (err) {
      console.error('Error in fetchActivities:', err);
      setError('Failed to load recent activities');
      // Fall back to mock data on error
      setActivities(mockActivities);
      toast.warning('Using mock data - API not available');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchActivities();
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      return 'Some time ago';
    }
  };

  return (
    <div className={styles.recentActivities}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FiClock className="text-blue-500" />
          Recent Activities
        </h3>
        <button 
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={isRefreshing || loading}
          aria-label="Refresh activities"
        >
          <FiRefreshCw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className={styles.activityList}>
        <AnimatePresence>
          {loading ? (
            <div className={styles.loadingState}>
              <FiRefreshCw className="animate-spin h-5 w-5 mx-auto mb-2" />
              <p>Loading activities...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <FiAlertCircle className="h-5 w-5 mx-auto mb-2" />
              <p>{error}</p>
              <button 
                onClick={fetchActivities}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No recent activities found</p>
            </div>
          ) : (
            activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`${styles.activityItem} ${getActivityClass(activity.type)}`}
              >
                <div className={styles.activityContent}>
                  <div className={styles.activityIcon}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className={styles.activityDetails}>
                    <h4 className={styles.activityTitle}>
                      {activity.title}
                    </h4>
                    <p className={styles.activityDescription}>
                      {activity.description}
                    </p>
                    <div className={styles.activityTime}>
                      <FiClock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.time)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentActivities;
