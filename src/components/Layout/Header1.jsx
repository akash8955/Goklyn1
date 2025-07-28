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
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-3">
              <div className="logo-header">
                <Link to="/">
                  <img src="/assets/images/logo-1.png" alt="..." height="60" />
                </Link>
              </div>
            </div>
            <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6">
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
                          className={`dropdown-item ${path === "/about-us" ? "active" : ""
                            }`}
                        >
                          about
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/our-team"
                          className={`dropdown-item nav-link ${path === "/Our-team" ? "active" : ""
                            }`}
                        >
                          Our Team
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="#"
                          className={`dropdown-item nav-link ${path === "#" ? "active" : ""
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
                      className={`nav-link ${path === "/services" ? "active" : ""
                        }`}
                    >
                      services
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/portfolio"
                      className={`nav-link ${path === "/portfolio" ? "active" : ""
                        }`}
                    >
                      Projects
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      to="/contact-us"
                      className={`nav-link ${path === "/contact-us" ? "active" : ""
                        }`}
                    >
                      contact us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-3 col-sm-3">
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
                        <Link to="/">
                          <img
                            src="/assets/images/logo-1.png"
                            alt="..."
                            height="60"
                          />
                        </Link>
                      </div>
                      <ul className="menubar">
                        <li className="nav-item">
                          <Link
                            to="/"
                            className={`nav-link ${path === "/" ? "active" : ""
                              }`}
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
                          className={`dropdown-item ${path === "/about-us" ? "active" : ""
                            }`}
                        >
                          about
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/our-team"
                          className={`dropdown-item nav-link ${path === "/Our-team" ? "active" : ""
                            }`}
                        >
                          Our Team
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="#"
                          className={`dropdown-item nav-link ${path === "#" ? "active" : ""
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
                            className={`nav-link ${path === "/services" ? "active" : ""
                              }`}
                          >
                            services
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
                            Projects
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            to="/contact-us"
                            className={`nav-link ${path === "/contact-us" ? "active" : ""
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
                              <Link>Careers</Link>
                            </li>
                          </ul>
                        </div>
                        <div className="dsfg">
                          <ul className="list-unstyled d-flex mb-0">
                            <li className="icons hover-effect">
                              <a href="#">
                                <i
                                  className="fa-brands fa-linkedin-in mr-0"
                                  aria-hidden="true"
                                ></i>
                              </a>
                            </li>
                            <li className="icons hover-effect">
                              <a href="#">
                                <i
                                  className="fa-brands fa-github"
                                  aria-hidden="true"
                                ></i>
                              </a>
                            </li>
                            <li className="icons hover-effect">
                              <a href="#">
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
