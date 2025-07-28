import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditInternshipPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eligibility, setEligibility] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const response = await api.get(`/api/internships/${id}`);
                const internship = response.data;
                console.log('Fetched internship:', internship);
                setTitle(internship.title || '');
                setDescription(internship.description || '');
                setEligibility(internship.eligibility || '');
                setIsOpen(typeof internship.isOpen === 'boolean' ? internship.isOpen : true);
                setCurrentPhoto(internship.photo || '');
            } catch (error) {
                setTitle('');
                setDescription('');
                setEligibility('');
                setIsOpen(true);
                setCurrentPhoto('');
                setMessage('Error fetching internship data. A route to get a single internship might be needed.');
                console.error('Fetch error:', error);
            }
        };
        fetchInternship();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('eligibility', eligibility);
        formData.append('isOpen', isOpen);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            await api.post(`/api/internships/update-with-photo/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Internship updated successfully!');
            setTimeout(() => navigate('/admin/manage-internships'), 1500);
        } catch (error) {
            if (error.response) {
                console.error('Update error response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers,
                    data: error.response.data
                });
                const backendMsg = error.response.data?.msg || error.response.data?.error || error.response.statusText;
                setMessage(`Error: ${error.response.status} - ${backendMsg}`);
            } else if (error.request) {
                setMessage('No response from server. Please check your connection or backend server.');
                console.error('Update error request:', error.request);
            } else {
                setMessage('An unexpected error occurred during update.');
                console.error('Update error:', error.message);
            }
        }
    };

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Edit Internship</h2>
                            <form onSubmit={handleSubmit}>
                                {currentPhoto && <img src={`http://localhost:5000${currentPhoto}`} alt="Current internship" className="img-fluid rounded mb-3"/>}
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
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="isOpen" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="isOpen">Position is Open</label>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="photo" className="form-label">Replace Photo (optional)</label>
                                    <input type="file" className="form-control" id="photo" onChange={(e) => setPhoto(e.target.files[0])} />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">Update Internship</button>
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

export default EditInternshipPage;
