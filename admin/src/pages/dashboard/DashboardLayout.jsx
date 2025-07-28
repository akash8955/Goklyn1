import React from 'react';
import { FiX, FiMenu } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import styles from '../../styles/DashboardLayout.module.css';

const DashboardLayout = ({
  isMobile,
  isSidebarOpen,
  showMobileMenu,
  toggleSidebar,
  closeMobileMenu,
  sidebarSections,
  activeSection,
  handleSectionChange,
  user,
  logout,
  children
}) => {
  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Header with Menu Button */}
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button 
            className={styles.mobileMenuButton}
            onClick={toggleSidebar}
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
          >
            {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--text-primary)',
            marginLeft: '1rem'
          }}>
            {sidebarSections.find(section => section.id === activeSection)?.label || 'Dashboard'}
          </h1>
        </div>
      )}

      {/* Overlay for mobile */}
      <div
        className={`${styles.sidebarOverlay} ${showMobileMenu ? styles.sidebarOverlayOpen : ''}`}
        onClick={closeMobileMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && closeMobileMenu()}
        aria-label="Close menu"
      />

      {/* Sidebar */}
      <div
        className={`${styles.sidebar} 
          ${!isSidebarOpen ? styles.sidebarCollapsed : ''} 
          ${showMobileMenu ? styles.sidebarOpen : ''}`}
        style={{
          zIndex: 100,
          ...(isMobile && !showMobileMenu ? { transform: 'translateX(-100%)' } : {})
        }}
      >
        <AdminSidebar
          sections={sidebarSections}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content */}
      <div
        className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentExpanded : ''}`}
        style={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? '240px' : '60px',
          width: isMobile ? '100%' : isSidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 60px)'
        }}
      >
        {/* Top Bar - Desktop Only */}
        {!isMobile && (
          <div className={styles.topBar}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: 0,
              flexGrow: 1,
              color: 'var(--text-primary)'
            }}>
              {sidebarSections.find(section => section.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
                display: 'inline-block'
              }}>
                Welcome, {user?.username}
              </span>
              <button
                onClick={logout}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={styles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
