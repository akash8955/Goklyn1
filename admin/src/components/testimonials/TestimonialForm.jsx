import React, { useState, useEffect } from 'react';
import './TestimonialForm.css';

const TestimonialForm = ({ testimonial, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    feedback: '',
    rating: 3,
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        clientName: testimonial.clientName || '',
        company: testimonial.company || '',
        feedback: testimonial.feedback || '',
        rating: testimonial.rating || 3,
      });
    }
  }, [testimonial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="testimonial-form">
      <h2>{testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
      <div className="form-group">
        <label htmlFor="clientName">Client Name</label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="feedback">Feedback</label>
        <textarea
          id="feedback"
          name="feedback"
          value={formData.feedback}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="rating">Rating (1-5)</label>
        <input
          type="number"
          id="rating"
          name="rating"
          min="1"
          max="5"
          value={formData.rating}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">{testimonial ? 'Update' : 'Create'}</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default TestimonialForm;
