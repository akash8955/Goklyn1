import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch,
  FiUser,
  FiBriefcase,
  FiClock,
  FiMessageSquare
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './ManageTestimonialsPage.css';

const TestimonialCard = ({ testimonial, onDelete, onEdit, showActions = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setIsDeleting(true);
      try {
        await onDelete(testimonial._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div 
      className="testimonial-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="testimonial-content">
        <div className="testimonial-meta">
          <span className="font-medium">{testimonial.name}</span>
          <span className="text-sm">{new Date(testimonial.createdAt).toLocaleDateString()}</span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 italic mb-4">
          "{testimonial.quote}"
        </p>
        
        {testimonial.company && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {testimonial.company}
            {testimonial.position && `, ${testimonial.position}`}
          </p>
        )}
        
        {showActions && (
          <motion.div 
            className="testimonial-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10 
            }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(testimonial._id);
              }}
              className="action-button edit-button"
              title="Edit Testimonial"
            >
              <FiEdit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`action-button delete-button ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isDeleting ? 'Deleting...' : 'Delete Testimonial'}
            >
              {isDeleting ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <FiTrash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const TestimonialSkeleton = () => (
  <div className="testimonial-card animate-pulse">
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

const EmptyState = ({ onAddNew }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <FiPlus className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No testimonials found</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first testimonial.</p>
    <button
      onClick={onAddNew}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <FiPlus className="-ml-1 mr-2 h-5 w-5" />
      Add Testimonial
    </button>
  </div>
);

const ManageTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      console.log('Fetching testimonials...');
      const response = await api.get('/testimonials/all');
      console.log('Testimonials response:', response.data);
      setTestimonials(response.data);
      setFilteredTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      toast.error('Failed to load testimonials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/testimonials/${id}`);
      
      // Update the testimonials list by filtering out the deleted testimonial
      const updatedTestimonials = testimonials.filter(t => t._id !== id);
      setTestimonials(updatedTestimonials);
      setFilteredTestimonials(updatedTestimonials);
      
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      
      let errorMessage = 'Failed to delete testimonial';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'You are not authorized to perform this action';
          navigate('/login', { state: { from: '/dashboard/testimonials' } });
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to delete testimonials';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle testimonial edit
  const handleEditTestimonial = (id) => {
    navigate(`/dashboard/testimonials/edit/${id}`);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredTestimonials(testimonials);
      return;
    }
    
    const filtered = testimonials.filter(
      testi => 
        testi.name.toLowerCase().includes(term) ||
        (testi.company && testi.company.toLowerCase().includes(term)) ||
        (testi.quote && testi.quote.toLowerCase().includes(term))
    );
    
    setFilteredTestimonials(filtered);
  };

  // Initial setup on component mount
  useEffect(() => {
    // Check if user is admin
    if (user && user.role) {
      setIsAdmin(user.role === 'admin');
    } else {
      // Fallback: Check localStorage or make an API call to verify admin status
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.role === 'admin') {
        setIsAdmin(true);
      }
    }
    
    // Fetch testimonials
    fetchTestimonials();
  }, [user]);

  // Loading state
  if (loading && testimonials.length === 0) {
    return (
      <div className="testimonial-list-container">
        <div className="testimonial-header">
          <div>
            <h1 className="testimonial-title">Testimonials</h1>
            <p className="testimonial-count">Loading testimonials...</p>
          </div>
        </div>
        <div className="testimonial-grid">
          {[1, 2, 3].map((i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && filteredTestimonials.length === 0) {
    return (
      <div className="testimonial-list-container">
        <EmptyState 
          onAddNew={() => navigate('/dashboard/testimonials/new')} 
        />
      </div>
    );
  }

  return (
    <div className="testimonial-list-container">
      <div className="testimonial-header">
        <div>
          <h1 className="testimonial-title">Testimonials</h1>
          <p className="testimonial-count">
            {filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'testimonial' : 'testimonials'} in total
          </p>
        </div>
        <div>
          <Link
            to="/dashboard/testimonials/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Testimonial
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search testimonials..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="testimonial-grid">
        {filteredTestimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial._id}
            testimonial={testimonial}
            onDelete={handleDeleteTestimonial}
            onEdit={handleEditTestimonial}
            showActions={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};

export default ManageTestimonialsPage;
