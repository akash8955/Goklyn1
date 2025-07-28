import React from 'react'

const Mission = () => {
    return (
        <>
            <section className="mission_vision_section position-relative">
                <div className="container">
                    <div className="row position-relative" data-aos="fade-up" data-aos-duration="2000">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="mission_vision_box hover-effect">
                                <figure>
                                    <img src="/assets/images/our_mission_image.png" alt="" className="img-fluid hover-effect"/>
                                </figure>
                                <h4>Our Mission</h4>
                                <p className="mb-0">To create an accessible and innovative tech ecosystem where students, startups, and enterprises come together to shape the future of technology.</p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="mission_vision_box hover-effect">
                                <figure>
                                    <img src="/assets/images/our_vision_image.png" alt="" className="img-fluid hover-effect"/>
                                </figure>
                                <h4>Our Vision</h4>
                                <p className="mb-0">To empower individuals and organizations with the skills, tools, and technologies needed to drive success and innovation in the digital age.</p>
                            </div>
                        </div>
                        <figure className="mission_vision_background_shape mb-0 position-absolute left_right_shape">
                            <img src="/assets/images/mission_vision_background_shape.png" alt="" className="img-fluid"/>
                        </figure>
                    </div>
                    <figure className="mission_vision_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/mission_vision_left_shape.png" alt="" className="img-fluid"/>
                    </figure>
                </div>
            </section>
        </>
    )
}

export default Mission