import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { login } from "../../features/auth/authSlice";
import styles from "./Login.module.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || "";
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
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

    try {
      await dispatch(login(formData)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setError(err || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          label="Email or Username"
          name="identifier"
          value={formData.identifier}
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
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <LoadingSpinner /> : "Login"}
        </Button>
      </form>
      <p className={styles.link}>
        Forgot your password? <Link to="/forgot-password">Reset it</Link>
      </p>
      <p className={styles.link}>
        Don't have an account? <Link to="/role-selection">Register</Link>
      </p>
    </div>
  );
}

export default Login;