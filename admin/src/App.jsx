import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { GalleryProvider } from './contexts/GalleryContext';
import { NewsProvider } from './contexts/NewsContext';
import styles from './App.module.css';
import './styles/news.css'; // Import news styles

// Lazy load pages with explicit .jsx extension
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const GalleryPage = lazy(() => import('./pages/gallery/index.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const NewsPage = lazy(() => import('./pages/NewsPage.jsx'));

// Loading component
const LoadingScreen = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingText}>
        Loading...
      </div>
    </div>
  );
};

// Create a client
const queryClient = new QueryClient();

// Main App component
function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorLink: '#1890ff',
        },
      }}
    >
      <div className={styles.appContainer}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingScreen />}>
            <GalleryProvider>
              <NewsProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Protected Dashboard Layout Route */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
                    <Route index element={<Navigate to="projects" replace />} />
                    <Route
                      path="projects"
                      element={
                        <ProtectedRoute>
                          <ProjectsPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* TODO: Add routes for creating/editing projects, e.g., */}
                    {/* <Route path="projects/new" element={<ProjectForm />} /> */}
                    {/* <Route path="projects/edit/:id" element={<ProjectForm isEdit />} /> */}
                    <Route path="gallery/*" element={<GalleryPage />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="news/create" element={<NewsPage isCreate />} />
                    <Route path="news/:id" element={<NewsPage />} />
                    <Route path="news/:id/edit" element={<NewsPage isEdit />} />
                  </Route>

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </NewsProvider>
            </GalleryProvider>
          </Suspense>
        </QueryClientProvider>
      </div>
    </ConfigProvider>
  );
}

export default App;
