import React from 'react'
import { Link } from 'react-router-dom'

const AboutBanner2 = () => {
    return (
        <>
            <section className="about_aboutus_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                            <div className="aboutus_content"  data-aos="fade-up" data-aos-duration="2000">
                                <h6>Why Choose</h6>
                                <h2>Goklyn Private Limited</h2>
                                <p style={{color:'#fff', textAlign:'justify'}}>
                                At GOKLYN Technologies, we are committed to creating an inclusive and innovative ecosystem that fosters learning, collaboration, and technological advancement. Our mission is to bridge the gap between academia and industry, empowering students from all backgrounds, especially those in tier-3 and tier-4 colleges, to develop skills that make them industry-ready. By providing hands-on training and opportunities to work on real-world projects, we ensure that our students are prepared for the challenges of the ever-evolving tech landscape.
                                <br/><br/>
                                Through our partnerships with startups, enterprises, and government organizations, we deliver high-quality solutions and innovative projects that address real-world challenges. Together, we’re building a platform where education meets technology and where innovation drives progress.
                                </p>
                            </div>
                        </div>
                    </div>
                    <figure className="aboutus_right_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/aboutus_video_right_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>
        </>
    )
}

export default AboutBanner2