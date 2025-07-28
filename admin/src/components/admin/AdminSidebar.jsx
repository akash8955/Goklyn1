import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const AdminSidebar = ({ sections, activeSection, setActiveSection, isSidebarOpen, toggleSidebar, isMobile }) => {
  return (
    <div className="admin-sidebar" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: isSidebarOpen ? '240px' : '60px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarOpen ? 'space-between' : 'center',
        padding: isSidebarOpen ? '1.5rem' : '1rem',
        borderBottom: '1px solid #334155', // Darker border for dark theme
        height: '60px',
        minHeight: '60px',
        boxSizing: 'border-box'
      }}>
        {isSidebarOpen && <span style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#f8fafc', // Light text color for dark background
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: isSidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
          width: isSidebarOpen ? 'auto' : '0',
          flexShrink: 0
        }}>
          Admin Panel
        </span>}
        {/* Always show menu button in sidebar on desktop */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarOpen ? 'flex-end' : 'center',
            width: '100%',
            padding: isSidebarOpen ? '0 0.5rem' : '0'
          }}>
            <button 
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        )}
      </div>
      <ul style={{
        listStyle: 'none',
        padding: '0.5rem',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSidebarOpen ? 'stretch' : 'center'
      }}>
        {sections.map((section) => (
          <li 
            key={section.id}
            style={{
              margin: '0.25rem 0'
            }}
          >
            <button
              onClick={() => setActiveSection(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: isSidebarOpen ? '100%' : 'auto',
                padding: isSidebarOpen ? '0.75rem 1rem' : '0.75rem',
                background: activeSection === section.id ? 'var(--primary-color)' : 'transparent',
                border: 'none',
                color: activeSection === section.id ? 'white' : '#e2e8f0',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                transition: 'all 0.2s ease',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                boxShadow: 'none'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                if (activeSection !== section.id) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (activeSection !== section.id) {
                  e.target.style.background = 'transparent';
                }
              }}
              onMouseOver={(e) => {
                if (activeSection !== section.id) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== section.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                width: '100%',
                position: 'relative'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  marginRight: isSidebarOpen ? '0.75rem' : '0'
                }}>
                  {section.icon}
                </span>
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.95rem',
                  opacity: isSidebarOpen ? 1 : 0,
                  width: isSidebarOpen ? 'auto' : '0',
                  transition: 'all 0.2s ease',
                  position: isSidebarOpen ? 'relative' : 'absolute',
                  left: isSidebarOpen ? '0' : '-100%'
                }}>
                  {section.label}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
