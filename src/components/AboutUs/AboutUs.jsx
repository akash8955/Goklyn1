import React from 'react'

const AboutUs = () => {
    const founders = [
        {
            name: "Mohit Sharma",
            role: "Director",
            img: "/assets/newImages/Mohit_sharma.jpeg",
            bio: "Director of goklyn pvt Ltd leads the company with a mission to revolutionize the technology in medical field. With  deep passion for blending medical expertise with technical advancements.",
        },
        {
            name: "Monika Sharma",
            role: "Director",
            img: "/assets/newImages/Monika_sharma.jpeg",
            bio: "Founder of Goklyn Technologies by Goklyn Pvt Ltd, holds a B.Sc. in Physics (Hons) and a B.Tech in Computer Science. She leads advancements in networking, cybersecurity, cryptography, quantum computing, and quantum machine learning & communication.",
        },
    ];
    return (
        <div>
            <section
                className="banner-section position-relative"
                style={{ paddingTop: "100px" }}
            >
                <div className="container pt-5">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner-section-content">
                                <h1
                                    className="text-white"
                                    data-aos="fade-up"
                                    data-aos-duration="2000"
                                >
                                    About Us
                                </h1>
                                <p
                                    className="text-white"
                                    data-aos="fade-right"
                                    data-aos-duration="2000"
                                >
                                    We’re building a platform where education meets technology and
                                    where innovation drives progress.
                                </p>
                                <div
                                    className="btn_wrapper"
                                    data-aos="fade-up"
                                    data-aos-duration="2000"
                                >
                                    <span> Home </span>
                                    <i
                                        className="fa-solid fa-angles-right"
                                        aria-hidden="true"
                                    ></i>
                                    <span className="sub_span">About Us</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape">
                                    <img src="/assets/newImages/about-us.jpg" alt="" style={{ borderRadius: '45px', width: '650px', objectFit: 'contain' }} />
                                </figure>
                                <figure className="banner_image_bottom_shape mb-0 position-absolute top_bottom_shape">
                                    <img
                                        src="/assets/images/sub_banner_image_bottom_shape.png"
                                        alt=""
                                        className="img-fluid"
                                    />
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <figure className="banner_top_shape mb-0 position-absolute top_bottom_shape">
                <img
                    src="assets/images/sub_banner_top_shape.png"
                    alt=""
                    className="img-fluid"
                />
            </figure>
            <figure className="banner_background_shape mb-0 position-absolute left_right_shape">
                <img src="assets/images/sub_banner_background_shape.png" alt="" />
            </figure>

            <section className="about_aboutus_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                            <div className="aboutus_content" data-aos="fade-up" data-aos-duration="2000">
                                <h6>Why Choose</h6>
                                <h2>Goklyn Private Limited</h2>
                                <p style={{ color: '#fff', textAlign: 'justify' }}>
                                    At GOKLYN Technologies, we are committed to creating an inclusive and innovative ecosystem that fosters learning, collaboration, and technological advancement. Our mission is to bridge the gap between academia and industry, empowering students from all backgrounds, especially those in tier-3 and tier-4 colleges, to develop skills that make them industry-ready. By providing hands-on training and opportunities to work on real-world projects, we ensure that our students are prepared for the challenges of the ever-evolving tech landscape.
                                    <br /><br />
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

            <section className="mission_vision_section position-relative">
                <div className="container">
                    <div className="row position-relative" data-aos="fade-up" data-aos-duration="2000">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="mission_vision_box hover-effect">
                                <figure>
                                    <img src="/assets/images/our_mission_image.png" alt="" className="img-fluid hover-effect" />
                                </figure>
                                <h4>Our Mission</h4>
                                <p className="mb-0">To create an accessible and innovative tech ecosystem where students, startups, and enterprises come together to shape the future of technology.</p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="mission_vision_box hover-effect">
                                <figure>
                                    <img src="/assets/images/our_vision_image.png" alt="" className="img-fluid hover-effect" />
                                </figure>
                                <h4>Our Vision</h4>
                                <p className="mb-0">To empower individuals and organizations with the skills, tools, and technologies needed to drive success and innovation in the digital age.</p>
                            </div>
                        </div>
                        <figure className="mission_vision_background_shape mb-0 position-absolute left_right_shape">
                            <img src="/assets/images/mission_vision_background_shape.png" alt="" className="img-fluid" />
                        </figure>
                    </div>
                    <figure className="mission_vision_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/mission_vision_left_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>

            <section className="container py-5 text-white text-center">
                <h2 className="fw-bold mb-4">Meet the Visionaries Behind <span className="text-primary">GOKLYN</span></h2>
                <p className="mb-5 mx-auto" style={{ maxWidth: "100%" }}>
                    Our founders are tech enthusiasts and industry veterans with a shared vision of bridging
                    the gap between academia and industry. With years of experience in research, project
                    development, and mentorship, they are dedicated to building a platform that transforms
                    students into industry-ready professionals and helps businesses thrive with cutting-edge
                    solutions.
                </p>

                <div className="row g-4 justify-content-center">
                    {founders.map((founder, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div
                                className="card border-light shadow-sm p-4 h-100"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.07)",
                                    color: "white",
                                    borderWidth: "0.8px",
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                    backdropFilter: "blur(12px)",
                                    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                    borderRadius: '10px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.01)";
                                    e.currentTarget.style.boxShadow = "0px 8px 16px rgba(255, 255, 255, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <img
                                    src={founder.img}
                                    alt={founder.name}
                                    className="rounded-circle mb-3 object-fit-cover align-self-center"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        border: "3px solid rgba(255, 255, 255, 0.2)",
                                        padding: "5px",
                                        backgroundPosition: 'center',
                                        objectPosition: '0.5px 10%',
                                        scale: '1.05'
                                    }}
                                />
                                <h5 className="fw-semibold">{founder.name}</h5>
                                <p className="text-primary fw-bold">{founder.role}</p>
                                <p className="text-light" style={{ fontSize: '16px' }}>{founder.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="feature_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                            <div className="feature_image">
                                <figure className="feature_main_image position-relative mb-0">
                                    <img src="/assets/images/feature_image1.jpg" alt="" className="img-fluid" />
                                </figure>
                                <figure className="feature_second_image position-absolute mb-0">
                                    <img src="/assets/images/feature_image2.jpg" alt="" className="img-fluid" />
                                </figure>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                            <div className="feature_content" data-aos="fade-right" data-aos-duration="2000">
                                <h6>FEATURES</h6>
                                <h2>Empowering People By Keeping Them Well</h2>
                                <p>
                                    Our mission is to provide the best possible service to our clients, and to make a positive impact on
                                </p>
                                <ul className="list-unstyled mb-0">
                                    <li>
                                        <figure className="mb-0">
                                            <img src="/assets/images/certified_expert.png" alt="" className="img-fluid" />
                                        </figure>
                                        <div className="feature_content_wrapper">
                                            <p className="first_p">Certified Experts</p>
                                            <p className="text-size-16 mb-0">
                                                100% of our clients are happy with our services.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="second_li">
                                        <figure className="mb-0">
                                            <img src="/assets/images/support.png" alt="" className="img-fluid" />
                                        </figure>
                                        <div className="feature_content_wrapper">
                                            <p className="first_p">24/7 Support</p>
                                            <p className="text-size-16 mb-0">
                                                24/7 access to our support team.
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                                {/* <div className="btn_wrapper">
                                    <Link className="text-decoration-none default-btn btn-size-18 hover-effect" to="/about-us">Get Started<i className="fa-solid fa-angle-right"></i></Link>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <figure className="feature_background_shape mb-0 position-absolute left_right_shape">
                        <img src="/assets/images/features_background_shape.jpg" alt="" />
                    </figure>
                    <figure className="feature_top_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/features_top_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>
        </div>
    )
}

export default AboutUs