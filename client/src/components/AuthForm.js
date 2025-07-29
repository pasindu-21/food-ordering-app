// src/components/AuthForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaStore, FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert, Typography, Link, Box, Paper, Stack, TextField, Button,
  InputAdornment, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, Divider
} from '@mui/material';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');

  const loginMsg = location.state?.msg;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAuthModeChange = (event, newMode) => {
    if (newMode !== null) {
      setIsRegister(newMode);
      setError('');
    }
  };

  const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? form : { email: form.email, password: form.password };

    if (isRegister && !isStrongPassword(form.password)) {
      setError('Password must be at least 8 characters long, with uppercase, lowercase, number, and special character.');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000${url}`, payload);

      if (isRegister) {
        alert('Registered successfully! Please log in.');
        setIsRegister(false);
      } else {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);

        const userRole = res.data.user.role;
        if (userRole === 'admin') navigate('/admin-dashboard');
        else if (userRole === 'owner') navigate('/owner-home');
        else navigate('/user-home');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred.');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  };

  // FIXED: Redirect to backend OAuth endpoints
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
      position: 'relative',
      p: 2,
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: '420px', borderRadius: 3 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Typography>

            {loginMsg && <Alert severity="warning">{loginMsg}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <ToggleButtonGroup
              value={isRegister}
              exclusive
              onChange={handleAuthModeChange}
              fullWidth
            >
              <ToggleButton value={true}>Register</ToggleButton>
              <ToggleButton value={false}>Login</ToggleButton>
            </ToggleButtonGroup>

            {isRegister && (
              <>
                <TextField
                  name="name"
                  label="Name"
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FaUser /></InputAdornment>,
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={form.role}
                    label="Role"
                    onChange={handleChange}
                    startAdornment={<InputAdornment position="start"><FaStore /></InputAdornment>}
                  >
                    <MenuItem value="user">Normal User</MenuItem>
                    <MenuItem value="owner">Shop Owner</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <TextField
              name="email"
              type="email"
              label="Email"
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaEnvelope /></InputAdornment>,
              }}
            />
            <TextField
              name="password"
              type="password"
              label="Password"
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaLock /></InputAdornment>,
              }}
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              {isRegister ? 'Register' : 'Login'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', pt: 1 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/shops')}
                sx={{ color: 'text.secondary', textDecoration: 'underline' }}
              >
                or browse as a guest
              </Link>
            </Typography>

            <Divider>or continue with</Divider>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FaGoogle />}
                onClick={handleGoogleLogin}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FaFacebook />}
                onClick={handleFacebookLogin}
              >
                Facebook
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AuthForm;

