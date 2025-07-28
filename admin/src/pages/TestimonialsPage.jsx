import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiLoader } from 'react-icons/fi';
import testimonialService from '../services/testimonialService';
import Modal from '../components/shared/Modal';
import TestimonialForm from '../components/testimonials/TestimonialForm';
import '../styles/TestimonialsPage.css';

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

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonialToEdit, setTestimonialToEdit] = useState(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getTestimonials();
      const testimonialsData = Array.isArray(data) ? data : [];
      setTestimonials(testimonialsData);
      setFilteredTestimonials(testimonialsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch testimonials. Please try again later.');
      console.error('Fetch testimonials error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTestimonials(testimonials);
      setCurrentPage(1);
      return;
    }

    const filtered = testimonials.filter(testimonial => 
      testimonial.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  }, [searchTerm, testimonials]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort testimonials
  const sortedTestimonials = React.useMemo(() => {
    const sortableItems = [...filteredTestimonials];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle nested properties
        const aValue = sortConfig.key.split('.').reduce((o, i) => o && o[i], a);
        const bValue = sortConfig.key.split('.').reduce((o, i) => o && o[i], b);
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTestimonials, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedTestimonials.slice(startIndex, startIndex + itemsPerPage);

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

  const handleAddTestimonial = async (formData) => {
    try {
      setLoading(true);
      const response = await testimonialService.createTestimonial(formData);
      const newTestimonial = response.testimonial || response.data?.testimonial || response;
      setTestimonials(prev => [newTestimonial, ...prev]);
      setIsModalOpen(false);
      return true;
    } catch (err) {
      setError('Failed to add testimonial. Please try again.');
      console.error('Add testimonial error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestimonial = async (formData) => {
    try {
      setLoading(true);
      const response = await testimonialService.updateTestimonial(testimonialToEdit._id, formData);
      const updatedTestimonial = response.testimonial || response.data?.testimonial || response;
      setTestimonials(prev => 
        prev.map(t => (t._id === testimonialToEdit._id ? updatedTestimonial : t))
      );
      setTestimonialToEdit(null);
      return true;
    } catch (err) {
      setError(err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to update testimonial. Please try again.');
      console.error('Update testimonial error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await testimonialService.deleteTestimonial(id);
      setTestimonials(prev => prev.filter((t) => t._id !== id));
      setTestimonialToDelete(null);
    } catch (err) {
      setError('Failed to delete testimonial. Please try again.');
      console.error('Delete testimonial error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchTestimonials} className="retry-button">
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
      <div className="testimonials-page">
        <div className="testimonials-header">
          <h1>Testimonials Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="add-testimonial-btn" 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              {loading ? <FiLoader className="spinner" /> : 'Add New Testimonial'}
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="testimonials-table">
            <thead>
              <tr>
                <th 
                  onClick={() => requestSort('name')} 
                  className="sortable-header"
                >
                  Name {renderSortIcon('name')}
                </th>
                <th 
                  onClick={() => requestSort('company')} 
                  className="sortable-header"
                >
                  Company {renderSortIcon('company')}
                </th>
                <th 
                  onClick={() => requestSort('rating')} 
                  className="sortable-header"
                >
                  Rating {renderSortIcon('rating')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading-row">
                    <FiLoader className="spinner" /> Loading testimonials...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((testimonial) => (
                  <tr key={testimonial._id}>
                    <td>{testimonial.name || testimonial.clientName}</td>
                    <td>{testimonial.company || 'N/A'}</td>
                    <td>
                      <div className="rating-display">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`star ${star <= (testimonial.rating || 0) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-number">({testimonial.rating || 0}/5)</span>
                      </div>
                    </td>
                    <td className="actions-column">
                      <button 
                        className="icon-btn edit-btn" 
                        onClick={() => setTestimonialToEdit(testimonial)}
                        aria-label="Edit testimonial"
                        title="Edit testimonial"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        onClick={() => setTestimonialToDelete(testimonial)}
                        aria-label="Delete testimonial"
                        title="Delete testimonial"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    {searchTerm ? 'No testimonials match your search.' : 'No testimonials found.'}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedTestimonials.length)} of {sortedTestimonials.length} testimonials
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
          isOpen={isModalOpen || !!testimonialToEdit} 
          onClose={() => {
            if (!loading) {
              setIsModalOpen(false);
              setTestimonialToEdit(null);
            }
          }}
        >
          <TestimonialForm
            testimonial={testimonialToEdit}
            onSubmit={testimonialToEdit ? handleEditTestimonial : handleAddTestimonial}
            onCancel={() => {
              if (!loading) {
                setIsModalOpen(false);
                setTestimonialToEdit(null);
              }
            }}
            isLoading={loading}
          />
        </Modal>

        {testimonialToDelete && (
          <Modal 
            isOpen={!!testimonialToDelete} 
            onClose={() => !isDeleting && setTestimonialToDelete(null)}
          >
            <div className="delete-confirm-dialog">
              <div className="delete-confirm-content">
                <h3>Are you sure?</h3>
                <p>Do you really want to delete the testimonial from {testimonialToDelete.name}? This action cannot be undone.</p>
                <div className="delete-confirm-actions">
                  <button 
                    className="btn-danger" 
                    onClick={() => handleDelete(testimonialToDelete._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => !isDeleting && setTestimonialToDelete(null)}
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

export default TestimonialsPage;
