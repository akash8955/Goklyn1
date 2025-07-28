import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiLoader } from 'react-icons/fi';
import internshipService from '../services/internshipService';
import Modal from '../components/shared/Modal';
import InternshipForm from '../components/internships/InternshipForm';
import '../styles/InternshipsPage.css';

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

const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internshipToEdit, setInternshipToEdit] = useState(null);
  const [internshipToDelete, setInternshipToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      const data = await internshipService.getInternships();
      const internshipsData = Array.isArray(data) ? data : [];
      setInternships(internshipsData);
      setFilteredInternships(internshipsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch internships. Please try again later.');
      console.error('Fetch internships error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInternships(internships);
      setCurrentPage(1);
      return;
    }

    const filtered = internships.filter(internship => 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (internship.description && internship.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredInternships(filtered);
    setCurrentPage(1);
  }, [searchTerm, internships]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort internships
  const sortedInternships = React.useMemo(() => {
    const sortableItems = [...filteredInternships];
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
  }, [filteredInternships, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedInternships.slice(startIndex, startIndex + itemsPerPage);

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

  const handleAddInternship = async (formData) => {
    try {
      setLoading(true);
      const response = await internshipService.createInternship(formData);
      const newInternship = response.internship || response.data?.internship || response;
      setInternships(prev => [newInternship, ...prev]);
      setIsModalOpen(false);
      return true;
    } catch (err) {
      setError('Failed to add internship. Please try again.');
      console.error('Add internship error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditInternship = async (formData) => {
    try {
      setLoading(true);
      const response = await internshipService.updateInternship(internshipToEdit._id, formData);
      const updatedInternship = response.internship || response.data?.internship || response;
      setInternships(prev => 
        prev.map(i => (i._id === internshipToEdit._id ? updatedInternship : i))
      );
      setInternshipToEdit(null);
      return true;
    } catch (err) {
      setError('Failed to update internship. Please try again.');
      console.error('Update internship error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await internshipService.deleteInternship(id);
      setInternships(prev => prev.filter((i) => i._id !== id));
      setInternshipToDelete(null);
    } catch (err) {
      setError(err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to delete internship. Please try again.');
      console.error('Delete internship error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchInternships} className="retry-button">
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
      <div className="internships-page">
        <div className="internships-header">
          <h1>Internship Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="add-internship-btn" 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              {loading ? <FiLoader className="spinner" /> : 'Add New Internship'}
            </button>
          </div>
        </div>

      <div className="table-container">
        <table className="internships-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th onClick={() => requestSort('title')} className="sortable-header">
                Title {renderSortIcon('title')}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-row">
                  <FiLoader className="spinner" /> Loading internships...
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((internship) => (
              <tr key={internship._id}>
                <td>
                  <img src={internship.photo} alt={internship.title} className="internship-photo" />
                </td>
                <td>{internship.title}</td>
                <td>
                  <span className={`status-badge ${internship.isOpen ? 'status-open' : 'status-closed'}`}>
                    {internship.isOpen ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td className="actions-column">
                  <button 
                    className="icon-btn edit-btn" 
                    onClick={() => setInternshipToEdit(internship)}
                    aria-label="Edit internship"
                    title="Edit internship"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => setInternshipToDelete(internship)}
                    aria-label="Delete internship"
                    title="Delete internship"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  {searchTerm ? 'No internships match your search.' : 'No internships found.'}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedInternships.length)} of {sortedInternships.length} internships
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
        isOpen={isModalOpen || !!internshipToEdit} 
        onClose={() => {
          if (!loading) {
            setIsModalOpen(false);
            setInternshipToEdit(null);
          }
        }}
      >
        <InternshipForm
          internship={internshipToEdit}
          onSubmit={internshipToEdit ? handleEditInternship : handleAddInternship}
          onCancel={() => {
            if (!loading) {
              setIsModalOpen(false);
              setInternshipToEdit(null);
            }
          }}
          isLoading={loading}
        />
      </Modal>

      {internshipToDelete && (
        <Modal 
          isOpen={!!internshipToDelete} 
          onClose={() => !isDeleting && setInternshipToDelete(null)}
        >
          <div className="delete-confirm-dialog">
            <div className="delete-confirm-content">
              <h3>Are you sure?</h3>
              <p>Do you really want to delete the internship "{internshipToDelete.title}"? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button 
                  className="btn-danger" 
                  onClick={() => handleDelete(internshipToDelete._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => !isDeleting && setInternshipToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default InternshipsPage;
