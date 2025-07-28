import React from 'react'
import { Link } from 'react-router-dom'

const WhoWeAre = () => {
    return (
        <>
            <section className="who_we_are_section position-relative">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                            <div className="who_we_are_left_content hover-effect">
                                <h6 className="text-white">Who We ARe</h6>
                                <h2 className="text-white">
                                    A team of passionate and dedicated individuals
                                </h2>
                                <p style={{textAlign: 'justify', wordSpacing : '-1px'}}>
                                    We are a team of passionate and dedicated individuals who are committed to making a positive impact in the world. Through our partnerships with startups, enterprises, and government organizations, we deliver high-quality solutions and innovative projects that address real-world challenges.
                                </p>
                                <div className="btn_wrapper">
                                    <Link className="text-decoration-none default-btn-two btn-size-18 hover-effect" to="/about-us">Get Started<i className="fa-solid fa-angle-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                            <figure className="who_we_are_image">
                                <img src="/assets/newImages/cloud_6.png" alt="" className="img-fluid ms-3 top-0 z-3" style={{height : '600px', objectFit : 'contain', width : '100%'}}/>
                            </figure>
                        </div>
                        {/* <div className="col-xl-3 col-lg-12 col-md-12 col-sm-12 col-12">
                            <div className="who_we_are_right_content_wrapper">
                                <div className="video_wrapper position-abssolute">
                                    <div className="video_icon position-relative">
                                        <Link className="popup-vimeo" to="../c58ac645-a2d9-4189-913b-48465e467b7c/watermarked_preview/watermarked_preview.mp4">
                                            <figure className="mb-0">
                                                <img className="img-fluid thumb" style={{ cursor: 'pointer' }} src="assets/images/who_we_are_video_icon.png" alt="" />
                                            </figure>
                                        </Link>
                                    </div>
                                    <div className="content">
                                        <h5 className="mb-0 text-white">Watch Video</h5>
                                    </div>
                                </div>
                                <div className="who_we_are_right_content">
                                    <div className="who_we_are_rightside">
                                        <span>4.6</span>
                                        <ul className="list-unstyled">
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                        </ul>
                                        <h6>Google Reviews</h6>
                                        <p className="text-size-16 mb-0">Dolor sit amet consecteu adiriscing elit.</p>
                                    </div>
                                    <div className="who_we_are_rightside second_column">
                                        <span>4.9</span>
                                        <ul className="list-unstyled">
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                            <li><i className="fa-solid fa-star"></i></li>
                                        </ul>
                                        <h6>Clutch Reviews</h6>
                                        <p className="text-size-16 mb-0">Rolor sit amet consecte adiriscing elit. </p>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    <figure className="who_we_are_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="assets/images/who_we_are_left_shape.png" alt="" className="img-fluid" />
                    </figure>
                    <figure className="who_we_are_right_shape mb-0 position-absolute top_bottom_shape">
                        <img src="assets/images/who_we_are_right_shape.png" alt="" className="img-fluid z-0" />
                    </figure>
                </div>
            </section>
        </>
    )
}

export default WhoWeAre