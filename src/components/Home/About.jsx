import React from 'react'
import { Link } from 'react-router-dom'

const About = () => {
    return (
        <>
            <section className="aboutus_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                            <div className="aboutus_image">
                                <figure className="aboutus_main_image mb-0">
                                    <img src="./assets/images/aboutus_image.jpg" alt="" className="img-fluid" />
                                </figure>
                                <figure className="aboutus_image_shape position-absolute mb-0 left_right_shape">
                                    <img src="./assets/images/aboutus_image_shape.png" alt="" className="img-fluid" />
                                </figure>
                                {/* <div className="image_box_wrapper hover-effect">
                                    <figure className="mb-0 box_image float-left">
                                        <img src="./assets/images/aboutus_box_image.png" alt="" className="img-fluid hover-effect" />
                                    </figure>
                                    <div className="image_content_wrapper">
                                        <div className="span_wrapper">
                                            <span className="number counter">18</span>
                                            <span className="plus">+</span>
                                        </div>
                                        <p className="mb-0">Years of Experience</p>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                            <div className="aboutus_content hover-effect">
                                <h6>About US</h6>
                                <h2>Empowering Business with AI us</h2>
                                <p>At GOKLYN Technologies, we are committed to creating an inclusive and innovative ecosystem that fosters learning, collaboration, and technological advancement.</p>
                                <ul className="list-unstyled mb-0">
                                    <li>
                                        <i className="fa fa-check" aria-hidden="true"></i>
                                        <p>hands-on training and opportunities to work on real-world projects</p>
                                    </li>
                                    <li>
                                        <i className="fa fa-check" aria-hidden="true"></i>
                                        <p>partnerships with startups, enterprises, and government organizations</p>
                                    </li>
                                    <li>
                                        <i className="fa fa-check" aria-hidden="true"></i>
                                        <p>deliver high-quality solutions and innovative projects</p>
                                    </li>
                                </ul>
                                <div className="btn_wrapper">
                                    <Link className="text-decoration-none default-btn btn-size-18 hover-effect" to="/about-us">Read More<i className="fa-solid fa-angle-right"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <figure className="aboutus_background_shape mb-0 position-absolute left_right_shape">
                        <img src="./assets/images/aboutus_background_shape.jpg" alt="" />
                    </figure>
                    <figure className="aboutus_top_shape mb-0 position-absolute top_bottom_shape">
                        <img src="./assets/images/aboutus_top_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>
        </>
    )
}

export default About