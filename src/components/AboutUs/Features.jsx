import React from 'react'
import { Link } from 'react-router-dom'

const Features = () => {
    return (
        <>
            <section className="feature_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                            <div className="feature_image">
                                <figure className="feature_main_image position-relative mb-0">
                                    <img src="/assets/images/feature_image1.jpg" alt="" className="img-fluid"/>
                                </figure>
                                <figure className="feature_second_image position-absolute mb-0">
                                    <img src="/assets/images/feature_image2.jpg" alt="" className="img-fluid"/>
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
                                            <img src="/assets/images/certified_expert.png" alt="" className="img-fluid"/>
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
                                            <img src="/assets/images/support.png" alt="" className="img-fluid"/>
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
                        <img src="/assets/images/features_background_shape.jpg" alt=""/>
                    </figure>
                    <figure className="feature_top_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/features_top_shape.png" alt="" className="img-fluid"/>
                    </figure>
                </div>
            </section>
        </>
    )
}

export default Features