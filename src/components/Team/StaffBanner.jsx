import React from 'react'

const StaffBanner = () => {
    const team = [
        {
            id: 1,
            name: "Harsh Saini",
            role: "Team Member",
            img: "/assets/newImages/harsh_saini_3.jpg"
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
            linkedin: "(25) Pranjali Khandelwal | LinkedIn"
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
        <>
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

                        {/* <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                            <div className="team_box hover-effect">
                                <figure><img src="/assets/images/team_image2.jpg" alt="" className="img-fluid"/></figure>
                                <h5>Leon Brown</h5>
                                <p className="text-size-16">Deserunt</p>
                                <div className="team_social_icons">
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-facebook-f hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-twitter hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                            <div className="team_box hover-effect">
                                <figure><img src="/assets/images/team_image3.jpg" alt="" className="img-fluid"/></figure>
                                <h5>Eric Steele</h5>
                                <p className="text-size-16">Molestiae</p>
                                <div className="team_social_icons">
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-facebook-f hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-twitter hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    {/* <div className="row" data-aos="fade-up" data-aos-duration="2000">
                        <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                            <div className="team_box hover-effect">
                                <figure><img src="/assets/images/team_image4.jpg" alt="" className="img-fluid"/></figure>
                                <h5>Byron Hanson</h5>
                                <p className="text-size-16">Tenetur</p>
                                <div className="team_social_icons">
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-facebook-f hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-twitter hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                            <div className="team_box hover-effect">
                                <figure><img src="/assets/images/team_image5.jpg" alt="" className="img-fluid"/></figure>
                                <h5>Rene Luckey</h5>
                                <p className="text-size-16">Perferendis</p>
                                <div className="team_social_icons">
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-facebook-f hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-twitter hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                            <div className="team_box hover-effect">
                                <figure><img src="/assets/images/team_image6.jpg" alt="" className="img-fluid"/></figure>
                                <h5>Lyle Janes</h5>
                                <p className="text-size-16">Eveniet</p>
                                <div className="team_social_icons">
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-facebook-f hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-twitter hover-effect" aria-hidden="true"></i>
                                    </a>
                                    <a href="#" className="text-decoration-none">
                                        <i className="fa-brands fa-linkedin-in  hover-effect mr-0" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    <figure className="team_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/team_left_shape.png" alt="" className="img-fluid" />
                    </figure>
                </div>
            </section>
        </>
    )
}

export default StaffBanner