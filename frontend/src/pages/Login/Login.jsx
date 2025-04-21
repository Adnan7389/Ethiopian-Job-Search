import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, initializeAuthSuccess } from '../../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';
import styles from './Login.module.css';
import Button from '../../components/Button/Button';
import FormInput from '../../components/FormInput/FormInput';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, userType, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.identifier) errors.identifier = 'Email or username is required';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    console.log("Login: Submitting login request:", formData);
    await dispatch(login(formData));
  };

  useEffect(() => {
    if (status === 'succeeded' && userType && token) {
      console.log("Login: Successful, token in localStorage:", localStorage.getItem('token'));

      // Decode token and validate client-side
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.error("Login: Token expired immediately after login");
          setFormErrors({ general: 'Token expired immediately after login' });
          return;
        }

        // Pre-populate auth state to avoid re-running initializeAuth
        dispatch(initializeAuthSuccess({
          token,
          userType,
          userId: localStorage.getItem('userId'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
          resume_url: localStorage.getItem('resume_url') || '',
          isVerified: true,
        }));

        console.log("Login: Navigating to dashboard. userType:", userType);
        navigate(userType === 'employer' ? '/dashboard' : '/job-search');
      } catch (err) {
        console.error("Login: Error decoding token:", err);
        setFormErrors({ general: 'Invalid token received' });
      }
    } else if (status === 'failed') {
      console.log("Login: Failed with error:", error);
      setFormErrors({ general: error || 'Login failed' });
    }
  }, [status, userType, token, navigate, dispatch]);

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          type="text"
          name="identifier"
          label="Email or Username"
          value={formData.identifier}
          onChange={handleChange}
          error={formErrors.identifier}
        />
        <FormInput
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
        />
        {formErrors.general && <p className={styles.error}>{formErrors.general}</p>}
        {error && !formErrors.general && <p className={styles.error}>{error}</p>}
        <Button type="submit" variant="primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className={styles.links}>
        <p>
          Forgot your password?{' '}
          <span onClick={() => navigate('/forgot-password')} className={styles.link}>
            Reset it here
          </span>
        </p>
        <p>
          Don’t have an account?{' '}
          <span onClick={() => navigate('/role-selection')} className={styles.link}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;