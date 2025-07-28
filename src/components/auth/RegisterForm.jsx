import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useForm from "../../hooks/useForm";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  PersonOutline,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";

const validationSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  role: Yup.string().required("Role is required"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

const RegisterForm = ({ onSuccess, onError, isLoading, setIsLoading }) => {
  const { register } = useAuth();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    getCheckboxProps,
    isSubmitting,
    setSubmitting,
    setFieldError,
  } = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: "sub-admin",
      agreeTerms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setSubmitting(true);

        const { username, email, password, passwordConfirm, role } = values;

        const result = await register({ username, email, password, passwordConfirm, role });

        if (result.success) {
          if (onSuccess) onSuccess(result);
        } else {
          const errorMessage =
            result.error || "Registration failed. Please try again.";
          if (onError) onError(errorMessage);
          setFieldError("email", errorMessage);
        }
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        if (onError) onError(errorMessage);
        setFieldError("email", errorMessage);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        mx: "auto",
      }}
      noValidate
    >
      <TextField
        {...getFieldProps("username")}
        label="Username"
        type="text"
        autoComplete="username"
        margin="normal"
        fullWidth
        InputProps={{
          startAdornment: (
            <PersonOutline sx={{ mr: 1, color: "action.active" }} />
          ),
        }}
        error={touched.username && Boolean(errors.username)}
        helperText={touched.username && errors.username}
      />

      <TextField
        {...getFieldProps("email")}
        label="Email Address"
        type="email"
        autoComplete="email"
        margin="normal"
        fullWidth
        InputProps={{
          startAdornment: (
            <EmailOutlined sx={{ mr: 1, color: "action.active" }} />
          ),
        }}
        error={touched.email && Boolean(errors.email)}
        helperText={touched.email && errors.email}
      />

      <TextField
        {...getFieldProps("password")}
        label="Password"
        type="password"
        autoComplete="new-password"
        margin="normal"
        fullWidth
        InputProps={{
          startAdornment: (
            <LockOutlined sx={{ mr: 1, color: "action.active" }} />
          ),
        }}
        error={touched.password && Boolean(errors.password)}
        helperText={touched.password && errors.password}
      />

      <TextField
        {...getFieldProps("passwordConfirm")}
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        margin="normal"
        fullWidth
        InputProps={{
          startAdornment: (
            <LockOutlined sx={{ mr: 1, color: "action.active" }} />
          ),
        }}
        error={touched.passwordConfirm && Boolean(errors.passwordConfirm)}
        helperText={touched.passwordConfirm && errors.passwordConfirm}
      />

      <FormControl fullWidth margin="normal" error={touched.role && Boolean(errors.role)}>
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          label="Role"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="sub-admin">Sub-Admin</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            {...getCheckboxProps("agreeTerms")}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{" "}
            <Link to="/terms" style={{ color: "primary.main" }}>
              Terms and Conditions
            </Link>
          </Typography>
        }
        sx={{ mt: 1 }}
      />
      {touched.agreeTerms && errors.agreeTerms && (
        <Typography color="error" variant="body2" sx={{ mt: -1, ml: 2 }}>
          {errors.agreeTerms}
        </Typography>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isSubmitting || isLoading}
        sx={{ mt: 2, mb: 2 }}
      >
        {isSubmitting || isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Create Account"
        )}
      </Button>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "none" }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
