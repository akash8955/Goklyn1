import React, { useState, useEffect } from 'react';
import { 
  FiPlus,
  FiEye, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiCalendar, 
  FiClock,
  FiActivity,
  FiRefreshCw,
  FiUpload
} from 'react-icons/fi';
import SimpleChart from '../../components/dashboard/SimpleChart';
import Calendar from '../../components/dashboard/Calendar';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents';
import RecentActivities from '../../components/dashboard/RecentActivities';
import './DashboardHome.css';
import { Card, Empty, Spin, Button } from 'antd';
import { Link } from 'react-router-dom';
import useDashboardNews from '../../hooks/useDashboardNews';
import useDashboardGallery from '../../hooks/useDashboardGallery';

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

function DashboardNewsPreview() {
  const { news, total, loading, error } = useDashboardNews(5);
  if (loading) return <Spin />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!news.length) return <Empty description="No news found" />;
  return (
    <div>
      <ul style={{ paddingLeft: 20 }}>
        {news.map(item => (
          <li key={item._id || item.id} style={{ marginBottom: 8 }}>
            <strong>{item.title}</strong>
            {item.publishedAt && (
              <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>
                ({new Date(item.publishedAt).toLocaleDateString()})
              </span>
            )}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 8, color: '#555' }}>Total News: {total}</div>
    </div>
  );
}

function DashboardGalleryPreview() {
  const { gallery, total, loading, error } = useDashboardGallery(5);
  if (loading) return <Spin />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!gallery.length) return <Empty description="No gallery items" />;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {gallery.map(item => (
        <div key={item._id || item.id} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.url ? <img src={item.url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>No Image</span>}
        </div>
      ))}
      <div style={{ width: '100%' }}>
        <span style={{ color: '#555' }}>Total Images: {total}</span>
      </div>
    </div>
  );
}

const DashboardHome = () => {
  const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);
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
      
      {/* Dashboard Data Previews */}
      <div className="dashboard-data-previews" style={{ display: 'flex', gap: 24, margin: '32px 0' }}>
        {/* Latest News Preview */}
        <Card 
          title="Latest News" 
          style={{ flex: 1 }}
          extra={
            <Link to="/news/create">
              <Button type="primary" icon={<FiPlus />} size="small">
                Create New
              </Button>
            </Link>
          }
        >
          <DashboardNewsPreview />
        </Card>
        {/* Latest Gallery Preview */}
        <Card 
          title="Latest Gallery" 
          style={{ flex: 1 }}
          extra={
            <Link to="/gallery/upload">
              <Button icon={<FiUpload />} size="small">Upload</Button>
            </Link>
          }
        >
          <DashboardGalleryPreview />
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Calendar Section */}
          <div className="calendar-section">
            <h3>Calendar</h3>
            <Calendar />
          </div>

          {/* Recent Activities Section */}
          <div className="recent-activities-section">
            <div className="section-header">
              <h3>Recent Activities</h3>
              <button 
                className="refresh-button" 
                onClick={() => setActivitiesRefreshTrigger(prev => prev + 1)}
                aria-label="Refresh activities"
                title="Refresh activities"
              >
                <FiRefreshCw className="refresh-icon" />
              </button>
            </div>
            <RecentActivities limit={5} refreshTrigger={activitiesRefreshTrigger} />
          </div>
        </div>

        {/* Right Column (Upcoming Events) */}
        <div className="upcoming-events-section">
          <h3>Upcoming Events</h3>
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
