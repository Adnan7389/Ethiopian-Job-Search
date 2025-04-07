import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { register } from "../../features/auth/authSlice";
import styles from "./Register.module.css";
import { FiArrowLeft, FiUser, FiMail, FiLock, FiCheck, FiX } from "react-icons/fi";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userType, status, error: reduxError } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: userType || "job_seeker",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Filter out "Token not Found" errors
  const filteredError = submitError || (reduxError && !reduxError.includes("Token not Found") ? reduxError : null);

  useEffect(() => {
    if (!userType) {
      navigate("/role-selection");
    }
  }, [userType, navigate]);

  useEffect(() => {
    // Validate password match in real-time
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const result = await dispatch(register(formData)).unwrap();
      navigate("/enter-code", { state: { email: result.email } });
    } catch (err) {
      console.error("Registration error:", err);
      setSubmitError(err);
    }
  };

  const handleCancel = () => {
    navigate("/role-selection");
  };

  if (!userType) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Button
            variant="text"
            onClick={handleCancel}
            icon={<FiArrowLeft />}
            aria-label="Go back to role selection"
          >
            Back
          </Button>
          <h1 className={styles.title}>
            Register as {userType === "employer" ? "an Employer" : "a Job Seeker"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {filteredError && (
            <div className={styles.errorBanner} role="alert">
              <FiX />
              <span>{filteredError}</span>
            </div>
          )}

          <FormInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            required
            icon={<FiUser />}
            autoComplete="username"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
            icon={<FiMail />}
            autoComplete="email"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
            icon={<FiLock />}
            autoComplete="new-password"
          />
          <div className={styles.passwordHint}>Password must be at least 8 characters long</div>

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
            icon={<FiLock />}
            autoComplete="new-password"
          />

          {passwordMatch !== null && (
            <div className={`${styles.passwordMatch} ${passwordMatch ? styles.match : styles.noMatch}`}>
              {passwordMatch ? (
                <>
                  <FiCheck /> Passwords match
                </>
              ) : (
                <>
                  <FiX /> Passwords don't match
                </>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              disabled={status === "loading"}
              fullWidth
            >
              {status === "loading" ? (
                <>
                  <LoadingSpinner small /> Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        <div className={styles.loginPrompt}>
          Already have an account?{" "}
          <Link to="/login" className={styles.loginLink}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;