import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username}</span>
            <button 
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="Projects"
            description="Manage your projects"
            link="/admin/projects"
            linkText="View Projects"
          />
          <DashboardCard 
            title="Internships"
            description="Manage internships"
            link="/admin/internships"
            linkText="View Internships"
          />
          <DashboardCard 
            title="Testimonials"
            description="Manage testimonials"
            link="/admin/testimonials"
            linkText="View Testimonials"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, link, linkText }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-gray-600 mb-4">{description}</p>
    <Link 
      to={link}
      className="text-indigo-600 hover:underline"
    >
      {linkText} →
    </Link>
  </div>
);

export default DashboardPage;
