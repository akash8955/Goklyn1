import React from 'react';
import PropTypes from 'prop-types';

const Portfolio = ({ projects = [] }) => {
    // Debug: Log projects data
    React.useEffect(() => {
        console.log('Projects data:', projects);
        if (Array.isArray(projects)) {
            projects.forEach((project, index) => {
                if (project && typeof project === 'object') {
                    console.log(`Project ${index + 1}:`, {
                        id: project._id || 'no-id',
                        title: project.title || 'no-title',
                        hasPhoto: !!(project.photo || project.photoPublicId || project.image || project.imageUrl || project.img),
                        allKeys: Object.keys(project)
                    });
                } else {
                    console.warn(`Invalid project at index ${index}:`, project);
                }
            });
        } else {
            console.error('Projects is not an array:', projects);
        }
    }, [projects]);
    // Function to get image URL with better error handling
    const getImageUrl = (project) => {
        // Check if project is valid
        if (!project || typeof project !== 'object') {
            console.error('Invalid project object:', project);
            return '';
        }

        // Debug: Log the project data
        console.log('getImageUrl called with project:', { 
            id: project._id || 'no-id',
            title: project.title || 'no-title',
            photo: project.photo, 
            photoPublicId: project.photoPublicId,
        });
        
        // 1. First check for direct URL in photo field
        if (project.photo && typeof project.photo === 'string') {
            if (project.photo.startsWith('http')) {
                console.log('Using direct URL from project.photo:', project.photo);
                return project.photo;
            }
            
            // If it's not a URL but has a value, try to construct a Cloudinary URL
            let publicId = project.photo;
            if (publicId.includes('res.cloudinary.com')) {
                // Extract public ID from URL
                const parts = publicId.split('/');
                const uploadIndex = parts.findIndex(part => part === 'upload');
                if (uploadIndex > -1) {
                    publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
                }
            }
            
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dummy'; // Fallback to 'dummy' if not set
            const url = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill/${publicId}`;
            console.log('Constructed URL from photo field:', url);
            return url;
        }
        
        // 2. Check if we have a photoPublicId
        if (project.photoPublicId) {
            let publicId = project.photoPublicId;
            
            // If it's a full URL, extract the public ID
            if (publicId.includes('res.cloudinary.com')) {
                const parts = publicId.split('/');
                const uploadIndex = parts.findIndex(part => part === 'upload');
                if (uploadIndex > -1) {
                    publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
                }
            }
            
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dummy';
            const url = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill/${publicId}`;
            console.log('Constructed URL from photoPublicId:', url);
            return url;
        }
        
        console.log('No valid photo URL found for project');
        return '';
    };

    return (
        <section className="portfolio_section py-5">
            <div className="container">
                <div className="row pb-3">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                        <h2 className="text-white">Projects</h2>
                    </div>
                </div>
                <div className="row justify-content-center">
                    {projects.length > 0 ? (
                        projects.map((project, index) => {
                            const imageUrl = getImageUrl(project);
                            console.log(`Rendering project ${index}:`, { 
                                id: project._id, 
                                title: project.title, 
                                imageUrl,
                                hasPhoto: !!imageUrl
                            });

                            // Determine primary link for View Project
                            const githubUrl = project.githubUrl && !/^(https?:\/\/)/i.test(project.githubUrl)
                                ? `https://${project.githubUrl}`
                                : project.githubUrl;
                            const primaryLink = githubUrl || project.projectUrl;

                            return (
                                <div key={project._id} className="service_item col-lg-4 col-md-6 col-sm-12 mb-4">
                                    <div className="border rounded p-4 shadow-lg bg-black text-white h-100" style={{borderRadius : '10px'}}>
                                        {imageUrl ? (
                                            <div style={{ position: 'relative', height: '200px', backgroundColor: '#f0f0f0', borderRadius: '5px', marginBottom: '1rem', overflow: 'hidden' }}>
                                                <img 
                                                    src={imageUrl} 
                                                    alt={project.title} 
                                                    className="img-fluid" 
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '5px',
                                                    }}
                                                    onError={(e) => {
                                                        console.error('Error loading image:', {
                                                            projectId: project._id,
                                                            imageUrl,
                                                            error: e
                                                        });
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center p-5 bg-light" style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <i className="fas fa-image fa-4x text-muted mb-3"></i>
                                                <p className="mb-0">No Image Available</p>
                                            </div>
                                        )}
                                        <h4 className="mb-3 text-primary">{project.title}</h4>
                                        <p>{project.description}</p>
                                        <div>
                                            {Array.isArray(project.tags) && project.tags.length > 0 ? (
                                                project.tags.map(tag => (
                                                    <span key={tag} className="badge bg-secondary me-2">{tag}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted">No tags</span>
                                            )}
                                        </div>
                                        {primaryLink && (
                                            <div className="mt-3">
                                                <a href={primaryLink} target="_blank" rel="noopener noreferrer" 
                                                   className="btn btn-primary btn-sm" style={{minWidth:'120px'}}>
                                                    View Project
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center">
                            <p className="text-white">No projects to display at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

Portfolio.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        photo: PropTypes.string,
        photoPublicId: PropTypes.string,
        image: PropTypes.string,
        imageUrl: PropTypes.string,
        img: PropTypes.string,
        // Add other expected props here
    }))
};

Portfolio.defaultProps = {
    projects: []
};

export default Portfolio;
