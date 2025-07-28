import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import authService from '../services/authService';
import styles from "./ForgetPassword.module.css";


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement actual API call to send OTP
      await authService.forgotPassword(email);
      setStep(2);
      setResendDisabled(true);
      setCountdown(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [resetToken, setResetToken] = useState('');

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Verifying OTP for email:', email);
      
      // Log the OTP being sent (for debugging)
      console.log('OTP being verified:', otp);
      
      const response = await authService.verifyOTP(email, otp);
      
      // Log the full response for debugging
      console.log('OTP verification response:', response);
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server: Missing token');
      }
      
      console.log('OTP verification successful, token received:', response.token);
      
      // Save the token from the response
      setResetToken(response.token);
      setStep(3);
    } catch (err) {
      console.error('Error in handleVerifyOTP:', {
        message: err.message,
        stack: err.stack,
        email,
        otp
      });
      
      // Check for specific error messages from the server
      const errorMessage = err.message.includes('expired') 
        ? 'The OTP has expired. Please request a new one.'
        : err.message || 'Invalid OTP. Please try again.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Resetting password with token:', resetToken);
      
      const response = await authService.resetPassword(resetToken, newPassword, confirmPassword);
      
      console.log('Password reset successful:', response);
      setMessage('Your password has been reset successfully!');
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    try {
      setIsLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setResendDisabled(true);
      setCountdown(30);
      setMessage('A new OTP has been sent to your email.');
      
      // Clear any previous OTP
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Email input
        return (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="form-group" style={{ padding: "1rem" }}>
              <label
                htmlFor="email"
                className={`form-label ${styles.forgetLabel}`}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${styles.forgetInput}`}
                placeholder="Enter your email address"
                disabled={isLoading}
                required
                
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full .btn"
              disabled={isLoading}
              style={{
                width: "100%",
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        );

      case 2: // OTP verification
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="form-group">
              <label
                htmlFor="otp"
                className={`form-label ${styles.forgetLabel}`}
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={`form-input text-center text-2xl tracking-widest ${styles.forgetInput}`}
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                disabled={isLoading}
                required
              />
              <div className="text-sm text-gray-600 mt-2">
                We've sent a 6-digit OTP to {email}
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled || isLoading}
                className="text-primary-600 hover:underline text-sm mt-2 disabled:opacity-50 pt-5"
              >
                {resendDisabled ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        );

      case 3: // New password
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="form-group">
              <label
                htmlFor="newPassword"
                className={`form-label ${styles.forgetLabel}`}
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`form-input ${styles.forgetInput}`}
                placeholder="Enter new password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="confirmPassword"
                className={`form-label ${styles.forgetLabel}`}
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`form-input ${styles.forgetInput}`}
                placeholder="Confirm new password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        );

      case 4: // Success
        return (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Password Reset Successful!</h3>
            <p className="text-gray-600 mb-6">
              {message || 'Your password has been successfully reset. You can now log in with your new password.'}
            </p>
            <Link
              to="/login"
              className="btn-primary inline-block px-6 py-2"
            >
              Back to Login
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? "Forgot Password"
          : step === 2
            ? "Verify OTP"
            : step === 3
              ? "Reset Password"
              : "Success"
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
              aria-label="Close error message"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {message && !error && step !== 4 && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          <p>{message}</p>
        </div>
      )}

      {renderStep()}

      {step === 1 && (
        <div className="text-center text-sm mt-6 " style={{ padding: "1rem" }}>
          <span className="text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </span>
        </div>
      )}

      {step === 2 && (
        <div className="text-center text-sm mt-6" style={{ padding: "1rem" }}>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-primary-600 hover:underline"
          >
            ← Back to email
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center text-sm mt-6" style={{ padding: "1rem" }}>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="text-primary-600 hover:underline"
          >
            ← Back to OTP
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
