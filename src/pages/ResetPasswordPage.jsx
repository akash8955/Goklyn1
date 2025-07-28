// import { useState } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const ResetPasswordPage = () => {
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { resetPasswordWithToken } = useAuth();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const token = searchParams.get('token');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       return setError('Passwords do not match');
//     }
    
//     if (!token) {
//       return setError('Invalid or expired reset link');
//     }
    
//     setLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       const result = await resetPasswordWithToken(token, password);
//       if (result.success) {
//         setMessage('Your password has been reset successfully. You can now log in with your new password.');
//         // Redirect to login after 3 seconds
//         setTimeout(() => {
//           navigate('/login');
//         }, 3000);
//       } else {
//         setError(result.message || 'Failed to reset password');
//       }
//     } catch (err) {
//       setError('An error occurred. Please try again.');
//       console.error('Password reset error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
//           <h2 className="text-center text-2xl font-bold text-gray-900">
//             Invalid Reset Link
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             The password reset link is invalid or has expired. Please request a new one.
//           </p>
//           <div className="mt-6 text-center">
//             <Link 
//               to="/forgot-password" 
//               className="font-medium text-indigo-600 hover:text-indigo-500"
//             >
//               Request New Reset Link
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Reset Your Password
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Please enter your new password below.
//           </p>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//             <span className="block sm:inline">{error}</span>
//           </div>
//         )}

//         {message ? (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
//             <span className="block sm:inline">{message}</span>
//           </div>
//         ) : (
//           <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//             <div className="rounded-md shadow-sm -space-y-px">
//               <div>
//                 <label htmlFor="password" className="sr-only">
//                   New Password
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   minLength="6"
//                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                   placeholder="New Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label htmlFor="confirm-password" className="sr-only">
//                   Confirm New Password
//                 </label>
//                 <input
//                   id="confirm-password"
//                   name="confirmPassword"
//                   type="password"
//                   required
//                   minLength="6"
//                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                   placeholder="Confirm New Password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 {loading ? 'Resetting Password...' : 'Reset Password'}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordPage;






// change to give same ui 


import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPasswordWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setOpenSnackbar(true);
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await resetPasswordWithToken(token, password);
      if (result.success) {
        setMessage(
          "Your password has been reset successfully. You can now log in with your new password."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(result.message || "Failed to reset password");
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setOpenSnackbar(true);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!token) {
    return (
      <Container
        component="main"
        maxWidth="xs"
        className="resetpassword-container py-5"
      >
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, width: "100%", textAlign: "center" }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              Invalid Reset Link
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The password reset link is invalid or has expired. Please request
              a new one.
            </Typography>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              color="primary"
              fullWidth
            >
              Request New Reset Link
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      className="resetpassword-container"
    >
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
          >
            Reset Your Password
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Please enter your new password below
          </Typography>

          {message ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LockOutlined sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <LockOutlined sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPasswordPage;
