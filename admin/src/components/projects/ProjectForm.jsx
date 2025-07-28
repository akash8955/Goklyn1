import React, { useState, useEffect } from 'react';
import './ProjectForm.css';

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
    tags: '',
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        projectUrl: project.projectUrl || '',
        githubUrl: project.githubUrl || '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      setPhoto(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData object
    const formDataToSend = new FormData();
    
    // Append all form fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });
    
    // Append the photo file if it exists
    if (photo) {
      formDataToSend.append('photo', photo);
    }
    
    console.log('Submitting form data:', {
      ...formData,
      photo: photo ? photo.name : 'No photo'
    });
    
    // Call the onSubmit handler with the FormData object
    onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="projectUrl">Project URL</label>
        <input
          type="url"
          id="projectUrl"
          name="projectUrl"
          value={formData.projectUrl}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="githubUrl">GitHub URL</label>
        <input
          type="url"
          id="githubUrl"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="photo">Project Image</label>
        <div className="file-upload-wrapper">
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="file-input"
          />
          <label htmlFor="photo" className="file-upload-label">
            {photo ? photo.name : 'Choose an image...'}
          </label>
          {photo && (
            <div className="file-preview">
              <span>{photo.name}</span>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setPhoto(null);
                  document.getElementById('photo').value = '';
                }}
                className="remove-file"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <small className="file-hint">
          Supported formats: JPG, PNG, GIF (Max size: 5MB)
        </small>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-submit">{project ? 'Update' : 'Create'}</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProjectForm;
