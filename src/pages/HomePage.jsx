import React, { useState, useEffect } from 'react';
import api from '../api';
import Banner from '../components/Home/Banner'
import Portfolio from '../components/common/Portfolio'
import Service from '../components/common/Service'
import About from '../components/Home/About'
import WhoWeAre from '../components/common/WhoWeAre'
import Testimonial from '../components/common/Testimonial'

const HomePage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
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
        <div>
            <Banner/>
            {loading ? (
                <div className="text-center py-5"><p className="text-white">Loading projects...</p></div>
            ) : (
                <Portfolio projects={projects} />
            )}
            <Service/>
            <About/>
            <WhoWeAre/>
            <Testimonial/>
            {/* <Combo/> */}
        </div>
    )
}

export default HomePage