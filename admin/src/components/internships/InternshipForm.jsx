import React, { useState, useEffect } from 'react';
import './InternshipForm.css';

const InternshipForm = ({ internship, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibility: '',
    isOpen: true,
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title || '',
        description: internship.description || '',
        eligibility: internship.eligibility || '',
        isOpen: internship.isOpen !== undefined ? internship.isOpen : true,
      });
    }
  }, [internship]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (photo) {
      data.append('photo', photo);
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="internship-form">
      <h2>{internship ? 'Edit Internship' : 'Add New Internship'}</h2>
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
        <label htmlFor="eligibility">Eligibility</label>
        <input
          type="text"
          id="eligibility"
          name="eligibility"
          value={formData.eligibility}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="photo">Photo</label>
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </div>
      <div className="form-group form-group-checkbox">
        <label htmlFor="isOpen">Open for Applications</label>
        <input
          type="checkbox"
          id="isOpen"
          name="isOpen"
          checked={formData.isOpen}
          onChange={handleChange}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-submit">{internship ? 'Update' : 'Create'}</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default InternshipForm;
