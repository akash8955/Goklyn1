import React from 'react';

const AdminSidebar = ({ sections, activeSection, setActiveSection }) => {
  return (
    <nav className="sidebar-nav">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => setActiveSection(section.id)}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            >
              <span className="icon">{section.icon}</span>
              <span className="label">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{
        __html: `
          .sidebar-nav {
            height: 100%;
          }
          .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .nav-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 12px 20px;
            background: none;
            border: none;
            color: #e0e0e0;
            cursor: pointer;
            text-align: left;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.2s;
            gap: 10px;
          }
          
          .nav-item:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
          
          .nav-item.active {
            background: rgba(255, 255, 255, 0.15);
            color: #4fc3f7;
            border-left: 3px solid #4fc3f7;
            font-weight: 600;
          }
          
          .icon {
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            color: inherit;
          }
          
          .label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          /* Mobile sidebar animation */
          @media (max-width: 900px) {
            .sidebar-nav {
              min-height: 100vh;
            }
          }
        `
      }} />
    </nav>
  );
};

export default AdminSidebar;
