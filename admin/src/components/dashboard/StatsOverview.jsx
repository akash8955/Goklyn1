import React from 'react';
import { FiEye, FiBriefcase, FiFileText, FiUsers, FiTrendingUp } from 'react-icons/fi';

const StatsOverview = ({ onDataChange }) => {
  // Mock data - replace with actual data from your API
  const stats = [
    { id: 1, title: 'Total Visits', value: '2,845', change: '+12.5%', icon: <FiEye />, color: 'blue' },
    { id: 2, title: 'Projects Added', value: '42', change: '+8.2%', icon: <FiBriefcase />, color: 'green' },
    { id: 3, title: 'Internships', value: '128', change: '+5.1%', icon: <FiFileText />, color: 'purple' },
    { id: 4, title: 'Active Users', value: '1,024', change: '+3.7%', icon: <FiUsers />, color: 'orange' },
  ];

  return (
    <div className="stats-overview">
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <div className="stat-trend">
                <FiTrendingUp className="trend-icon" />
                <span className="trend-value">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .stats-overview {
          padding: 1rem 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 0.5rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: flex-start;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          font-size: 1.25rem;
        }
        
        .stat-blue .stat-icon { background-color: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .stat-green .stat-icon { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-purple .stat-icon { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .stat-orange .stat-icon { background-color: rgba(249, 115, 22, 0.1); color: #f97316; }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
        }
        
        .stat-title {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          font-size: 0.8125rem;
          font-weight: 500;
        }
        
        .trend-icon {
          margin-right: 0.25rem;
        }
        
        .stat-blue .trend-value { color: #2563eb; }
        .stat-green .trend-value { color: #10b981; }
        .stat-purple .trend-value { color: #8b5cf6; }
        .stat-orange .trend-value { color: #f97316; }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsOverview;
