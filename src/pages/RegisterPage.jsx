// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'sub-admin' // Default to sub-admin for security
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const { username, email, password, confirmPassword, role } = formData;

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       return setError('Passwords do not match');
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Include role in the registration data
//       const result = await register({ username, email, password, role });
      
      
//       if (result.success) {
//         navigate('/admin');
//       } else {
//         setError(result.message || 'Registration failed');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create an account');
//       console.error('Registration error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-5 px-4 sm:px-6 lg:px-8 py-5">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create an admin account
//           </h2>
//         </div>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//             <span className="block sm:inline">{error}</span>
//           </div>
//         )}
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="username" className="sr-only">
//                 Username
//               </label>
//               <input
//                 id="username"
//                 name="username"
//                 type="text"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Username"
//                 value={username}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
//                 Role
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 value={role}
//                 onChange={handleChange}
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               >
//                 <option value="sub-admin">Sub-Admin</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>
//             <div>
//               <label htmlFor="confirm-password" className="sr-only">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirm-password"
//                 name="confirmPassword"
//                 type="password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Confirm Password"
//                 value={confirmPassword}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </div>
          
//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;



import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleRegisterSuccess = () => {
    setIsLoading(false);
    // Navigation handled by useEffect
  };

  const handleRegisterError = (error) => {
    setIsLoading(false);
    setError(error.message || "Registration failed. Please try again.");
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      className="py-5 register-container  "
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
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 1, fontWeight: "bold" }}
          >
            Create Account
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Join us to get started
          </Typography>

          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={handleRegisterError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
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

export default RegisterPage;
