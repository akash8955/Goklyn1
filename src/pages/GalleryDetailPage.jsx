import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaStar, FaRegStar, FaShare, FaFacebook, FaTwitter, FaLink } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useGallery } from '../contexts/GalleryContext';
import { useAuth } from '../contexts/AuthContext';

const GalleryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { 
    currentItem: item, 
    loading, 
    error, 
    getItem, 
    removeItem, 
    toggleItemFeatured,
    clearCurrentItem,
    items: allItems
  } = useGallery();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  
  // Fetch the gallery item when the component mounts or ID changes
  useEffect(() => {
    if (id) {
      getItem(id);
    }
    
    // Clean up function to clear the current item when unmounting
    return () => {
      clearCurrentItem();
    };
  }, [id, getItem, clearCurrentItem]);
  
  // Get related items (same category, excluding current item)
  const relatedItems = allItems
    .filter(galleryItem => 
      galleryItem._id !== id && 
      galleryItem.category === item?.category
    )
    .slice(0, 4);
  
  // Handle delete confirmation
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await removeItem(id);
      setShowDeleteModal(false);
      navigate('/gallery');
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      setIsDeleting(false);
    }
  };
  
  // Toggle featured status
  const handleToggleFeatured = async () => {
    if (!id) return;
    
    try {
      await toggleItemFeatured(id);
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };
  
  // Share functionality
  const handleShare = (platform) => {
    if (!item) return;
    
    const url = window.location.href;
    const title = encodeURIComponent(item.title);
    const _text = encodeURIComponent(item.description || '');
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        // You might want to show a toast notification here
        break;
      default:
        break;
    }
    
    setShareMenuOpen(false);
  };
  
  if (loading && !item) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading gallery item...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Button as={Link} to="/gallery" variant="outline-primary" className="mt-3">
          <FaArrowLeft className="me-2" /> Back to Gallery
        </Button>
      </Container>
    );
  }
  
  if (!item) {
    return (
      <Container className="py-5 text-center">
        <h2>Gallery Item Not Found</h2>
        <p className="text-muted mb-4">The requested gallery item could not be found.</p>
        <Button as={Link} to="/gallery" variant="primary">
          <FaArrowLeft className="me-2" /> Back to Gallery
        </Button>
      </Container>
    );
  }
  
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Back Button */}
      <Container className="py-3">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Back
        </Button>
      </Container>
      
      {/* Main Content */}
      <Container className="py-4">
        <Row className="g-4">
          {/* Main Image Column */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <div className="position-relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="img-fluid w-100"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
                
                {/* Admin Controls */}
                {(isAdmin || currentUser?.uid === item.createdBy) && (
                  <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2">
                    <Button 
                      variant={item.isFeatured ? 'warning' : 'outline-warning'} 
                      size="sm" 
                      onClick={handleToggleFeatured}
                      title={item.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      className="rounded-circle p-2"
                    >
                      {item.isFeatured ? <FaStar /> : <FaRegStar />}
                    </Button>
                    
                    <Button 
                      variant="primary" 
                      size="sm" 
                      as={Link}
                      to={`/gallery/edit/${item._id}`}
                      title="Edit"
                      className="rounded-circle p-2"
                    >
                      <FaEdit />
                    </Button>
                    
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => setShowDeleteModal(true)}
                      title="Delete"
                      className="rounded-circle p-2"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
                
                {/* Category Badge */}
                {item.category && (
                  <Badge 
                    bg="primary" 
                    className="position-absolute bottom-0 start-0 m-3"
                  >
                    {item.category}
                  </Badge>
                )}
              </div>
              
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h1 className="h3 mb-1">{item.title}</h1>
                    <div className="text-muted small">
                      Added on {formattedDate}
                    </div>
                  </div>
                  
                  {/* Share Button */}
                  <div className="position-relative">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className="d-flex align-items-center"
                    >
                      <FaShare className="me-1" /> Share
                    </Button>
                    
                    {/* Share Dropdown */}
                    {shareMenuOpen && (
                      <div className="position-absolute end-0 mt-1 bg-white shadow rounded p-2" style={{ zIndex: 1000, width: '150px' }}>
                        <Button 
                          variant="link" 
                          className="text-dark d-flex align-items-center w-100 text-start p-2"
                          onClick={() => handleShare('facebook')}
                        >
                          <FaFacebook className="text-primary me-2" /> Facebook
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-dark d-flex align-items-center w-100 text-start p-2"
                          onClick={() => handleShare('twitter')}
                        >
                          <FaTwitter className="text-info me-2" /> Twitter
                        </Button>
                        <Button 
                          variant="link" 
                          className="text-dark d-flex align-items-center w-100 text-start p-2"
                          onClick={() => handleShare('copy')}
                        >
                          <FaLink className="text-secondary me-2" /> Copy Link
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-3">
                    {item.tags.map(tag => (
                      <Badge key={tag} bg="light" text="dark" className="me-2 mb-2">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                {item.description && (
                  <div className="mb-4">
                    <h4 className="h5 mb-3">Description</h4>
                    <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {item.description}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* Sidebar */}
          <Col lg={4}>
            {/* Related Items */}
            {relatedItems.length > 0 && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">More in {item.category}</h5>
                </Card.Header>
                <Card.Body>
                  <Row xs={2} md={2} lg={1} className="g-3">
                    {relatedItems.map(relatedItem => (
                      <Col key={relatedItem._id}>
                        <Card as={Link} to={`/gallery/${relatedItem._id}`} className="h-100 text-decoration-none text-dark">
                          <Card.Img 
                            variant="top" 
                            src={relatedItem.thumbnailUrl || relatedItem.imageUrl} 
                            alt={relatedItem.title}
                            style={{ height: '120px', objectFit: 'cover' }}
                          />
                          <Card.Body className="p-2">
                            <Card.Title className="small text-truncate mb-0">
                              {relatedItem.title}
                            </Card.Title>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}
            
            {/* Meta Information */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Details</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>Uploaded:</strong> {formattedDate}
                  </li>
                  <li className="mb-2">
                    <strong>Category:</strong> {item.category || 'Uncategorized'}
                  </li>
                  <li className="mb-2">
                    <strong>Status:</strong> {item.status === 'published' ? 'Published' : 'Draft'}
                  </li>
                  {item.isFeatured && (
                    <li className="mb-2">
                      <Badge bg="warning" text="dark">
                        <FaStar className="me-1" /> Featured
                      </Badge>
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this gallery item? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default GalleryDetailPage;
