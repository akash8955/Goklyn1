import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useGallery } from '../contexts/GalleryContext';
import { FaSearch, FaStar, FaRegStar, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GalleryPage = () => {
  const { 
    items, 
    loading, 
    error, 
    filters, 
    setFilters, 
    pagination = { totalPages: 0 },
    categories = [],
    toggleItemFeatured
  } = useGallery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prevFilters => ({ 
        ...prevFilters, 
        search: searchTerm, 
        page: 1 
      }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({ 
      ...filters, 
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page when filters change
    });
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };
  
  // Toggle featured status
  const handleToggleFeatured = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItemFeatured?.(itemId);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      featured: false,
      search: '',
      page: 1,
      limit: 12,
    });
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-center mb-4">Our Gallery</h1>
        <p className="text-center text-muted mb-5">
          Explore our collection of beautiful moments and creative works
        </p>
        
        {/* Search and Filter Bar */}
        <div className="mb-4">
          <Row className="g-3">
            <Col md={8} lg={9}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  variant={showFilters ? 'primary' : 'outline-secondary'} 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-2" />
                  {showFilters ? 'Hide Filters' : 'Filters'}
                </Button>
              </InputGroup>
            </Col>
            <Col md={4} lg={3} className="d-flex justify-content-end">
              <Button as={Link} to="/gallery/upload" variant="primary">
                Add New Image
              </Button>
            </Col>
          </Row>
          
          {/* Filters Panel */}
          {showFilters && (
            <motion.div 
              className="bg-light p-4 mt-3 rounded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Filters</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-decoration-none"
                >
                  Clear All
                </Button>
              </div>
              <Row>
                <Col md={6} lg={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select 
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Items per page</Form.Label>
                    <Form.Select 
                      name="limit"
                      value={filters.limit}
                      onChange={handleFilterChange}
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={48}>48 per page</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} lg={3} className="mb-3 d-flex align-items-end">
                  <Form.Check 
                    type="checkbox"
                    id="featured-filter"
                    label="Featured only"
                    name="featured"
                    checked={filters.featured}
                    onChange={handleFilterChange}
                  />
                </Col>
              </Row>
            </motion.div>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (!items || items.length === 0) && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading gallery items...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Gallery Grid */}
        {!loading && (!items || items.length === 0) ? (
          <div className="text-center py-5">
            <h4>No gallery items found</h4>
            <p className="text-muted">Try adjusting your search or filters</p>
            <Button variant="outline-primary" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {items.map((item) => (
                <Col key={item._id}>
                  <Card 
                    as={Link}
                    to={`/gallery/${item._id}`}
                    className="h-100 text-decoration-none text-dark"
                    style={{ transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={item.thumbnailUrl || item.imageUrl} 
                        alt={item.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Button 
                        variant={item.isFeatured ? 'warning' : 'outline-warning'} 
                        size="sm" 
                        className="position-absolute top-0 end-0 m-2 p-1"
                        onClick={(e) => handleToggleFeatured(e, item._id)}
                        title={item.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {item.isFeatured ? <FaStar /> : <FaRegStar />}
                      </Button>
                      {item.category && (
                        <span className="badge bg-primary position-absolute bottom-0 end-0 m-2">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <Card.Body>
                      <Card.Title className="h6 mb-1">{item.title}</Card.Title>
                      {item.description && (
                        <Card.Text className="small text-muted text-truncate">
                          {item.description}
                        </Card.Text>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Gallery pagination">
                  <ul className="pagination">
                    <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (filters.page <= 3) {
                        pageNum = i + 1;
                      } else if (filters.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = filters.page - 2 + i;
                      }
                      
                      return (
                        <li key={pageNum} className={`page-item ${filters.page === pageNum ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${filters.page === pagination.totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>
    </Container>
  );
};

export default GalleryPage;
