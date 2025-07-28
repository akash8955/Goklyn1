import React from 'react'

const ProjectBanner = () => {
    return (
        <>
            <section className="banner-section position-relative" style={{paddingTop : '200px'}}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner-section-content">
                                <h1 className="text-white" data-aos="fade-up" data-aos-duration="2000">Projects</h1>
                                <p className="text-white" data-aos="fade-right" data-aos-duration="2000">
                                    Discover our latest projects and see how we can help you achieve your goals.
                                </p>
                                <p className='text-white' data-aos="fade-right" data-aos-duration="2000">
                                    &ldquo;Our projects focus on building scalable, efficient, and secure solutions across various domains, including web development, cybersecurity, networking, and quantum computing. We leverage modern technologies and best practices to create high-performance applications with seamless user experiences.&rdquo;
                                </p>
                                <div className="btn_wrapper" data-aos="fade-up" data-aos-duration="2000">
                                    <span> Home </span><i className="fa-solid fa-angles-right" aria-hidden="true"></i><span className="sub_span">Projects</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape">
                                    <img src="/assets/newImages/projects.jpg" alt="" style={{borderRadius:'45px', width:'100%', objectFit:'contain'}} />
                                </figure>
                                <figure className="banner_image_bottom_shape mb-0 position-absolute top_bottom_shape">
                                    <img src="/assets/images/sub_banner_image_bottom_shape.png" alt="" className="img-fluid" />
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <figure className="banner_top_shape mb-0 position-absolute top_bottom_shape">
                <img src="/assets/images/sub_banner_top_shape.png" alt="" className="img-fluid" />
            </figure>
            <figure className="banner_background_shape mb-0 position-absolute left_right_shape">
                <img src="/assets/images/sub_banner_background_shape.png" alt="" />
            </figure>
        </>
    )
}

export default ProjectBanner