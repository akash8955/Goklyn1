import React, { useState } from 'react';
import api from '../api';

const AddProjectPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [tags, setTags] = useState('');
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('projectUrl', projectUrl);
        formData.append('tags', tags);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await api.post('/projects', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.msg);
            // Clear form
            setTitle('');
            setDescription('');
            setProjectUrl('');
            setTags('');
            setPhoto(null);
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
                            <h2 className="card-title text-center mb-4">Add New Project</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Project Title</label>
                                    <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="projectUrl" className="form-label">Project URL</label>
                                    <input type="text" className="form-control" id="projectUrl" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                                    <input type="text" className="form-control" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="photo" className="form-label">Featured Photo</label>
                                    <input type="file" className="form-control" id="photo" onChange={(e) => setPhoto(e.target.files[0])} />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">Add Project</button>
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

export default AddProjectPage;
