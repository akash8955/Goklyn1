import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const UpdateProfileForm = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.updateMe({ username, email });
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};

export default UpdateProfileForm;
