import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaCog, 
  FaSignOutAlt, 
  FaFileAlt, 
  FaTasks,
  FaLaptopCode,
  FaClipboardCheck,
  FaUserGraduate,
  FaStar,
  FaChartBar
} from 'react-icons/fa';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Handle window resize and set initial state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      // Close sidebar on mobile by default
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login', { replace: true });
          return;
        }
        setError(null);
      } catch (err) {
        console.error('Dashboard auth check failed:', err);
        setError('Failed to verify authentication. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, navigate]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const hamburger = document.querySelector('.hamburger');
      
      if (sidebar && !sidebar.contains(e.target) && 
          hamburger && !hamburger.contains(e.target)) {
        toggleSidebar(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full max-w-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Page
        </button>
      </div>
    );
  }



  // Toggle sidebar with animation
  const toggleSidebar = (forceClose = false) => {
    if (isMobile) {
      // On mobile, toggle open/close
      const newState = forceClose ? false : !isSidebarOpen;
      setIsSidebarOpen(newState);
      
      // Toggle overlay
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.classList.toggle('visible', newState);
      }
    } else {
      // On desktop, toggle between expanded and collapsed
      setIsSidebarOpen(!isSidebarOpen);
    }
  };
  


  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items
  const navItems = [
    { 
      icon: <FaHome className="nav-icon" />, 
      text: 'Dashboard', 
      path: '/dashboard',
      exact: true
    },
    { 
      icon: <FaTasks className="nav-icon" />, 
      text: 'Project Management', 
      path: '/dashboard/projects'
    },
    { 
      icon: <FaLaptopCode className="nav-icon" />, 
      text: 'Internship Management', 
      path: '/dashboard/internships'
    },
    { 
      icon: <FaStar className="nav-icon" />, 
      text: 'Testimonial Management', 
      path: '/dashboard/testimonials'
    },
    { 
      icon: <FaChartBar className="nav-icon" />, 
      text: 'Reports', 
      path: '/dashboard/reports'
    },
    { 
      icon: <FaCog className="nav-icon" />, 
      text: 'Settings', 
      path: '/dashboard/settings'
    },
  ];
  
  // Always show sidebar, but control collapsed state
  const showSidebar = true; // Always show on desktop, controlled by isSidebarOpen

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay - Always in DOM but conditionally visible */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen && isMobile ? 'visible' : ''}`} 
        onClick={() => toggleSidebar(true)}
      ></div>
      
      {/* Sidebar - Always show, control collapsed state */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo flex items-center">
            {isSidebarOpen ? (
              <span className="logo-text">Admin Panel</span>
            ) : (
              <span className="logo-icon">AP</span>
            )}
          </Link>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }} 
            className="hamburger"
            aria-label={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item, index) => (
            <div key={index} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${window.location.pathname === item.path ? 'active' : ''}`}
                onClick={() => isMobile && toggleSidebar()}
              >
                {item.icon}
                <span className="nav-text">{item.text}</span>
              </Link>
            </div>
          ))}
          
          <div className="nav-item">
            <button 
              onClick={handleLogout} 
              className="nav-link"
              style={{ width: '100%', textAlign: 'left' }}
            >
              <FaSignOutAlt className="nav-icon" />
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        {/* Top Bar with Menu and Logout */}
        <div className="top-bar">
          <div className="flex-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className="hamburger"
              aria-label="Toggle menu"
            >
              <FaBars className="text-gray-800" />
            </button>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-button flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            title="Logout"
          >
            <FaSignOutAlt className="mr-2" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Page Content */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
