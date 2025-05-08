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
    // Clear error when user starts typing
    if (formErrors[name]) {
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
    if (status === 'succeeded' && userType && token) {
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
    } else if (status === 'failed') {
      // Parse the error message to display it properly
      let errorMessage = error;
      try {
        if (error.includes('401')) {
          errorMessage = 'Invalid email/username or password';
        } else if (error.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.includes('Network Error')) {
          errorMessage = 'Network connection failed. Please check your internet.';
        }
      } catch (e) {
        errorMessage = error || 'Login failed. Please try again.';
      }
      setFormErrors({ general: errorMessage });
    }
  }, [status, userType, token, navigate, dispatch, error]);

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Login to access your account</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {formErrors.general && (
            <div className={styles.errorBanner} role="alert">
              <FiAlertCircle className={styles.errorIcon} />
              <span>{formErrors.general}</span>
            </div>
          )}

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