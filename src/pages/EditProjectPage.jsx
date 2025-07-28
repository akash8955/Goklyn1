import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditProjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [tags, setTags] = useState('');
    const [photo, setPhoto] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await api.get(`/api/projects/${id}`);
                const project = response.data;
                setTitle(project.title);
                setDescription(project.description);
                setProjectUrl(project.projectUrl || '');
                setTags(project.tags.join(', '));
                setCurrentPhoto(project.photo);
            } catch (error) {
                setMessage('Error fetching project data');
                console.error('Fetch error:', error);
            }
        };
        fetchProject();
    }, [id]);

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
            await api.post(`/api/projects/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Project updated successfully!');
            setTimeout(() => navigate('/admin/manage-projects'), 1500);
        } catch (error) {
            setMessage(error.response?.data?.msg || 'An error occurred during update');
            console.error('Update error:', error);
        }
    };

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Edit Project</h2>
                            <form onSubmit={handleSubmit}>
                                {currentPhoto && <img src={`http://localhost:5000${currentPhoto}`} alt="Current project" className="img-fluid rounded mb-3"/>}
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
                                    <label htmlFor="photo" className="form-label">Replace Photo (optional)</label>
                                    <input type="file" className="form-control" id="photo" onChange={(e) => setPhoto(e.target.files[0])} />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">Update Project</button>
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

export default EditProjectPage;
