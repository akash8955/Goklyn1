import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiBriefcase, FiFileText, FiMessageSquare, FiSettings, FiAward, FiImage } from 'react-icons/fi';
import DashboardLayout from './dashboard/DashboardLayout'; // This component should contain the layout JSX
import DashboardHome from './dashboard/Home';
import ProjectsPage from './ProjectsPage';
import InternshipsPage from './InternshipsPage';
import TestimonialsPage from './TestimonialsPage';
import NewsPage from './NewsPage';
import SettingsPage from './SettingsPage';
import Gallery from './gallery';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Handle window resize and initial mobile check
  useEffect(() => {
    const checkIfMobile = () => window.innerWidth < 1024;
    
    const handleResize = () => {
      const isNowMobile = checkIfMobile();
      if (isMobile !== isNowMobile) {
        setIsMobile(isNowMobile);
      }
      if (!isNowMobile) {
        setShowMobileMenu(false);
      }
    };

    // Initial check
    const initialMobileCheck = checkIfMobile();
    setIsMobile(initialMobileCheck);
    if (!initialMobileCheck) {
      setShowMobileMenu(false);
    }

    // Add debounce to resize handler
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  // Component map for dynamic rendering
  const componentMap = {
    home: DashboardHome,
    projects: ProjectsPage,
    news: NewsPage,
    gallery: Gallery,
    internships: InternshipsPage,
    testimonials: TestimonialsPage,
    settings: SettingsPage,
  };

  // Sidebar navigation items
  const sidebarSections = [
    { id: 'home', label: 'Dashboard', icon: <FiHome /> },
    { id: 'projects', label: 'Projects', icon: <FiBriefcase /> },
    { id: 'news', label: 'News', icon: <FiFileText /> },
    { id: 'gallery', label: 'Gallery', icon: <FiImage /> },
    { id: 'internships', label: 'Internships', icon: <FiAward /> },
    { id: 'testimonials', label: 'Testimonials', icon: <FiMessageSquare /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  // Get the active component from the map
  const ActiveComponent = componentMap[activeSection] || DashboardHome;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      sidebarSections={sidebarSections}
      activeSection={activeSection}
      handleSectionChange={handleSectionChange}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      isMobile={isMobile}
      showMobileMenu={showMobileMenu}
      closeMobileMenu={closeMobileMenu}
    >
      {ActiveComponent && <ActiveComponent />}
    </DashboardLayout>
  );
};

export default DashboardPage;
