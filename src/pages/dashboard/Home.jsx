import React, { useState, useEffect } from 'react';
import { 
  FiEye, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiCalendar, 
  FiClock,
  FiActivity
} from 'react-icons/fi';
import SimpleChart from '../../components/dashboard/SimpleChart';
import Calendar from '../../components/dashboard/Calendar';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents';
import RecentActivities from '../../components/dashboard/RecentActivities';
import './DashboardHome.css';

const StatBox = ({ icon, title, value, change, color }) => {
  return (
    <div className="stat-box" data-color={color}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-title">{title}</span>
        <div className="stat-trend">
          <FiTrendingUp className="trend-icon" />
          <span className="trend-value">{change}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Visits', value: '2,845', change: '+12.5%', icon: <FiEye />, color: 'blue' },
    { id: 2, title: 'Projects Added', value: '42', change: '+8.2%', icon: <FiBriefcase />, color: 'green' },
    { id: 3, title: 'Internships Submitted', value: '128', change: '+5.1%', icon: <FiFileText />, color: 'purple' },
  ]);

  // Animation effect for the stat boxes
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-box').forEach(box => {
      observer.observe(box);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-heading">Welcome to Dashboard</h1>
      
      <div className="stats-container">
        {stats.map(stat => (
          <StatBox
            key={stat.id}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Analytics Chart Section */}
      <div className="chart-container">
        <SimpleChart />
      </div>
      
      {/* Calendar and Events Section */}
      <div className="calendar-events-section">
        <div className="calendar-container">
          <Calendar />
        </div>
        <div className="events-sidebar">
          <UpcomingEvents />
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <div className="recent-activities-section">
        <div className="section-header">
          <FiActivity className="section-icon" />
          <h2>Recent Activities</h2>
        </div>
        <RecentActivities limit={5} />
      </div>
    </div>
  );
};

export default DashboardHome;
