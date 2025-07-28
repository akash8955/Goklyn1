import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Spinner, 
  Modal,
  Alert, 
  Image,
  ProgressBar
} from 'react-bootstrap';
import { FaArrowLeft, FaTrash, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useGallery } from '../contexts/GalleryContext';
import { useAuth } from '../contexts/AuthContext';

const GalleryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser: _currentUser } = useAuth();
  const { 
    currentItem, 
    loading: _loading, 
    error, 
    getItem, 
    addItem, 
    updateItem,
    clearCurrentItem,
    clearError
  } = useGallery();
  
  const isEditMode = !!id;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    status: 'draft',
    isFeatured: false
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Available categories (could be fetched from an API)
  const categories = [
    'nature',
    'architecture',
    'people',
    'events',
    'other'
  ];
  
  // Load gallery item data in edit mode
  useEffect(() => {
    if (isEditMode) {
      getItem(id);
    }
    
    return () => {
      clearCurrentItem();
      clearError();
    };
  }, [id, isEditMode, getItem, clearCurrentItem, clearError]);
  
  // Set form data when currentItem changes (edit mode)
  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData({
        title: currentItem.title || '',
        description: currentItem.description || '',
        category: currentItem.category || '',
        tags: currentItem.tags ? currentItem.tags.join(', ') : '',
        status: currentItem.status || 'draft',
        isFeatured: currentItem.isFeatured || false
      });
      
      if (currentItem.imageUrl) {
        setImagePreview(currentItem.imageUrl);
      }
    }
  }, [currentItem, isEditMode]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for the field being edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Clear any previous image errors
      if (validationErrors.image) {
        setValidationErrors(prev => ({
          ...prev,
          image: null
        }));
      }
    }
  };
  
  // Remove selected image
  const _handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    
    // In edit mode, keep the original image if it exists
    if (isEditMode && currentItem?.imageUrl) {
      setImagePreview(currentItem.imageUrl);
    } else {
      // In create mode or if no original image, clear the file input
      document.getElementById('image-upload').value = '';
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    // Only require image in create mode or if no image exists in edit mode
    if ((!isEditMode || !currentItem?.imageUrl) && !imageFile) {
      errors.image = 'Please select an image';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      // Prepare gallery data
      const galleryData = {
        ...formData,
        // Convert comma-separated tags to array and trim whitespace
        tags: formData.tags 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : []
      };
      
      // In edit mode, update the existing item
      if (isEditMode) {
        await updateItem(
          id, 
          galleryData, 
          imageFile === 'remove' ? null : imageFile,
          (progress) => setUploadProgress(progress)
        );
      } else {
        // Create new gallery item
        await addItem(galleryData, imageFile, (progress) => setUploadProgress(progress));
      }
      
      // Redirect to gallery page on success
      navigate('/gallery');
    } catch (error) {
      console.error('Error saving gallery item:', error);
      setValidationErrors({
        ...validationErrors,
        submit: error.response?.data?.message || 'Failed to save gallery item. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (isEditMode) {
      // In edit mode, set imageFile to 'remove' to indicate we want to remove the existing image
      setImageFile('remove');
      setImagePreview('');
    } else {
      // In create mode, just clear the selected file
      setImageFile(null);
      setImagePreview('');
      document.getElementById('image-upload').value = '';
    }
    setShowDeleteConfirm(false);
  };

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            {isEditMode ? 'Edit Gallery Item' : 'Add New Gallery Item'}
          </h1>
          <Button 
            as={Link} 
            to={isEditMode ? `/gallery/${id}` : '/gallery'} 
            variant="outline-secondary"
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" />
            {isEditMode ? 'Cancel' : 'Back to Gallery'}
          </Button>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {validationErrors.submit && (
          <Alert variant="danger" className="mb-4">
            {validationErrors.submit}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* Left Column - Image Upload */}
            <Col lg={5} xl={4}>
              <Card className="h-100">
                <Card.Header>
                  <Card.Title className="mb-0">Image</Card.Title>
                </Card.Header>
                <Card.Body className="text-center">
                  {imagePreview ? (
                    <div className="position-relative">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fluid 
                        className="rounded mb-3"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="position-absolute top-0 end-0 m-2"
                        onClick={handleDeleteClick}
                        title="Remove image"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded p-5 text-center bg-light">
                      <FaImage size={48} className="text-muted mb-3" />
                      <p className="text-muted">No image selected</p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <Form.Group controlId="image-upload" className="mb-3">
                      <Form.Label className="btn btn-primary">
                        Choose Image
                        <Form.Control
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handleImageChange}
                        />
                      </Form.Label>
                      <Form.Text className="d-block text-muted">
                        JPG, PNG, WebP, or GIF (Max 5MB)
                      </Form.Text>
                      {validationErrors.image && (
                        <Form.Text className="text-danger d-block">
                          {validationErrors.image}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Uploading...</small>
                        <small>{Math.round(uploadProgress)}%</small>
                      </div>
                      <ProgressBar 
                        now={uploadProgress} 
                        label={`${Math.round(uploadProgress)}%`} 
                        animated 
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Right Column - Form Fields */}
            <Col lg={7} xl={8}>
              <Card className="h-100">
                <Card.Header>
                  <Card.Title className="mb-0">
                    {isEditMode ? 'Edit Details' : 'Item Details'}
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3" controlId="title">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a title for this item"
                      isInvalid={!!validationErrors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.title}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add a description (optional)"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.category}
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="status">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3" controlId="tags">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Comma-separated tags (e.g., nature, landscape, summer)"
                    />
                    <Form.Text className="text-muted">
                      Separate tags with commas
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="isFeatured">
                    <Form.Check
                      type="checkbox"
                      name="isFeatured"
                      label="Feature this item"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Featured items will be highlighted on the gallery page
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
                
                <Card.Footer className="bg-transparent border-top-0">
                  <div className="d-flex justify-content-between">
                    <div>
                      {isEditMode && (
                        <Button 
                          variant="outline-danger" 
                          type="button"
                          onClick={handleDeleteClick}
                          disabled={isSubmitting}
                        >
                          <FaTrash className="me-2" />
                          Delete Item
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        className="me-2"
                        as={Link}
                        to={isEditMode ? `/gallery/${id}` : '/gallery'}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            {isEditMode ? 'Updating...' : 'Uploading...'}
                          </>
                        ) : isEditMode ? (
                          'Update Item'
                        ) : (
                          'Upload to Gallery'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Form>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm {isEditMode ? 'Delete' : 'Remove'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isEditMode ? (
            <p>Are you sure you want to delete this gallery item? This action cannot be undone.</p>
          ) : (
            <p>Are you sure you want to remove the selected image? This cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            {isEditMode ? 'Delete Permanently' : 'Remove Image'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GalleryFormPage;
