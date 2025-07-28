import React from 'react'
import { Link } from 'react-router-dom'

const Meet = () => {
    return (
        <>
            <div className="client_logos_section">
                <div className="container">
                    <div className="row" data-aos="fade-up" data-aos-duration="2000">
                        <div className="col-lg-1 col-md-1 col-sm-6 col-12 d-md-block d-none"></div>
                        <div className="col-lg-2 col-md-2 col-sm-4 col-6">
                            <figure className="logo_image1 mb-0">
                                <img src="/assets/images/client_logo_image1.png" alt="" className="img-fluid hover-effect" />
                            </figure>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-4 col-6">
                            <figure className="logo_image2 mb-0">
                                <img src="/assets/images/client_logo_image2.png" alt="" className="img-fluid hover-effect" />
                            </figure>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-4 col-6">
                            <figure className="logo_image3 mb-0">
                                <img src="/assets/images/client_logo_image3.png" alt="" className="img-fluid hover-effect" />
                            </figure>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-4 col-6">
                            <figure className="logo_image4 mb-0">
                                <img src="/assets/images/client_logo_image4.png" alt="" className="img-fluid hover-effect" />
                            </figure>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-4 col-6">
                            <figure className="logo_image5 mb-0">
                                <img src="/assets/images/client_logo_image5.png" alt="" className="img-fluid hover-effect" />
                            </figure>
                        </div>
                        <div className="col-lg-1 col-md-1 col-sm-6 col-12 d-md-block d-none"></div>
                    </div>
                </div>
            </div>
            {/* <!-- GET STARTED SECTION --> */}
            <div className="get_started_section">
                <div className="container">
                    <div className="get_started_box">
                        <div className="row">
                            <div className="col-lg-5 col-md-5 col-sm-12 col-12 order-md-1 order-2">
                                <div className="get_started_box_image">
                                    <figure className="mb-0 left_right_shape">
                                        <img src="/assets/newImages/cloud__1_-removebg-preview.png" alt="" className="img-fluid" />
                                    </figure>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-7 col-sm-12 col-12 order-md-2 order-1">
                                <div className="get_started_box_content" data-aos="fade-right" data-aos-duration="2000">
                                    <h6>GEt Started</h6>
                                    <h2>Let&apos;s Make Something Great Together</h2>
                                    <div className="btn_wrapper">
                                        <Link className="text-decoration-none default-btn-two btn-size-18 hover-effect" to="/contact-us">Contact Us<i className="fa-solid fa-angle-right"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <figure className="get_started_shape mb-0 left_right_shape">
                        <img src="/assets/images/get_started_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </div>
        </>
    )
}

export default Meet