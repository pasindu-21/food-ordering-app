import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Paper, Stack, IconButton, InputAdornment, CircularProgress, Link,
} from '@mui/material';
import {
  Person as PersonIcon, Lock as LockIcon, Email as EmailIcon, Visibility, VisibilityOff, Store as StoreIcon,
} from '@mui/icons-material';
import { Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '../context/ColorModeContext';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useColorMode();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const loginMsg = location.state?.msg;

  const toggleView = () => {
    setIsSignIn((prev) => !prev);
    setError('');
    setValidationErrors({});
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setValidationErrors({ ...validationErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.email.includes('@')) errors.email = 'Invalid email format';
    // Removed strong password check for now
     //TODO: Add strong password validation later (e.g., length, uppercase, numbers, etc.)
    //if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!isSignIn && form.name.trim() === '') errors.name = 'Name is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const url = isSignIn ? '/api/auth/login' : '/api/auth/register';
    const payload = isSignIn ? { email: form.email, password: form.password } : form;

    try {
      const res = await axios.post(`http://localhost:5000${url}`, payload);
      console.log('API Response:', res.data);

      if (!isSignIn) {
        alert('Registered successfully! Please log in.');
        setIsSignIn(true);
        setForm({ ...form, name: '', password: '' });
      } else {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);
        console.log('Token Saved:', sessionStorage.getItem('token'));

        const userRole = res.data.user.role;
        console.log('Redirecting to role:', userRole);

        let redirectPath = '';
        if (userRole === 'admin') {
          redirectPath = '/admin-dashboard';
        } else if (userRole === 'owner') {
          redirectPath = '/owner-home';
        } else {
          redirectPath = '/user-home';
        }

        window.location.href = redirectPath;
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'dark' ? 'linear-gradient(-45deg, #1e1e1e 0%, #333 100%)' : 'linear-gradient(-45deg, #4EA685 0%, #57B894 100%)', // Smoother gradient
        overflow: 'hidden',
        position: 'relative',
        px: { xs: 2, sm: 0 }, // Responsive padding for mobile
      }}
    >
      <Paper
        elevation={8} // Increased elevation for better shadow
        sx={{
          width: '100%',
          maxWidth: { xs: '90%', sm: '28rem' }, // Responsive maxWidth
          p: { xs: 3, sm: 4 }, // Responsive padding
          borderRadius: 4,
          transition: 'transform 0.5s ease-in-out, opacity 0.3s',
          transform: isSignIn ? 'scale(1)' : 'scale(0.95)',
          opacity: isSignIn ? 1 : 0,
          position: 'absolute',
          zIndex: isSignIn ? 2 : 1,
          bgcolor: mode === 'dark' ? '#424242' : 'white',
          color: mode === 'dark' ? 'white' : 'black',
          '&:hover': { boxShadow: 6 }, // Hover effect
        }}
        role="form" // Accessibility
        aria-label={isSignIn ? 'Sign In Form' : 'Sign Up Form'}
      >
        {/* Sign In Form */}
        {isSignIn && (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sign In
            </Typography>
            {loginMsg && <Alert severity="warning" sx={{ mb: 2 }}>{loginMsg}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                value={form.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
                autoFocus // Accessibility improvement
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end" aria-label="toggle password visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                required
              />
              <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Stack>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <Link href="/forgot-password" underline="hover" color="primary">Forgot password?</Link> {/* New forgot password link */}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Don't have an account?{' '}
              <Button onClick={toggleView} color="primary" sx={{ p: 0 }}>
                Sign up here
              </Button>
            </Typography>
          </form>
        )}
      </Paper>

      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: { xs: '90%', sm: '28rem' },
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          transition: 'transform 0.5s ease-in-out, opacity 0.3s',
          transform: !isSignIn ? 'scale(1)' : 'scale(0.95)',
          opacity: !isSignIn ? 1 : 0,
          position: 'absolute',
          zIndex: !isSignIn ? 2 : 1,
          bgcolor: mode === 'dark' ? '#424242' : 'white',
          color: mode === 'dark' ? 'white' : 'black',
          '&:hover': { boxShadow: 6 },
        }}
        role="form"
        aria-label="Sign Up Form"
      >
        {/* Sign Up Form */}
        {!isSignIn && (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sign Up
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                variant="outlined"
                fullWidth
                value={form.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
                autoFocus
              />
              <TextField
                select
                label="Role"
                name="role"
                variant="outlined"
                fullWidth
                value={form.role}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreIcon />
                    </InputAdornment>
                  ),
                }}
                required
              >
                <option value="user">Student</option>
                <option value="owner">Vendor</option>
              </TextField>
              <TextField
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                fullWidth
                value={form.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end" aria-label="toggle password visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                required
              />
              <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Stack>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Button onClick={toggleView} color="primary" sx={{ p: 0 }}>
                Sign in here
              </Button>
            </Typography>
          </form>
        )}
      </Paper>

      {/* Background Animation Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100vh',
          width: '300vw',
          transform: isSignIn ? 'translate(0, 0)' : 'translate(100%, 0)',
          right: '50%',
          background: mode === 'dark' ? 'linear-gradient(-45deg, #333 0%, #555 100%)' : 'linear-gradient(-45deg, #4EA685 0%, #57B894 100%)',
          transition: '1s ease-in-out',
          zIndex: 0,
          boxShadow: 3,
          borderBottomRightRadius: 'max(50vw, 50vh)',
          borderTopLeftRadius: 'max(50vw, 50vh)',
        }}
      />
    </Box>
  );
};

export default AuthForm;

