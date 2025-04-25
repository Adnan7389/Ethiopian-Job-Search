import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { register } from "../../features/auth/authSlice";
import styles from "./Register.module.css";

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
  const [loading, setLoading] = useState(false);

  // Debug: Log Redux state changes
  useEffect(() => {
    console.log("Register: Redux state - status:", status, "error:", reduxError);
  }, [status, reduxError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    if (!formData.confirmPassword) errors.confirmPassword = "Confirm Password is required";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      console.log("Register: Submitting registration request:", formData);
      const result = await dispatch(register(formData)).unwrap();
      console.log("Register: Registration successful, navigating to /enter-code");
      navigate("/enter-code", { state: { email: result.email } });
    } catch (err) {
      console.log("Register: Registration failed, error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/role-selection");
  };

  if (!userType) {
    navigate("/role-selection");
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register as {userType === "employer" ? "Employer" : "Job Seeker"}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={formErrors.username}
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          required
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          required
        />
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          required
        />
        {reduxError && (
          <p className={styles.error} style={{ color: "red", margin: "10px 0" }}>
            {reduxError}
          </p>
        )}
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" disabled={loading || status === "loading"}>
            {loading || status === "loading" ? <LoadingSpinner /> : "Register"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
      <p className={styles.link}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;