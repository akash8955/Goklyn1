// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const ForgotPasswordPage = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { resetPassword } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       const result = await resetPassword(email);
//       if (result.success) {
//         setMessage('Check your email for further instructions to reset your password.');
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

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Reset Password
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your email address and we'll send you a link to reset your password.
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
//                 <label htmlFor="email" className="sr-only">
//                   Email address
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                   placeholder="Email address"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 {loading ? 'Sending reset link...' : 'Send Reset Link'}
//               </button>
//             </div>
//           </form>
//         )}

//         <div className="text-sm text-center mt-4">
//           <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//             Back to Sign In
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordPage;



//  change to set ui

import { useState } from "react";
import { Link } from "react-router-dom";
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
import { EmailOutlined } from "@mui/icons-material";


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setMessage(
          "Check your email for further instructions to reset your password."
        );
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

  return (
    <Container
      component="main"
      maxWidth="xs"
      className="forgotpassword-container py-5"
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
            Reset Password
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <EmailOutlined sx={{ mr: 1, color: "action.active" }} />
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
                  "Send Reset Link"
                )}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Back to Sign In
              </Link>
            </Typography>
          </Box>
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

export default ForgotPasswordPage;
