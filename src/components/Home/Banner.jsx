import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const Banner = () => {
    useEffect(() => {
      const btn = document.getElementById('readmore-btn');
      if (!btn) return;
      const handleScroll = () => {
        if (window.scrollY > 0) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      };
      window.addEventListener('scroll', handleScroll);
      // Run once in case already in view
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <>
            <figure className="banner_top_shape mb-0 position-absolute top_bottom_shape">
                <img src="/assets/images/banner_top_shape.png" alt="" className="img-fluid" />
            </figure>
            <figure className="banner_background_shape mb-0 position-absolute left_right_shape">
                <img src="/assets/images/banner_background_shape.png" alt="" />
            </figure>
            <section className="banner-section position-relative" style={{paddingTop : '100px'}}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-7 col-md-7 col-sm-12 col-12 pt-5" style={{paddingLeft : '40px'}}>
                            <div className="banner-section-content d-flex flex-column justify-content-center" style={{height:'100%', minHeight:'280px'}}>
    <h1 className='home-banner-heading' data-aos="fade-up" data-aos-duration="2000" style={{marginBottom:'24px'}}>Goklyn Technologies</h1>
    <div className="banner_content_wrapper d-flex align-items-center justify-content-center" style={{minHeight:'65px', marginBottom:'18px', marginLeft:'-110px'}}>
        <figure className="mb-0" style={{marginBottom:0, marginRight:'14px', display:'flex', alignItems:'center', height:'100%'}}>
            <img src="/assets/images/banner_white_line.png" alt="" className="img-fluid" style={{height:'58px', minWidth:'14px', objectFit:'contain', display:'block'}} />
        </figure>
        <p style={{marginBottom: 0, zIndex:2, position:'relative', borderRadius:'8px', maxWidth:'100%', wordBreak:'break-word', fontSize: '1.3rem', lineHeight:'1.2', textAlign:'left', fontWeight: 700, marginLeft: '0'}} className="text-white home-banner-para" data-aos="fade-right" data-aos-duration="2000">Inspired by wisdom, innovation and strength</p>
    </div>
    <div className="btn_wrapper" data-aos="fade-up" data-aos-duration="2000">
                                    <Link id="readmore-btn" className="text-decoration-none default-btn btn-size-18 hover-effect readmore_btn" to="/about-us">Read More<i className="fa-solid fa-angle-right"></i></Link>
                                    {/* <Link className="text-decoration-none default-btn-two btn-size-18 hover-effect" to="/about-us">Contact Us<i className="fa-solid fa-angle-right"></i></Link> */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-5 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape mt-3">
                                    <img src="/assets/newImages/home.jpg" alt=""  className="banner-img-responsive" style={{borderRadius:'45px',width:'650px', objectFit : 'contain', marginTop:'67px'}}/>
                                </figure>
                                <figure className="banner_image_top_shape mb-0 position-absolute">
                                    <img src="/assets/images/banner_image_top_shape.png" alt="" className="img-fluid" />
                                </figure>
                                <figure className="banner_image_bottom_shape mb-0 position-absolute top_bottom_shape">
                                    <img src="/assets/images/banner_image_bottom_shape.png" alt="" className="img-fluid" />
                                </figure>
                            </div>
                        </div>
                    </div>
                    {/* <figure className="banner_left_image mb-0 position-absolute left_right_shape">
                        <img src="/assets/images/banner_left_image.jpg" alt="" className="img-fluid" />
                    </figure> */}
                    {/* <a href="#footer_section" className="top-btn">
                        <figure className="mb-0 position-absolute">
                            <img src="/assets/images/scroll_down_image.png" alt="" className="img-fluid" />
                        </figure>
                    </a> */}
                </div>
            </section>
            <style>{`
            /* Animated Read More Button */
            #readmore-btn {
                opacity: 0;
                transform: translateY(40px) scale(1);
                transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1);
                will-change: opacity, transform;
            }
            #readmore-btn.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            #readmore-btn:hover, #readmore-btn:focus {
                transform: translateY(0) scale(1.08);
                box-shadow: 0 4px 24px 0 #2563eb66, 0 2px 6px 0 #1e40af33;
                outline: none;
            }

            @media (max-width: 991px) {
                .banner-section .row {
                    flex-direction: column-reverse !important;
                }
                .banner-section-content {
                    padding-left: 0 !important;
                    text-align: center;
                }
                .banner-img-responsive {
                    width: 90vw !important;
                    max-width: 340px !important;
                    margin: 0 auto 30px auto !important;
                    display: block;
                }
                .banner_content_wrapper p {
                    font-size: 0.98rem !important;
                    padding: 14px 8px 8px 8px !important;
                    margin-bottom: 10px !important;
                }
            }
            @media (max-width: 600px) {
                .banner-section-content h1 {
                    font-size: 1.5rem !important;
                }
                .banner_content_wrapper p {
                    font-size: 0.92rem !important;
                }
            }
            `}</style>
        </>
    )
}

export default Banner