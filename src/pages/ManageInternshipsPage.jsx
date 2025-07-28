import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ManageInternshipsPage = () => {
    const [internships, setInternships] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        try {
            const response = await api.get('/internships');
            setInternships(response.data);
        } catch (error) {
            setMessage('Error fetching internships');
            console.error('Error fetching internships:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this internship?')) {
            try {
                const response = await api.delete(`/api/internships/${id}`);
                setMessage(response.data.msg);
                fetchInternships(); // Refresh the list
            } catch (error) {
                setMessage(error.response?.data?.msg || 'Error deleting internship');
                console.error('Error deleting internship:', error);
            }
        }
    };

    return (
        <div className="container py-5 mt-5">
            <h2 className="text-center text-white mb-4">Manage Internships</h2>
            {message && <p className="text-center text-info">{message}</p>}
            <div className="list-group">
                {internships.length > 0 ? (
                    internships.map(internship => (
                        <div key={internship._id} className="list-group-item list-group-item-action bg-dark text-white mb-2 border-secondary d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1 internship-title">{internship.title}</h5>
                                <p className={`mb-1 badge ${internship.isOpen ? 'bg-success' : 'bg-danger'}`}>
                                    {internship.isOpen ? 'Open' : 'Closed'}
                                </p>
                            </div>
                            <div>
                                <Link to={`/admin/edit-internship/${internship._id}`} className="btn btn-sm btn-outline-warning me-2">Edit</Link>
                                <button onClick={() => handleDelete(internship._id)} className="btn btn-sm btn-outline-danger">Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-white">No internships found. You can add one <Link to="/admin/add-internship">here</Link>.</p>
                )}
            </div>
        </div>
    );
};

export default ManageInternshipsPage;
