// src/components/AuthForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Divider } from '@mui/material';

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

  const handleSubmit = async e => {
    e.preventDefault();
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? form : { email: form.email, password: form.password };

    try {
      const res = await axios.post(`http://localhost:5000${url}`, payload);

      if (isRegister) {
        alert('Registered successfully! Please log in.');
        setIsRegister(false);
      } else {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);

        const userRole = res.data.user.role;

        // <<<<---- මෙන්න FIX එක: Role එක අනුව redirect කරනවා ---->>>>
        if (userRole === 'admin') {
          navigate('/admin-dashboard'); // Admin නම්, dashboard එකට යනවා
        } else if (userRole === 'owner') {
          navigate('/owner-home'); // Owner නම්, owner home එකට යනවා
        } else {
          navigate('/user-home'); // User නම්, user home එකට යනවා
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred.');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <motion.div
        className="card shadow-lg p-4"
        style={{ width: '100%', maxWidth: '400px' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-4">
          <h4>{isRegister ? 'Create Account' : 'Welcome Back'}</h4>
          {loginMsg && <Alert severity="warning" className="mt-2 py-2">{loginMsg}</Alert>}
          {error && <Alert severity="error" className="mt-2 py-2">{error}</Alert>}
        </div>

        <div className="d-flex justify-content-center mb-3">
          <div className="btn-group w-100">
            <button type="button" className={`btn ${isRegister ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setIsRegister(true); setError(''); }}>Register</button>
            <button type="button" className={`btn ${!isRegister ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setIsRegister(false); setError(''); }}>Login</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="mb-3">
                <label htmlFor="name" className="form-label"><FaUser className="me-2" /> Name</label>
                <input id="name" name="name" className="form-control" autoComplete="name" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label"><FaStore className="me-2" /> Role</label>
                <select id="role" name="role" className="form-select" onChange={handleChange} value={form.role}>
                  <option value="user">Normal User</option>
                  <option value="owner">Shop Owner</option>
                  {/* Register form එකේ Admin role එක පෙන්නන්නේ නැහැ. ඒක security measure එකක්. */}
                </select>
              </div>
            </>
          )}
          <div className="mb-3">
            <label htmlFor="email" className="form-label"><FaEnvelope className="me-2" /> Email</label>
            <input id="email" type="email" name="email" className="form-control" autoComplete="email" onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label"><FaLock className="me-2" /> Password</label>
            <input id="password" type="password" name="password" className="form-control" autoComplete={isRegister ? 'new-password' : 'current-password'} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-success w-100">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/shops')}>
          Browse Shops as a Guest
        </button>

      </motion.div>
    </div>
  );
};

export default AuthForm;
