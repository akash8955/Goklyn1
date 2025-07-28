import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiExternalLink, 
  FiGithub,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiTag,
  FiCalendar,
  FiCode,
  FiGlobe,
  FiGitBranch,
  FiInbox
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import projectService from '../services/projectService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ManageProjectsPage.css';

const ProjectCard = ({ project, onDelete, onEdit, showActions = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(project._id);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(true);
      try {
        await onDelete(project._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div 
      className="project-card group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="project-card-content">
        <div className="project-card-header">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <div className="project-icon">
                <FiCode />
              </div>
              <div className="project-details">
                <h3 className="project-name">
                  {project.title}
                </h3>
                
                <p className="project-description">
                  {project.description}
                </p>
                
                <div className="tech-tags">
                  {project.technologies?.slice(0, 3).map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="more-tags">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="project-meta">
            <span className="project-date">
              {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
            </span>
            
            <motion.div 
              className="action-buttons"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: (isHovered && showActions) ? 1 : 0, x: (isHovered && showActions) ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              {showActions && onEdit && (
                <button
                  onClick={handleEdit}
                  className="action-button"
                  title="Edit Project"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              )}
              
              {showActions && onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`action-button action-button-delete ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isDeleting ? 'Deleting...' : 'Delete Project'}
                >
                  {isDeleting ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <FiTrash2 className="h-4 w-4" />
                  )}
                </button>
              )}
              {project.projectUrl && (
                <a 
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button action-button-external"
                  title="View Live"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button action-button-github"
                  title="View on GitHub"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiGithub className="h-4 w-4" />
                </a>
              )}
            </motion.div>
            
            <FiChevronRight className="chevron-icon" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
      <div className="flex space-x-2 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16 px-4">
    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="project-header">
      <div>
        <h1 className="project-title">Projects</h1>
        <p className="project-count">
          0 projects in total
        </p>
      </div>
      <div>
        <Link
          to="/dashboard/projects/new"
          className="empty-state-button"
        >
          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
          New Project
        </Link>
      </div>
    </div>
  </div>
);

const ManageProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  
  // Function to fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects...');
      const data = await projectService.getProjects({ sort: '-createdAt' });
      console.log('Raw API response data:', data);
      
      if (!data) {
        console.warn('No data returned from API');
        toast.warning('No data received from server');
        setProjects([]);
        return [];
      }
      
      // Ensure data is an array
      const projectsData = Array.isArray(data) ? data : [];
      console.log(`Processing ${projectsData.length} projects`);
      
      if (projectsData.length === 0) {
        console.log('No projects found in the database');
        toast.info('No projects found. Add your first project!');
      } else {
        console.log(`Successfully fetched ${projectsData.length} projects`);
      }
      
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Error in fetchProjects:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Failed to load projects';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Please log in to view projects';
          navigate('/login', { state: { from: '/manage-projects' } });
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view projects';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
      setProjects([]);
      setFilteredProjects([]);
      return [];
    } finally {
      setLoading(false);
    }
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
    
    // Fetch projects
    fetchProjects();
  }, [user]);

  // Filter projects based on search term and status
  useEffect(() => {
    if (!loading) {
      console.log('Filtering projects...', { searchTerm, statusFilter, projectsCount: projects.length });
      
      const filtered = projects.filter(project => {
        try {
          if (!project) return false;
          
          const matchesSearch = !searchTerm || 
            (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (project.technologies && Array.isArray(project.technologies) && 
             project.technologies.some(tech => 
               tech && tech.toLowerCase().includes(searchTerm.toLowerCase())
             )
            );
          
          const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
          
          return matchesSearch && matchesStatus;
        } catch (error) {
          console.error('Error filtering project:', project, error);
          return false;
        }
      });
      
      console.log(`Filtered to ${filtered.length} projects`);
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm, statusFilter, loading]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Get the project being deleted for better error messages
      const projectToDelete = projects.find(p => p._id === projectId);
      const projectName = projectToDelete?.title || 'this project';
      
      try {
        await projectService.deleteProject(projectId);
        
        // Update the projects list by filtering out the deleted project
        const updatedProjects = projects.filter(project => project._id !== projectId);
        setProjects(updatedProjects);
        
        // Update filtered projects as well
        const updatedFiltered = filteredProjects.filter(project => project._id !== projectId);
        setFilteredProjects(updatedFiltered);
        
        toast.success(`Successfully deleted "${projectName}"`);
        
      } catch (error) {
        console.error('Error in delete operation:', {
          error,
          projectId,
          projectName,
          timestamp: new Date().toISOString()
        });
        
        // Handle specific error cases with user-friendly messages
        let errorMessage = 'Failed to delete project';
        
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'You do not have permission to delete this project';
          } else if (error.response.status === 404) {
            errorMessage = 'Project not found or already deleted';
            // Refresh the project list if the project wasn't found
            fetchProjects();
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          navigate('/login', { 
            state: { 
              from: window.location.pathname,
              message: 'Your session has expired. Please log in again.'
            } 
          });
        }
      }
      
    } catch (unexpectedError) {
      console.error('Unexpected error in handleDeleteProject:', unexpectedError);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (projectId) => {
    try {
      // First verify the project exists and user has permission
      const project = await projectService.getProjectById(projectId);
      if (project) {
        navigate(`/edit-project/${projectId}`);
      } else {
        toast.error('Project not found or you do not have permission to edit it');
        // Refresh the projects list
        fetchProjects();
      }
    } catch (err) {
      console.error('Error fetching project for editing:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 'Failed to load project for editing';
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/manage-projects' } });
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="project-list-container">
        <div className="project-header">
          <div>
            <h1 className="project-title">Projects</h1>
            <p className="project-count">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} in total
            </p>
          </div>
          <div>
            <Link
              to="/dashboard/projects/new"
              className="empty-state-button"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-container">
          <div className="search-container">
            <div className="search-icon">
              <FiSearch />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects by name or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="projects-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <FiInbox className="empty-state-icon" />
              <h3 className="empty-state-title">
                {projects.length === 0 
                  ? 'No projects found' 
                  : 'No matching projects'}
              </h3>
              <p className="empty-state-description">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter to find what you\'re looking for.'
                  : projects.length === 0
                    ? 'Get started by creating a new project.'
                    : 'No projects match the current filters.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
              {projects.length === 0 && (
                <Link
                  to="/dashboard/projects/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Project
                </Link>
              )}
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                // Only pass onDelete if user is admin
                const cardProps = {
                  key: project._id,
                  project,
                  onEdit: handleEditProject,
                  showActions: isAdmin
                };
                
                if (isAdmin) {
                  cardProps.onDelete = handleDeleteProject;
                }
                
                return <ProjectCard {...cardProps} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProjectsPage;
