import React, { useState } from 'react';
import api from '../../api';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        emailaddress: '',
        phone: '',
        msg: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');

        try {
            const response = await api.post('/contact', formData);

            if (response.status === 200) {
                setStatus('Message sent successfully!');
                setFormData({ fullname: '', emailaddress: '', phone: '', msg: '' });
            } else {
                setStatus(`Error: ${response.data.message}`);
            }
        } catch (error) {
            setStatus(error.response?.data?.message || 'Error: Could not send message.');
        }
    };

    return (
        <div>
            <section className="banner-section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner-section-content">
                                <h1 className="text-white" data-aos="fade-up" data-aos-duration="2000">Contact Us</h1>
                                <p className="text-white" data-aos="fade-right" data-aos-duration="2000">Have questions? Interested in joining our programs or collaborating on a project? We’d love to hear from you!</p>
                                <div className="btn_wrapper" data-aos="fade-up" data-aos-duration="2000">
                                    <span> Home </span><i className="fa-solid fa-angles-right" aria-hidden="true"></i><span className="sub_span">Contact</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="banner_image position-relative">
                                <figure className="banner_main_image mb-0 left_right_shape">
                                    <img src="/assets/newImages/contact.jpeg" alt="" style={{ borderRadius: '45px', width: '100%', objectFit: 'contain' }} />
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


            <section className="contact_info_section position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12 col-sm-12 col-xs-12">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="contact_info_content">
                                        <h2>Contact Info</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="row" data-aos="fade-up">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="contact_info_box hover-effect">
                                        <figure className="mb-0">
                                            <img src="/assets/images/location.png" alt="" className="img-fluid hover-effect"/>
                                        </figure>
                                        <div className="contact_info_box_content_wrapper">
                                            <h5>Location:</h5>
                                            <p className="mb-0">Jaipur</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="contact_info_box hover-effect">
                                        <figure className="mb-0">
                                            <img src="/assets/images/email.png" alt="" className="img-fluid hover-effect"/>
                                        </figure>
                                        <div className="contact_info_box_content_wrapper">
                                            <h5>Email Us:</h5>
                                            <p className="mb-0"><a href="mailto: hr@goklyn.com" className="text-decoration-none">hr@goklyn.in</a></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="contact_info_box hover-effect">
                                        <figure className="mb-0">
                                            <img src="/assets/images/phone.png" alt="" className="img-fluid hover-effect"/>
                                        </figure>
                                        <div className="contact_info_box_content_wrapper">
                                            <h5>Phone:</h5>
                                            <p className="mb-0"><a href="/#" className="text-decoration-none">+91 9024466472</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7 col-md-12 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-duration="2000">
                            <div className="contact_info_form_content">
                                <h4>Send us a Message</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="form-group mb-0">
                                                <input type="text" name="fullname" id="name" className="form-control" placeholder="Name:" value={formData.fullname} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="form-group mb-0">
                                                <input type="tel" name="phone" id="phonenum" className="form-control" placeholder="Phone:" value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="form-group mb-0">
                                                <input type="email" name="emailaddress" id="emailaddrs" className="form-control" placeholder="Email:" value={formData.emailaddress} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className=" form-group mb-0">
                                                <textarea rows="3" name="msg" id="comment" className="form-control" placeholder="Message:" value={formData.msg} onChange={handleChange} required></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="btn_wrapper">
                                        <button type="submit" name="get_started" id="started" className="default-btn">Submit Now<i className="fa-solid fa-angle-right"></i></button>
                                    </div>
                                    {status && <p className="mt-3">{status}</p>}
                                </form>
                            </div>
                        </div>
                    </div>
                    <figure className="contact_info_left_shape mb-0 position-absolute top_bottom_shape">
                        <img src="/assets/images/contact_info_left_shape.png" alt="" className="img-fluid"/>
                    </figure>
                </div>
            </section>
        </div>
    )
}

export default ContactUs