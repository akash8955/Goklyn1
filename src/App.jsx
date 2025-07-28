import React, { Suspense, lazy, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route } from 'react-router-dom';

import ScrollTop from './components/ScrollTop/ScrollTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { GalleryProvider } from './contexts/GalleryContext';

// Debug logging
console.log('App.jsx: React version', React.version);
console.log('App.jsx: Environment variables', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  PUBLIC_URL: process.env.PUBLIC_URL
});

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const ApplyPage = lazy(() => import('./pages/ApplyPage'));
const AddTestimonialPage = lazy(() => import('./pages/AddTestimonialPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const GalleryDetailPage = lazy(() => import('./pages/GalleryDetailPage'));
const GalleryFormPage = lazy(() => import('./pages/GalleryFormPage'));

// Define page-specific classes for different routes
const pageClasses = {
  "/": "banner-section-outer",
  "/about": "sub-banner-section-outer",
  "/about-us": "sub-banner-section-outer",
  "/services": "sub-banner-section-outer services-banner-section-outer",
  "/faqs": "sub-banner-section-outer",
  "/portfolio": "sub-banner-section-outer services-banner-section-outer",
  "/our-team": "sub-banner-section-outer",
  "/contact": "sub-banner-section-outer contact-banner-section-outer",
  "/contact-us": "sub-banner-section-outer contact-banner-section-outer",
  "/career": "sub-banner-section-outer contact-banner-section-outer",
  "/gallery": "sub-banner-section-outer",
  "/gallery/upload": "sub-banner-section-outer"
};

const App = () => {
  console.log('App: Rendering...');
  
  // Create a separate component to handle route content
  const RouteContent = () => {
    const location = useLocation();
    const containerClass = pageClasses[location.pathname] || "banner-section-outer";
    
    console.log('RouteContent: Rendering with pathname:', location.pathname);
    
    // Trigger all .hover-effect elements to animate on every route change
    useEffect(() => {
      console.log('RouteContent: useEffect running for location:', location.pathname);
      try {
        const els = document.querySelectorAll('.hover-effect');
        console.log(`RouteContent: Found ${els.length} hover-effect elements`);
        els.forEach(el => {
          el.classList.remove('hover-effect-animate');
          void el.offsetWidth; // Force reflow
          el.classList.add('hover-effect-animate');
        });
      } catch (error) {
        console.error('Error in hover effect animation:', error);
      }
      
      return () => {
        console.log('RouteContent: Cleaning up effects for:', location.pathname);
      };
    }, [location]);

    return (
      <div className={`${containerClass} position-relative`}>
        <ScrollTop>
          <Header />
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about-us" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/portfolio" element={<ProjectPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/career" element={<CareerPage />} />
                <Route path="/apply/:internshipId" element={<ApplyPage />} />
                <Route path="/add-testimonial" element={<AddTestimonialPage />} />
                <Route path="/terms" element={<TermsPage />} />
                
                {/* Gallery Routes */}
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/gallery/:id" element={<GalleryDetailPage />} />
                <Route path="/gallery-upload" element={<GalleryFormPage />} />
                
                {/* 404 - Keep this as the last route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Footer />
        </ScrollTop>
      </div>
    );
  };

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  return <RouteContent />;
};

// Wrap the App with ErrorBoundary at the top level
const AppWrapper = () => {
  return (
    <GalleryProvider>
      <App />
    </GalleryProvider>
  );
};

// Main app export with error boundary
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100">
      <LoadingSpinner size="lg" />
    </div>}>
      <AppWrapper />
    </Suspense>
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
