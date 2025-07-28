import React, { useState, useEffect } from 'react';
import api from '../api';

import ProjectBanner from '../components/Projects/ProjectBanner';
import Portfolio from '../components/common/Portfolio';
import Testimonial from '../components/common/Testimonial';
import Meet from '../components/common/Meet';


const ProjectPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                console.log('Projects data from API:', response.data);
                // Check the structure of the first project
                if (response.data && response.data.length > 0) {
                    console.log('First project structure:', {
                        id: response.data[0]._id,
                        title: response.data[0].title,
                        photo: response.data[0].photo,
                        photoPublicId: response.data[0].photoPublicId,
                        hasPhoto: !!response.data[0].photo || !!response.data[0].photoPublicId,
                        allKeys: Object.keys(response.data[0])
                    });
                }
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <>

            <ProjectBanner />
            {loading ? (
                <div className="container text-center py-5">
                    <p className="text-white">Loading projects...</p>
                </div>
            ) : (
                <Portfolio projects={projects} />
            )}
            
            <Testimonial />
            <Meet />

        </>
    );
};

export default ProjectPage;