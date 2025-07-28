import React, { useState, useEffect } from 'react';
import { 
  FiRefreshCw, 
  FiClock, 
  FiUser, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiInfo, 
  FiPlus, 
  FiEdit2, 
  FiTrash2,
  FiExternalLink
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import activityService from '../../services/activityService';
import './RecentActivities.css';

const RecentActivities = ({ refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await activityService.getRecentActivities(10);
      setActivities(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Using sample data.');
      // If we have no activities and there's an error, use empty array to avoid showing old data
      if (!activities.length) {
        setActivities([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effect to fetch activities when refreshTrigger changes
  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivities();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchActivities();
    }
  };

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return formatTimeAgo(date);
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatTimeAgo = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return 'just now';

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    
    return 'just now';
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <FiPlus className="activity-icon create" />;
      case 'update':
        return <FiEdit2 className="activity-icon update" />;
      case 'delete':
        return <FiTrash2 className="activity-icon delete" />;
      case 'login':
        return <FiCheckCircle className="activity-icon success" />;
      case 'error':
        return <FiAlertTriangle className="activity-icon error" />;
      default:
        return <FiInfo className="activity-icon info" />;
    }
  };

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'create':
        return '#10b981'; // Green
      case 'update':
        return '#3b82f6'; // Blue
      case 'delete':
        return '#ef4444'; // Red
      case 'login':
        return '#8b5cf6'; // Purple
      case 'error':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280'; // Gray
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="recent-activities">
        <div className="activities-header">
          <h2 className="activities-title">
            <FiClock className="header-icon" />
            Recent Activities
          </h2>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh activities"
            title="Refresh activities"
          >
            <FiRefreshCw className={`refresh-icon ${isRefreshing ? 'refreshing' : ''}`} />
          </button>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activities">
      <div className="activities-header">
        <h2 className="activities-title">
          <FiClock className="header-icon" />
          Recent Activities
        </h2>
        <div className="header-actions">
          {lastRefreshed && (
            <span 
              className="last-updated" 
              title={`Last updated: ${lastRefreshed.toLocaleTimeString()}`}
            >
              <FiClock className="last-updated-icon" />
              {formatTimeAgo(lastRefreshed)}
            </span>
          )}
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh activities"
            title="Refresh activities"
          >
            <FiRefreshCw className={`refresh-icon ${isRefreshing ? 'refreshing' : ''}`} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FiAlertCircle className="error-icon" />
            <span>{error}</span>
            <button 
              className="dismiss-button" 
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiInfo className="empty-icon" />
            <p>No activities found</p>
            <button 
              className="retry-button" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Try Again'}
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.id || index}
                className="activity-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
                style={{
                  borderLeftColor: getActivityColor(activity.type)
                }}
              >
                <div className="activity-icon-container">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h4 className="activity-title">{activity.title}</h4>
                    <span className="activity-time" title={new Date(activity.time).toLocaleString()}>
                      <FiClock className="time-icon" />
                      {formatTime(activity.time)}
                    </span>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  
                  {(activity.entityType || activity.userName) && (
                    <div className="activity-meta">
                      {activity.userName && (
                        <span className="meta-item user">
                          <FiUser className="meta-icon" />
                          {activity.userName}
                        </span>
                      )}
                      
                      {activity.entityType && (
                        <span className="meta-item entity">
                          <span className="entity-type">{activity.entityType}</span>
                          {activity.entityId && (
                            <a 
                              href={`/dashboard/${activity.entityType}/${activity.entityId}`}
                              className="entity-link"
                              onClick={(e) => {
                                e.preventDefault();
                                // Handle navigation to entity
                                console.log(`Navigate to ${activity.entityType}/${activity.entityId}`);
                              }}
                            >
                              View <FiExternalLink size={12} />
                            </a>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <style jsx>{`
        .recent-activities {
          padding: 1.25rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
        }
        
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          position: relative;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .last-updated {
          font-size: 0.75rem;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-right: 0.5rem;
        }
        
        .last-updated-icon {
          font-size: 0.75rem;
        }
        
        .activity-header h3 {
          margin: 0;
          color: #111827;
          font-size: 1.125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .activity-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .refresh-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .refresh-button:hover {
          color: #2563eb;
          background-color: #f3f4f6;
        }
        
        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .refresh-button.refreshing {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex-grow: 1;
          overflow-y: auto;
          max-height: 500px;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
        
        .activity-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .activity-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .activity-list::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 3px;
        }
        
        .activity-item {
          padding: 0.75rem;
          margin: 0 -0.75rem;
          border-left: 3px solid transparent;
          display: flex;
          gap: 0.75rem;
          transition: all 0.2s;
          position: relative;
        }
        
        .activity-item:hover {
          background-color: #f9fafb;
          border-left-color: var(--activity-color, #2563eb);
        }
        
        .activity-item:not(:last-child)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 1.5rem;
          right: 0;
          height: 1px;
          background-color: #f3f4f6;
        }
        
        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          background-color: var(--activity-color, #2563eb);
          color: white;
        }
        
        .activity-emoji {
          font-size: 1rem;
          line-height: 1;
        }
        
        .user-avatar {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #2563eb;
          color: white;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          font-weight: 600;
        }
        
        .activity-content {
          flex-grow: 1;
          min-width: 0;
        }
        
        .activity-content .activity-header {
          margin-bottom: 0.25rem;
        }
        
        .activity-title {
          font-weight: 500;
          margin: 0;
          color: #111827;
          font-size: 0.875rem;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .activity-time {
          color: #9ca3af;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: auto;
          white-space: nowrap;
        }
        
        .time-icon {
          font-size: 0.75rem;
        }
        
        .activity-description {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.8125rem;
          line-height: 1.5;
          word-wrap: break-word;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        
        .user-name {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #4b5563;
          font-weight: 500;
          margin-right: 0.25rem;
          font-size: 0.8125rem;
        }
        
        .user-icon {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .activity-entity {
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        
        .entity-type {
          background-color: #f3f4f6;
          color: #4b5563;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .entity-id {
          color: #9ca3af;
          font-family: monospace;
        }
        
        .loading,
        .no-activities {
          color: #6b7280;
          font-size: 0.875rem;
          padding: 1.5rem 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-grow: 1;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
          color: #9ca3af;
          font-size: 1.25rem;
        }
        
        .no-data-icon {
          font-size: 1.5rem;
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }
        
        .error-message {
          color: #dc2626;
          font-size: 0.8125rem;
          background-color: #fef2f2;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-left: 3px solid #fca5a5;
        }
        
        .error-icon {
          flex-shrink: 0;
          font-size: 1rem;
        }
        
        /* Activity type specific styles */
        .activity-item.project_create { --activity-color: #10b981; }
        .activity-item.project_update { --activity-color: #f59e0b; }
        .activity-item.project_delete { --activity-color: #ef4444; }
        .activity-item.internship_create { --activity-color: #3b82f6; }
        .activity-item.internship_update { --activity-color: #8b5cf6; }
        .activity-item.internship_delete { --activity-color: #ec4899; }
        .activity-item.testimonial_create { --activity-color: #f59e0b; }
        .activity-item.testimonial_update { --activity-color: #8b5cf6; }
        .activity-item.testimonial_delete { --activity-color: #ef4444; }
        .activity-item.login { --activity-color: #10b981; }
        .activity-item.logout { --activity-color: #6b7280; }
        .activity-item.register { --activity-color: #3b82f6; }
        
        @media (max-width: 768px) {
          .recent-activities {
            padding: 1rem;
          }
          
          .activity-item {
            padding: 0.75rem 0.5rem;
            margin: 0 -0.5rem;
          }
          
          .activity-time {
            font-size: 0.6875rem;
          }
          
          .activity-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentActivities;
