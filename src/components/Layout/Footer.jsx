import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <section
      className="footer-section"
      id="footer_section"
      style={{ marginTop: "0px" }}
    >
      <div className="container">
        <div className="middle-portion">
          <div className="row">
            <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <div className="about_col">
                <Link to="/">
                  <figure>
                    <img
                      src="/assets/images/logo-1.png"
                      alt=""
                      style={{
                        height: "60px",
                        width: "60px",
                        objectFit: "cover",
                      }}
                    />
                  </figure>
                </Link>
                <ul className="list-unstyled mb-0">
                  <li>
                    <p className="text-size-16">
                      GOKLYN Technologies, your all-in-one destination for
                      cutting-edge internships, industrial project development,
                      and skill development. Whether you&apos;re a student looking to
                      gain real-world experience or a business seeking advanced
                      tech solutions, we&apos;ve got you covered.
                    </p>
                  </li>
                  <li className="icons hover-effect">
                    <a href="https://www.linkedin.com/company/goklyn-pvt-ltd/" target="blank_">
                      <i
                        className="fa-brands fa-linkedin-in mr-0"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </li>
                  <li className="icons hover-effect">
                    <a href="/#" target="blank_">
                      <i className="fa-brands fa-github" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li className="icons hover-effect">
                    <a href="https://www.instagram.com/goklyn_pvt.ltd?igsh=MXNxODI1empyY2MzdA==" target="blank_">
                      <i
                        className="fa-brands fa-instagram"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-12 col-xs-12">
              <div className="links_col">
                <h4>Useful Links</h4>
                <ul className="list-unstyled mb-0">
                  <li>
                    <span></span>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <span></span>
                    <Link to="/about-us">About</Link>
                  </li>
                  <li>
                    <span></span>
                    <Link to="/services">Services</Link>
                  </li>
                  <li>
                    <span></span>
                    <Link to="/career">Career</Link>
                  </li>
                  <li>
                    <span></span>
                    <Link to="/contact-us">Contact us</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <div className="contact_col">
                <h4>Contact Us</h4>
                <ul className="list-unstyled mb-0">
                  <li>
                    <i className="fa-solid fa-phone"></i>
                    <a href="tel:+61383766284" className="text-decoration-none">
                      +91-9024466472
                    </a>
                  </li>
                  <li className="contact_mail">
                    <i className="fa-sharp fa-solid fa-envelope"></i>
                    <a
                      href="mailto:Info@immersiveai.com"
                      className="text-decoration-none"
                    >
                      hr@goklyn.in
                    </a>
                  </li>
                  <li className="mb-0">
                    <i className="fa-solid fa-location-dot location"></i>
                    <span className="text-size-16">Jaipur</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* <div className="col-lg-3 col-md-4 col-sm-6 col-12 text-sm-left text-center d-lg-block d-none">
                        <div className="footer-info-content">
                            <h4>Newsletter</h4>
                            <input type="email" name="email" id="emailadd" className="form-control" placeholder="Enter Email:"/>
                            <div className="input-group-append form-button">
                                <button className="btn" name="btnsubmit" id="submitbtn" type="submit"><i className="fa-solid fa-paper-plane"></i></button>
                            </div>
                            <ul className="list-unstyled mb-0">
                                <li>
                                    <input type="checkbox" id="check" name="check"/>
                                    <span>If you want to subscribe & receive our news letter.</span>
                                </li>
                            </ul>
                        </div> 
                    </div> */}
          </div>
        </div>
        <div className="footer_right_shape top_bottom_shape">
          <figure className="mb-0">
            <img
              src="/assets/images/footer_right_shape.png"
              alt=""
              className="img-fluid"
            />
          </figure>
        </div>
        {/* <div className="footer_background_shape left_right_shape">
          <figure className="mb-0">
            <img src="/assets/images/footer_background_shape.jpg" alt="" />
          </figure>
        </div> */}
      </div>
      <div className="bottom-portion">
        <div className="copyright col-xl-12">
          <p>© 2025 GOKLYN All rights reserved.</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
