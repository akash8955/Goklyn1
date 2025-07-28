import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditTestimonialPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        quote: '',
        company: '',
        rating: 5
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonial = async () => {
            try {
                const response = await api.get(`/testimonials/${id}`);
                const testimonial = response.data;
                setFormData({
                    name: testimonial.clientName || '',
                    quote: testimonial.feedback || '',
                    company: testimonial.company || '',
                    rating: testimonial.rating || 5
                });
                setMessage('');
            } catch (error) {
                console.error('Fetch error:', error);
                setMessage('Failed to load testimonial. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonial();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rating' ? parseInt(value, 10) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await api.put(`/testimonials/${id}`, {
                clientName: formData.name,
                feedback: formData.quote,
                company: formData.company,
                rating: formData.rating
            });
            
            setMessage('Testimonial updated successfully!');
            setTimeout(() => navigate('/admin/testimonials'), 1500);
        } catch (error) {
            console.error('Update error:', error);
            const errorMsg = error.response?.data?.msg || 'Failed to update testimonial';
            setMessage(`Error: ${errorMsg}`);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">Edit Testimonial</h2>
                            
                            {message && (
                                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="form-label fw-bold">Client Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg" 
                                        id="name" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="company" className="form-label fw-bold">Company / Position</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg" 
                                        id="company" 
                                        name="company"
                                        value={formData.company} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="rating" className="form-label fw-bold">Rating</label>
                                    <select 
                                        className="form-select form-select-lg" 
                                        id="rating" 
                                        name="rating"
                                        value={formData.rating} 
                                        onChange={handleChange}
                                    >
                                        {[5, 4, 3, 2, 1].map(num => (
                                            <option key={num} value={num}>
                                                {num} Star{num !== 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="quote" className="form-label fw-bold">Testimonial</label>
                                    <textarea 
                                        className="form-control form-control-lg" 
                                        id="quote" 
                                        name="quote"
                                        rows="5" 
                                        value={formData.quote} 
                                        onChange={handleChange} 
                                        required
                                        style={{ minHeight: '150px' }}
                                    ></textarea>
                                </div>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary me-md-2"
                                        onClick={() => navigate('/admin/testimonials')}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                    >
                                        Update Testimonial
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTestimonialPage;
