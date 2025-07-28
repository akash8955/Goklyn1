import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

// Add error boundary for CSS loading errors
const handleCssError = (e) => {
  if (e?.target?.tagName?.toLowerCase() === 'link') {
    console.warn('Failed to load stylesheet:', e.target.href);
    e.target.disabled = true; // Prevent repeated failed requests
  }
};

// Initialize CSS error handling
if (typeof window !== 'undefined') {
  window.addEventListener('error', handleCssError, true);
}

const ApplyPage = () => {
    const { internshipId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resume: null,
    });
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch internship details
    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const response = await api.get(`/internships/${internshipId}`);
                setInternship(response.data);
            } catch (error) {
                console.error('Error fetching internship:', error);
                toast.error('Failed to load internship details');
                navigate('/career');
            } finally {
                setLoading(false);
            }
        };

        if (internshipId) {
            fetchInternship();
        } else {
            setLoading(false);
            navigate('/career');
        }
    }, [internshipId, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Check file type
        if (file.type !== 'application/pdf') {
            setMessage('Only PDF files are allowed.');
            setFormData({ ...formData, resume: null });
            return;
        }
        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
            setMessage('PDF file size must be 2MB or less.');
            setFormData({ ...formData, resume: null });
            return;
        }
        setMessage('');
        setFormData({ ...formData, resume: file });
    };

    const validateForm = () => {
        const { name, email, phone, resume } = formData;
        if (!name || !email || !phone || !resume) {
            setMessage('Please fill in all required fields.');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address.');
            return false;
        }
        
        // Basic phone validation (at least 10 digits)
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
            setMessage('Please enter a valid phone number (at least 10 digits).');
            return false;
        }
        
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (!formData.resume) {
            setMessage('Please upload your resume.');
            return;
        }
        setSubmitting(true);
        setMessage('Uploading resume...');

        try {
            // Step 1: Upload the resume file
            const resumeFormData = new FormData();
            resumeFormData.append('resume', formData.resume);
            
            let resumeUrl = '';
            
            try {
                console.log('Starting resume upload...');
                const uploadRes = await api.post('/upload/resume', resumeFormData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    },
                    timeout: 60000 // 60 second timeout for file uploads
                });
                
                console.log('Upload response:', uploadRes);
                
                // Handle the response from our updated upload endpoint
                if (uploadRes.data && uploadRes.data.success === true) {
                    if (uploadRes.data.url) {
                        resumeUrl = uploadRes.data.url;
                        console.log('Resume uploaded successfully:', resumeUrl);
                    } else {
                        console.error('Missing URL in successful response:', uploadRes.data);
                        throw new Error('Server did not return a valid file URL');
                    }
                } else if (uploadRes.data && uploadRes.data.error) {
                    // Handle explicit error from our endpoint
                    console.error('Upload error from server:', uploadRes.data.error);
                    throw new Error(uploadRes.data.error);
                } else {
                    console.error('Unexpected response format:', uploadRes.data);
                    throw new Error('Unexpected response from server');
                }
                
            } catch (uploadError) {
                console.error('Error details:', {
                    message: uploadError.message,
                    response: uploadError.response?.data,
                    status: uploadError.response?.status,
                    statusText: uploadError.response?.statusText,
                    stack: uploadError.stack
                });
                
                let errorMessage = 'Failed to upload resume. Please try again.';
                
                if (uploadError.response) {
                    // Server responded with an error
                    const { data, status } = uploadError.response;
                    if (data?.error) errorMessage = data.error;
                    else if (data?.message) errorMessage = data.message;
                    else if (status === 413) errorMessage = 'File is too large. Maximum size is 2MB.';
                    else if (status === 400) errorMessage = 'Invalid file format. Only PDF files are accepted.';
                    else if (status >= 500) errorMessage = 'Server error. Please try again later.';
                } else if (uploadError.request) {
                    // Request was made but no response received
                    errorMessage = 'No response from server. Please check your internet connection.';
                } else if (uploadError.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out. Please try again.';
                }
                
                throw new Error(errorMessage);
            }

            setMessage('Submitting application details...');

            // Step 2: Prepare application data with validation
            if (!resumeUrl || !resumeUrl.includes('cloudinary.com')) {
                throw new Error('Invalid resume URL. Please upload your resume again.');
            }

            const applicationData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                resume: resumeUrl, // Match backend expected field name
                internshipId,
            };

            console.log('Submitting application data:', {
                ...applicationData,
                resume: resumeUrl ? 'URL present' : 'MISSING URL',
                resumeUrl: undefined // Remove this field to avoid confusion
            });
            
            // Remove the resumeUrl field to avoid sending both resume and resumeUrl
            delete applicationData.resumeUrl;

            try {
                const response = await api.post('/applications', applicationData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (status) => status < 500, // Don't throw for 4xx errors
                });

                console.log('Application submission response:', response);

                if (response.status === 400) {
                    console.error('Validation error:', response.data);
                    throw new Error(response.data.msg || response.data.message || 'Invalid application data. Please check your information.');
                }

                if (response.status >= 200 && response.status < 300) {
                    // Success: Keep form disabled and redirect
                    setMessage('Application submitted successfully! Redirecting...');
                    toast.success('Application submitted successfully!');
                    setTimeout(() => navigate('/career'), 3000);
                } else {
                    throw new Error(response.data?.message || 'Failed to submit application');
                }
            } catch (appError) {
                console.error('Error submitting application:', {
                    message: appError.message,
                    response: appError.response?.data,
                    status: appError.response?.status,
                    statusText: appError.response?.statusText,
                    stack: appError.stack
                });
                
                let errorMessage = 'Could not submit application. Please try again.';
                
                if (appError.response) {
                    // Server responded with an error
                    const { data, status } = appError.response;
                    console.log('Error response data:', data);
                    if (data?.error) errorMessage = data.error;
                    else if (data?.msg) errorMessage = data.msg; // Check for 'msg' first
                    else if (data?.message) errorMessage = data.message;
                    else if (status === 400) errorMessage = 'Invalid application data. Please check your information.';
                    else if (status === 401) errorMessage = 'Please log in to submit an application.';
                    else if (status >= 500) errorMessage = 'Server error. Please try again later.';
                } else if (appError.request) {
                    // Request was made but no response received
                    errorMessage = 'No response from server. Please check your internet connection.';
                } else if (appError.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out. Please try again.';
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Application error:', error);
            const errorMsg = error.message || 'An unexpected error occurred. Please try again later.';
            setMessage(`Error: ${errorMsg}`);
            toast.error(errorMsg);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className="apply-section py-5" style={{ paddingTop: '150px' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading internship details...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!internship) {
        return (
            <section className="apply-section py-5" style={{ paddingTop: '150px' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 text-center">
                            <h2>Internship Not Found</h2>
                            <p>The internship you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                            <Link to="/career" className="btn btn-primary">Back to Internships</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="apply-section py-5" style={{ paddingTop: '150px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="card bg-dark text-white p-4 p-md-5 rounded shadow-lg">
                            <div className="card-body">
                                <h2 className="text-center text-primary mb-2">Apply for: {internship.title}</h2>
                                <p className="text-center mb-4">{internship.description}</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Full Name</label>
                                        <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Phone Number</label>
                                        <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="resume" className="form-label">Upload Resume (PDF)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="resume"
                                            name="resume"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                                            {submitting ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </form>
                                {message && (
                                    <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-4 text-center`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApplyPage;
