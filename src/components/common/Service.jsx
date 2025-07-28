import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Service = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    const servicesHeadingRef = useRef(null);
    // Always animate on route change to homepage
    useEffect(() => {
        const el = servicesHeadingRef.current;
        if (!el) return;
        if (location.pathname === '/') {
            el.classList.remove('services-anim');
            void el.offsetWidth;
            el.classList.add('services-anim');
        }
    }, [location.pathname]);

    // Animate every time the heading enters the viewport
    useEffect(() => {
        const el = servicesHeadingRef.current;
        if (!el) return;
        const observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.remove('services-anim');
                    void el.offsetWidth;
                    el.classList.add('services-anim');
                } else {
                    el.classList.remove('services-anim');
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section className="services_section position-relative">
            <div className="container">
                <div className="row">
                    <div className="col-lg-5 col-md-5 col-sm-12 col-12">
                        <div className="services_content">
                            <h6>What We Can Do</h6>
                            <h2 ref={servicesHeadingRef} className="services-anim">Services We Can Help You With</h2>
                        </div>
                    </div>
                    <div className="col-lg-7 col-md-7 col-sm-12 col-12 d-md-block d-none"></div>
                </div>

                <div className="row position-relative" data-aos="fade-up" data-aos-duration="2000">
                    {/* ✅ Disable slider on Home Page ("/") */}
                    {isHomePage ? (
                        <div className="services_list flex-wrap justify-align-content-be">
                            {/* List Items without Slider */}
                            <div className='row'>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image1.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Quantum Computing</h5>
                                        <p>Combines quantum computing with machine learning algorithms.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image3.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Machine Learning</h5>
                                        <p>Machine learning is a type of artificial intelligence (AI) that allows computers to learn and improve from data without being explicitly programmed</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image2.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Cybersecurity & Ethical Hacking</h5>
                                        <p>Cybersecurity is the practice of protecting systems from attacks.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ✅ Enable Slider only on `/services` */
                        <div className="services_list flex-wrap justify-align-content-be">
                            {/* List Items without Slider */}
                            <div className='row'>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image5.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Artificial Intelligence & Machine Learning</h5>
                                        <p>Machine learning is a type of artificial intelligence (AI).</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/our_vision_image.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Cyber Security & Ethical Hacking</h5>
                                        <p>Cybersecurity is the practice of protecting systems from attacks.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image4.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Quantum ML & Quantum Cryptography</h5>
                                        <p>Quantum Machine Learning (QML) refers to the integration of quantum computing </p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="service_item col-lg-4 col-md-6 col-sm-12 mt-3">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image3.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Data Analysis & Business Analysis</h5>
                                        <p>Data analysis and business analysis (BA) are both data-driven processes that help businesses.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12 mt-3">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image4.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Web Development & UI/UX Design</h5>
                                        <p>Web development is the technical process of building websites, while UI/UX design focuses.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="service_item col-lg-4 col-md-6 col-sm-12 mt-3">
                                    <div className="services_box hover-effect">
                                        <figure>
                                            <img src="/assets/images/services_box_image1.png" alt="" className="img-fluid hover-effect" />
                                        </figure>
                                        <h5>Social Media & Digital Marketing</h5>
                                        <p>Social media marketing is a form of digital marketing that leverages the power of popular social media networks to achieve your marketing.</p>
                                        <div className="btn_wrapper">
                                            <Link to="/services" className="text-decoration-none">Read More <i className="fa-solid fa-angle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                </div>

                {/* ✅ Keep Additional Sections for All Pages */}
                <figure className="services_background_shape mb-0 position-absolute left_right_shape">
                    <img src="/assets/images/services_background_shape.png" alt="" className="img-fluid" />
                </figure>
            </div>
        </section >
    );
};

            <style>{`
                .services-anim {
                    animation: fadeSlideInServices 0.8s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeSlideInServices {
                    0% {
                        transform: translateY(80px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
            `}</style>
export default Service;
