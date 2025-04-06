import React, { useState } from "react";
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
  const { userType, status, error: reduxError } = useSelector((state) => state.auth); // Retrieve userType from Redux
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: userType || "job_seeker", // Fallback to job_seeker if userType is not set
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await dispatch(register(formData)).unwrap();
      navigate("/enter-code", { state: { email: result.email } });
    } catch (err) {
      setError(err || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  // If userType is not set, redirect to role selection
  if (!userType) {
    navigate('/role-selection');
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
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        {reduxError && <p className={styles.error}>{reduxError}</p>}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <LoadingSpinner /> : "Register"}
        </Button>
      </form>
      <p className={styles.link}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;