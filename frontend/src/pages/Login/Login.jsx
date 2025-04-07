import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, initializeAuthSuccess } from '../../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';
import styles from './Login.module.css';
import Button from '../../components/Button/Button';
import FormInput from '../../components/FormInput/FormInput';
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, userType, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Only clear field-specific errors, not general errors
    if (formErrors[name] && name !== 'general') {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.identifier.trim()) errors.identifier = 'Email or username is required';
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
    await dispatch(login(formData));
  };

  useEffect(() => {
    if (status === 'succeeded') {
      if (!token || !userType) return;
  
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decoded.exp < currentTime) {
          setFormErrors({ general: 'Your session has expired. Please login again.' });
          return;
        }
  
        dispatch(initializeAuthSuccess({
          token,
          userType,
          userId: localStorage.getItem('userId'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
          resume_url: localStorage.getItem('resume_url') || '',
          isVerified: true,
        }));
  
        navigate(userType === 'employer' ? '/dashboard' : '/job-search');
      } catch (err) {
        setFormErrors({ general: 'Invalid authentication token. Please try again.' });
      }
    }
  
    if (status === 'failed') {
      console.log('Login failed with error:', error);
      let errorMessage = 'An error occurred during login. Please try again.';
      let errorType = 'error';
  
      if (error) {
        const errorLower = error.toLowerCase();
        if (errorLower.includes('suspended')) {
          errorMessage = 'Your account has been suspended. Please contact our support team for assistance.';
          errorType = 'suspended';
        } else if (errorLower.includes('verify')) {
          errorMessage = 'Please verify your email before logging in.';
          errorType = 'warning';
        } else if (errorLower.includes('invalid credentials')) {
          errorMessage = 'Invalid email/username or password';
        } else if (errorLower.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorLower.includes('network error')) {
          errorMessage = 'Network connection failed. Please check your internet.';
        } else {
          errorMessage = error;
        }
      }
  
      setFormErrors({ general: errorMessage, type: errorType });
    }
  }, [status, token, userType, error, dispatch, navigate]);
  

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {formErrors.general && (
          <div className={`${styles.alert} ${styles[formErrors.type || 'error']}`}>
            <FiAlertCircle className={styles.alertIcon} />
            <div className={styles.alertContent}>
              <p>{formErrors.general}</p>
              {formErrors.type === 'suspended' && (
                <div className={styles.supportInfo}>
                  <p>Contact our support team:</p>
                  <a href="mailto:support@example.com" className={styles.supportLink}>
                    support@example.com
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <FormInput
            type="text"
            name="identifier"
            label="Email or Username"
            value={formData.identifier}
            onChange={handleChange}
            error={formErrors.identifier}
            icon={<FiMail />}
            autoComplete="username"
          />

          <FormInput
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            icon={<FiLock />}
            autoComplete="current-password"
            rightIcon={
              showPassword ? (
                <FiEyeOff 
                  onClick={() => setShowPassword(false)} 
                  className={styles.passwordToggle}
                />
              ) : (
                <FiEye 
                  onClick={() => setShowPassword(true)} 
                  className={styles.passwordToggle}
                />
              )
            }
          />

          <div className={styles.forgotPassword}>
            <button 
              type="button" 
              onClick={() => navigate('/forgot-password')}
              className={styles.textButton}
            >
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            disabled={status === 'loading'}
            fullWidth
            icon={status === 'loading' ? null : <FiArrowRight />}
          >
            {status === 'loading' ? (
              <>
                <LoadingSpinner small /> Logging in...
              </>
            ) : 'Login'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.registerPrompt}>
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={() => navigate('/role-selection')}
            className={styles.textButton}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;