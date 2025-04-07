import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { forgotPassword } from "../../features/auth/authSlice";
import styles from "./ForgotPassword.module.css";

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await dispatch(forgotPassword(email)).unwrap();
      setMessage("A reset code has been sent to your email.");
      setTimeout(() => {
        navigate("/enter-reset-code", { state: { email } });
      }, 2000);
    } catch (err) {
      // Extract the error message from the API response
      const errorMessage = err?.message || err || "Failed to send reset code. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Forgot Password</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <LoadingSpinner /> : "Send Reset Code"}
        </Button>
      </form>
    </div>
  );
}

export default ForgotPassword;