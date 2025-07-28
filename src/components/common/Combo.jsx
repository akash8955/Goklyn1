import React from 'react'

const Combo = () => {
    return (
        <>
            <section className="combo_section">
                {/* <!-- FAQ'S SECTION --> */}
                <div className="accordian-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                <div className="heading position-relative text-center">
                                    <h6>FAQ’s</h6>
                                    <h2>Frequently Asked Questions</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12" data-aos="fade-up" data-aos-duration="2000">
                                <div className="about-service-section-text accordian-section-inner-text position-relative">
                                    <div className="accordian-inner">
                                        <div id="accordion1">
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingFour">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                                        What services does your startup provide?
                                                    </button>
                                                </div>
                                                <div id="collapseFour" className="collapse" aria-labelledby="headingFour">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">We specialize in AI, Machine Learning, Human Resource Management, and Business Management solutions. Additionally, we offer research opportunities, internships, and collaborate on government projects.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingFive">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                                        Who can apply for internships and research programs?
                                                    </button>
                                                </div>
                                                <div id="collapseFive" className="collapse" aria-labelledby="headingFive">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">Students, graduates, and professionals from diverse backgrounds can apply. We have opportunities in AI, ML, HR, and Management, and research programs for those interested in innovative projects and academic collaborations.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingSix">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                                    Do you collaborate on government and corporate projects?
                                                    </button>
                                                </div>
                                                <div id="collapseSix" className="collapse" aria-labelledby="headingSix">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">Yes, we actively work with government bodies and corporate clients on AI-driven solutions, policy research, data analytics, and strategic management initiatives.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12" data-aos="fade-right" data-aos-duration="2000">
                                <div className="about-service-section-text position-relative">
                                    <div className="accordian-inner">
                                        <div id="accordion2">
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingSeven">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                                                    How can AI and ML solutions benefit businesses and researchers?
                                                    </button>
                                                </div>
                                                <div id="collapseSeven" className="collapse" aria-labelledby="headingSeven">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">Our AI and ML solutions enhance automation, improve decision-making, optimize HR functions, and provide advanced data analytics for businesses and research institutions.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingEight">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseEight" aria-expanded="false" aria-controls="collapseEight">
                                                    How can individuals, businesses, or institutions collaborate with your startup?
                                                    </button>
                                                </div>
                                                <div id="collapseEight" className="collapse" aria-labelledby="headingEight">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">We welcome partnerships for projects, research, and business solutions. Interested parties can connect with us via our website, email, or social media for collaboration inquiries.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-card">
                                                <div className="card-header" id="headingNine">
                                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseNine" aria-expanded="false" aria-controls="collapseNine">
                                                    Where can I find updates on new projects, internships, and research opportunities?
                                                    </button>
                                                </div>
                                                <div id="collapseNine" className="collapse" aria-labelledby="headingNine">
                                                    <div className="card-body">
                                                        <p className="text-size-16 text-left mb-0 p-0">We regularly post updates on our website, LinkedIn, and other social media platforms about upcoming projects, research initiatives, and career opportunities.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <figure className="mb-0 faq_right_shape position-absolute top_bottom_shape">
                        <img src="/assets/images/faq_right_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
                {/* <!-- CLIENT LOGO'S SECTION --> */}

            </section>
        </>
    )
}

export default Combo