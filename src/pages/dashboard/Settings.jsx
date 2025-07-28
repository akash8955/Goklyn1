import React, { useState } from 'react';

const DashboardSettings = () => {
  const [formData, setFormData] = useState({
    siteName: 'My Dashboard',
    email: 'admin@example.com',
    timezone: 'UTC+05:30',
    notifications: true,
    theme: 'light'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">Settings</h2>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="siteName" className="form-label">Site Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="siteName" 
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Admin Email</label>
              <input 
                type="email" 
                className="form-control" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="timezone" className="form-label">Timezone</label>
              <select 
                className="form-select" 
                id="timezone" 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
              >
                <option value="UTC+05:30">(UTC+05:30) India Standard Time</option>
                <option value="UTC">(UTC) Coordinated Universal Time</option>
                <option value="UTC-05:00">(UTC-05:00) Eastern Time</option>
              </select>
            </div>
            
            <div className="mb-3 form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="notifications" 
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="notifications">
                Enable email notifications
              </label>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Theme</label>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="theme" 
                  id="lightTheme" 
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="lightTheme">
                  Light
                </label>
              </div>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="theme" 
                  id="darkTheme" 
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="darkTheme">
                  Dark
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
