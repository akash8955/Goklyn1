import React, { useState, useEffect } from 'react';
import api from '../../api';
import SimpleCarousel from './SimpleCarousel';
import './Testimonial.css';

const Testimonial = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await api.get('/testimonials');
                setTestimonials(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                setError('Failed to load testimonials. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Render star rating
    const renderRating = (rating) => {
        return (
            <div className="testimonial-rating mb-2">
                {[...Array(5)].map((_, i) => (
                    <span 
                        key={i} 
                        className={`star ${i < (rating || 5) ? 'text-warning' : 'text-muted'}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Render testimonial card
    const renderTestimonial = (testimonial) => (
        <div key={testimonial._id} className="testimonial-card">
            <div className="testimonial-content">
                {testimonial.rating && renderRating(testimonial.rating)}
                <p className="testimonial-text">"{testimonial.content || testimonial.feedback}"</p>
                <div className="testimonial-author">
                    <div className="author-avatar">
                        {testimonial.author?.charAt(0) || testimonial.clientName?.charAt(0) || 'U'}
                    </div>
                    <div className="author-info">
                        <h4 className="author-name">{testimonial.author || testimonial.clientName || 'Anonymous'}</h4>
                        {testimonial.role && <p className="author-role">{testimonial.role}</p>}
                        {testimonial.company && <p className="author-company">{testimonial.company}</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <section className="testimonial-section">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="testimonial-section">
                <div className="container">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return null; // Don't render anything if no testimonials
    }

    return (
        <section className="testimonial-section">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center mb-5">
                            <h2>What Our Clients Say</h2>
                            <p>Hear from people who have worked with us</p>
                        </div>
                    </div>
                </div>
                
                <div className="testimonial-wrapper">
                    <SimpleCarousel 
                        show={Math.min(2, testimonials.length)}
                        autoplay={true}
                        interval={5000}
                    >
                        {testimonials.map(renderTestimonial)}
                    </SimpleCarousel>
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
