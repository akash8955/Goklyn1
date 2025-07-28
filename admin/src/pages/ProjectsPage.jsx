import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlusCircle, FiGithub, FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiLoader } from 'react-icons/fi';
import projectService from '../services/projectService';
import Modal from '../components/shared/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import '../styles/ProjectsPage.css';

// Number of items per page
const ITEMS_PER_PAGE = 10;

// Available page sizes
const PAGE_SIZES = [5, 10, 20, 50];

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Something went wrong</h3>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      const projectsData = Array.isArray(data) ? data : [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects. Please try again later.');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      setCurrentPage(1);
      return;
    }

    const filtered = projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchTerm, projects]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort projects
  const sortedProjects = React.useMemo(() => {
    const sortableItems = [...filteredProjects];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProjects, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedProjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleAddProject = async (formData) => {
    try {
      setLoading(true);
      console.log('Handling project submission with form data');
      
      // Log form data for debugging
      const formDataObj = {};
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }
      console.log('Form data to be sent:', formDataObj);
      
      const response = await projectService.createProject(formData);
      console.log('Project creation response:', response);
      
      // Handle different response formats
      const newProject = response.data?.data || response.data || response;
      
      if (!newProject) {
        throw new Error('Invalid response format from server');
      }
      
      setProjects(prev => [newProject, ...prev]);
      setIsModalOpen(false);
      setError(null);
      return true;
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to add project. Please try again.';
      setError(errorMessage);
      console.error('Add project error:', {
        message: errorMessage,
        error: err,
        response: err.response?.data
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (formData) => {
    try {
      setLoading(true);
      const response = await projectService.updateProject(projectToEdit._id, formData);
      const updatedProject = response.project || response.data?.project || response;
      setProjects(prev => 
        prev.map(p => (p._id === projectToEdit._id ? updatedProject : p))
      );
      setProjectToEdit(null);
      return true;
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Update project error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const response = await projectService.deleteProject(id);
      console.log('Delete response:', response);
      
      if (response && response.msg) {
        // Success case
        setProjects(prev => prev.filter((p) => p._id !== id));
        setProjectToDelete(null);
      } else {
        // Handle unexpected response format
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Delete project error:', err);
      // Show error message to user
      setError(err?.response?.data?.msg || 
              err?.response?.data?.message || 
              err?.message || 
              'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchProjects} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // Render sort indicator
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <div className="projects-page">
        <div className="projects-header">
          <h1>Project Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="add-project-btn" 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              {loading ? <FiLoader className="spinner" /> : 'Add New Project'}
            </button>
          </div>
        </div>

      <div className="table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th onClick={() => requestSort('title')} className="sortable-header">
                Title {renderSortIcon('title')}
              </th>
              <th>GitHub</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-row">
                  <FiLoader className="spinner" /> Loading projects...
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((project) => (
              <tr key={project._id}>
                <td>
                  <img src={project.photo} alt={project.title} className="project-photo" />
                </td>
                <td>{project.title}</td>
                <td>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="github-link">
                      <FiGithub size={24} />
                    </a>
                  )}
                </td>
                <td className="actions-column">
                  <button 
                    className="icon-btn edit-btn" 
                    onClick={() => setProjectToEdit(project)}
                    aria-label="Edit project"
                    title="Edit project"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => setProjectToDelete(project)}
                    aria-label="Delete project"
                    title="Delete project"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  {searchTerm ? 'No projects match your search.' : 'No projects found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedProjects.length)} of {sortedProjects.length} projects
          </div>
          
          <div className="pagination-controls">
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="page-size-selector"
              disabled={loading}
            >
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>
                  Show {size} per page
                </option>
              ))}
            </select>
            
            <button 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1 || loading}
              className="pagination-button"
              aria-label="First page"
            >
              <FiChevronsLeft />
            </button>
            
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="pagination-button"
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="pagination-button"
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
            
            <button 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="pagination-button"
              aria-label="Last page"
            >
              <FiChevronsRight />
            </button>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen || !!projectToEdit} 
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
            setProjectToEdit(null);
          }
        }}
      >
        <ProjectForm
          project={projectToEdit}
          onSubmit={projectToEdit ? handleEditProject : handleAddProject}
          onCancel={() => {
            if (!loading) {
              setIsModalOpen(false);
              setProjectToEdit(null);
            }
          }}
          isLoading={loading}
        />
      </Modal>

      {projectToDelete && (
        <Modal 
          isOpen={!!projectToDelete} 
          onClose={() => !isDeleting && setProjectToDelete(null)}
        >
          <div className="confirmation-dialog">
            <h2>Are you sure?</h2>
            <p>Do you really want to delete the project "{projectToDelete.title}"? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button 
                className="btn-danger" 
                onClick={() => handleDelete(projectToDelete._id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => !isDeleting && setProjectToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default ProjectsPage;
