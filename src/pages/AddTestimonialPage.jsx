import React, { useState } from 'react';
import api from '../api';

const AddTestimonialPage = () => {
    const [clientName, setClientName] = useState('');
    const [company, setCompany] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const formData = {
            clientName,
            company,
            feedback,
            rating: Number(rating),
            approved: true
        };

        try {
            const response = await api.post('/testimonials/add', formData);
            setMessage(response.data.msg);
            // Clear form
            setClientName('');
            setCompany('');
            setFeedback('');
            setRating(5);
            e.target.reset();
        } catch (error) {
            setMessage(error.response?.data?.msg || 'An error occurred');
        }
    };

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Add New Testimonial</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="clientName" className="form-label">Client Name</label>
                                    <input type="text" className="form-control" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="company" className="form-label">Company</label>
                                    <input type="text" className="form-control" id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="feedback" className="form-label">Feedback</label>
                                    <textarea className="form-control" id="feedback" rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} required></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="rating" className="form-label">Rating (1-5)</label>
                                    <input type="number" className="form-control" id="rating" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} required />
                                </div>

                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">Add Testimonial</button>
                                </div>
                            </form>
                            {message && <p className="mt-3 text-center text-info">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTestimonialPage;
