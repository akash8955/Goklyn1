import React from 'react'

const Team = () => {
    const team = [
        {
            id: 1,
            name: "Harsh Saini",
            role: "Team Member",
            img: "/assets/newImages/harsh_saini_3.jpg",
            linkedin:"https://www.linkedin.com/in/harsh-saini-26957424a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        },
        {
            id: 2,
            name: "Akarsh Chaturvedi",
            role: "Team Member",
            img: "/assets/newImages/Akash_chaturvedi.jpeg",
            linkedin: "https://www.linkedin.com/in/akarsh-chaturvedi-259271236?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        },
        {
            id: 3,
            name: "Ravindra Yadav",
            role: "Team Member",
            img: "/assets/newImages/Ravindra_yadav_2.jpg",
            linkedin: "https://www.linkedin.com/in/ravindra-yadav04"
        },
        {
            id: 4,
            name: "Pranjali Khandelwal",
            role: "Team Member",
            img: "/assets/newImages/prachi_khandelwal_1.png",
            linkedin: "https://www.linkedin.com/in/pranjali-khandelwal-0b4041272?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        },
        {
            id: 5,
            name: "Sonam Sharma",
            role: "Team Member",
            img: "/assets/newImages/sonam_sharma_1.jpeg",
            linkedin: 'https://www.linkedin.com/in/sonam-sharma-52847b255?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',

        },
    ];
    return (
        <div>
            <section className="banner-section position-relative" style={{ paddingTop: "200px" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner-section-content">
                                <h1 className="text-white" data-aos="fade-up" data-aos-duration="2000">Our Team</h1>
                                <p className="text-white" data-aos="fade-right" data-aos-duration="2000">At GOKLYN Technologies, our team comprises a dynamic group of passionate students from diverse educational backgrounds. Guided by experienced mentors, we foster a culture of collaboration, innovation, and growth.</p>
                                <div className="btn_wrapper" data-aos="fade-up" data-aos-duration="2000">
                                    <span> Home </span><i className="fa-solid fa-angles-right" aria-hidden="true"></i><span className="sub_span">Team</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape">
                                    <img src="/assets/newImages/teams.jpg" alt="" style={{ borderRadius: '45px', width: '650px', objectFit: 'contain' }} />
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


            <section className="team_section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                            <div className="team_content">
                                <h6>Our Staff</h6>
                                <h2>Our Team Members</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row" data-aos="fade-up" data-aos-duration="2000">

                        {team.map((member) => {
                            return (
                                <div key={member.id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                                    <div className="team_box hover-effect">
                                        <figure><img src={member.img} alt="" className="img-fluid" /></figure>
                                        <h5>{member.name}</h5>
                                        <p className="text-size-16">{member.role}</p>
                                        <div className="team_social_icons">
                                            <a href={member.linkedin ? member.linkedin : ''} className="text-decoration-none">
                                                <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <figure className="team_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/team_left_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>

            <section
                className="container py-5 text-white"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.85)", // Dark semi-transparent background
                    borderRadius: "12px",
                }}
            >
                <div className="text-center mb-4">
                    <h2 className="fw-bold">What Sets Our Team Apart?</h2>
                </div>

                <div className="row g-4">
                    {[
                        {
                            title: "Student-Led Innovation",
                            description:
                                "Our team members actively contribute to cutting-edge projects, gaining practical knowledge and leadership skills in the ever-evolving tech landscape.",
                        },
                        {
                            title: "Mentorship-Driven Approach",
                            description:
                                "Students work under the guidance of skilled professionals who provide personalized mentorship and support, shaping their careers with real-world experience.",
                        },
                        {
                            title: "Diverse Skill Sets",
                            description:
                                "From AI to Cybersecurity, our team members bring expertise in various domains, enabling us to deliver comprehensive and innovative solutions tailored for the future.",
                        },
                    ].map((item, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div
                                className="card shadow-sm border-light rounded-3 p-4 h-100"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism effect
                                    color: "white",
                                    borderWidth: "1.5px",
                                    borderOpacity: "50%",
                                    backdropFilter: "blur(10px)", // Subtle blur for better contrast
                                }}
                            >
                                <h5 className="fw-semibold">{item.title}</h5>
                                <p className="text-light">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-5">
                    <p className="fw-bold">
                        At <span className="text-primary">GOKLYN</span>, we believe in the
                        power of teamwork and the potential of young minds to drive
                        technological progress.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Team