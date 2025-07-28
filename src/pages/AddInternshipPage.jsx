import React, { useState } from 'react';
import api from '../api';

const AddInternshipPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eligibility, setEligibility] = useState('');
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting...');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('eligibility', eligibility);
        if (photo) {
            formData.append('photo', photo);
            console.log('Photo attached:', photo.name, 'Size:', photo.size, 'bytes');
        }

        console.log('Form data prepared:', {
            title,
            description,
            eligibility,
            hasPhoto: !!photo
        });

        try {
            console.log('Sending request to /api/internships/add');
            const response = await api.post('/internships/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000 // 30 seconds timeout
            });
            
            console.log('Response received:', response.data);
            setMessage('Internship added successfully!');
            
            // Clear form
            setTitle('');
            setDescription('');
            setEligibility('');
            setPhoto(null);
            e.target.reset();
            
        } catch (error) {
            console.error('Error adding internship:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data ? 'Form data sent' : 'No data sent'
                }
            });
            
            const errorMessage = error.response?.data?.msg || 
                               error.response?.data?.message || 
                               error.message || 
                               'Failed to add internship. Please try again.';
            
            setMessage(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Add New Internship</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Internship Title</label>
                                    <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="eligibility" className="form-label">Eligibility</label>
                                    <textarea className="form-control" id="eligibility" rows="3" value={eligibility} onChange={(e) => setEligibility(e.target.value)} required></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="photo" className="form-label">Featured Photo</label>
                                    <input type="file" className="form-control" id="photo" onChange={(e) => setPhoto(e.target.files[0])} />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">Add Internship</button>
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

export default AddInternshipPage;
