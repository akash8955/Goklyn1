import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <header className="main_header fixed-top">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xxl-2 col-xl-2 col-lg-1 col-md-3">
              <div className="logo-header">
                <Link to="/">
                  <img src="/assets/images/logo-1.png" alt="..." height="60" />
                </Link>
              </div>
            </div>
            <div className="col-xxl-8 col-xl-8 col-lg-10 col-md-6">
              <div className="nav_bar">
                <ul className="d-flex menubar gap-3 text-nowrap">
                  <li className="nav-item">
                    <Link
                      to="/"
                      className={`nav-link ${path === "/" ? "active" : ""}`}
                    >
                      home
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <Link
                      to="/"
                      className="nav-link"
                      type="button"
                      data-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Our company <i className="fa-solid fa-angle-down"></i>
                    </Link>
                    <ul className="dropdown-menu">
                      <li className="nav-item">
                        <Link
                          to="/about-us"
                          className={`dropdown-item ${
                            path === "/about-us" ? "active" : ""
                          }`}
                        >
                          about
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/our-team"
                          className={`dropdown-item nav-link ${
                            path === "/Our-team" ? "active" : ""
                          }`}
                        >
                          Our Team
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/career"
                          className={`dropdown-item nav-link ${
                            path === "/career" ? "active" : ""
                          }`}
                        >
                          Careers
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/services"
                      className={`nav-link ${
                        path === "/services" ? "active" : ""
                      }`}
                    >
                      services
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/portfolio"
                      className={`nav-link ${
                        path === "/portfolio" ? "active" : ""
                      }`}
                    >
                      Projects
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/gallery"
                      className={`nav-link ${
                        path.startsWith("/gallery") ? "active" : ""
                      }`}
                    >
                      Gallery
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/contact-us"
                      className={`nav-link ${
                        path === "/contact-us" ? "active" : ""
                      }`}
                    >
                      contact us
                    </Link>
                  </li>

                </ul>
              </div>
            </div>
            <div className="col-xxl-2 col-xl-2 col-lg-1 col-md-3">
              <div className="navbar-right">
                <ul className="top_rightmenu">
                  <li className="nav-item">
                    <input type="checkbox" id="burger-toggle" />
                    <label htmlFor="burger-toggle" className="burger-container">
                      <div className="burger-line"></div>
                      <div className="burger-line"></div>
                      <div className="burger-line"></div>
                    </label>
                    <nav className="nav-menu">
                      <div className="toggle_logo">
                        <a href="/">
                          <img
                            src="/assets/images/logo-1.png"
                            alt="..."
                            height="60"
                          />
                        </a>
                      </div>
                      <ul className="menubar">
                        <li className="nav-item">
                          <Link
                            to="/"
                            className={`nav-link ${
                              path === "/" ? "active" : ""
                            }`}
                          >
                            home
                          </Link>
                        </li>
                        <li className="nav-item dropdown">
                          <Link
                            to="/about-us"
                            className={`nav-link ${
                              path === "/about-us" ? "active" : ""
                            }`}
                          >
                            our company
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            to="/services"
                            className={`nav-link ${
                              path === "/services" ? "active" : ""
                            }`}
                          >
                            services
                          </Link>
                        </li>
                        <li className="nav-item dropdown">
                          <Link
                            to="/portfolio"
                            className={`nav-link ${
                              path === "/portfolio" ? "active" : ""
                            }`}
                          >
                            Projects
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            to="/contact-us"
                            className={`nav-link ${
                              path === "/contact-us" ? "active" : ""
                            }`}
                          >
                            contact us
                          </Link>
                        </li>
                        <div className="grty">
                          <ul>
                            <li className="nav-item">
                              <Link to="/about-us">about</Link>
                            </li>
                            <li className="nav-item">
                              <Link to="/our-team">Our Team</Link>
                            </li>
                            <li className="nav-item">
                              <Link to="/career">Careers</Link>
                            </li>
                          </ul>
                        </div>
                        <div className="dsfg">
                          <ul className="list-unstyled d-flex mb-0">
                            <li className="icons hover-effect">
                              <a href="https://www.linkedin.com/company/goklyn-pvt-ltd/" target="blank_">
                                <i
                                  className="fa-brands fa-linkedin-in mr-0"
                                  aria-hidden="true"
                                ></i>
                              </a>
                            </li>
                            <li className="icons hover-effect">
                              <a href="/#">
                                <i
                                  className="fa-brands fa-github"
                                  aria-hidden="true"
                                ></i>
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
                      </ul>
                    </nav>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
