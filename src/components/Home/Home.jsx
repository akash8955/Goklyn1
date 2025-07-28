import React from 'react'
import { Link } from 'react-router-dom'

import useAnimateOnView from '../common/useAnimateOnView';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Home = () => {
    useAnimateOnView();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname === '/') {
            const els = document.querySelectorAll('.hover-effect');
            els.forEach(el => {
                el.classList.remove('hover-effect-animate');
                void el.offsetWidth;
                el.classList.add('hover-effect-animate');
            });
        }
    }, [location.pathname]);
    return (
        <div>
            <figure className="banner_top_shape mb-0 position-absolute top_bottom_shape">
                <img src="/assets/images/banner_top_shape.png" alt="" className="img-fluid" />
            </figure>
            <figure className="banner_background_shape mb-0 position-absolute left_right_shape">
                <img src="/assets/images/banner_background_shape.png" alt="" />
            </figure>
            <section className="banner-section position-relative" style={{ paddingTop: '100px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-7 col-md-7 col-sm-12 col-12 pt-5" style={{ paddinLeft: '40px' }}>
                            <div className="banner-section-content">
                                <h1 className='home-banner-heading' data-aos="fade-up" data-aos-duration="2000">Goklyn Technologies</h1>
                                <div className="banner_content_wrapper position-relative">
                                    <p style={{ paddingRight: '10px', paddingTop: '20px' }} className="text-white mb-0 home-banner-para" data-aos="fade-right" data-aos-duration="2000">Inspired by wisdom, innovation and strength</p>
                                    <figure className="mb-0 position-absolute">
                                        <img src="/assets/images/banner_white_line.png" alt="" className="img-fluid" />
                                    </figure>
                                </div>
                                <div className="btn_wrapper" data-aos="fade-up" data-aos-duration="2000">
                                    <Link className="text-decoration-none default-btn btn-size-18 hover-effect readmore_btn" to="/about-us">Read More<i className="fa-solid fa-angle-right"></i></Link>
                                    {/* <Link className="text-decoration-none default-btn-two btn-size-18 hover-effect" to="/about-us">Contact Us<i className="fa-solid fa-angle-right"></i></Link> */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-5 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape mt-3">
                                    <img src="/assets/newImages/home.jpg" alt="" style={{ borderRadius: '45px', width: '650px', objectFit: 'contain', marginTop: '67px' }} />
                                </figure>
                                <figure className="banner_image_top_shape mb-0 position-absolute">
                                    <img src="/assets/images/banner_image_top_shape.png" alt="" className="img-fluid" />
                                </figure>
                                <figure className="banner_image_bottom_shape mb-0 position-absolute top_bottom_shape">
                                    <img src="/assets/images/banner_image_bottom_shape.png" alt="" className="img-fluid" />
                                </figure>
                            </div>
                        </div>
                    </div>
                    {/* <figure className="banner_left_image mb-0 position-absolute left_right_shape">
                        <img src="/assets/images/banner_left_image.jpg" alt="" className="img-fluid" />
                    </figure> */}
                    {/* <a href="#footer_section" className="top-btn">
                        <figure className="mb-0 position-absolute">
                            <img src="/assets/images/scroll_down_image.png" alt="" className="img-fluid" />
                        </figure>
                    </a> */}
                </div>
            </section>
        </div>
    )
}

export default Home