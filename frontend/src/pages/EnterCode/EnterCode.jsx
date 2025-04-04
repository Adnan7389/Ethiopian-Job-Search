import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { verifyCode, resendCode, clearResendMessage } from "../../features/auth/authSlice";
import styles from "./EnterCode.module.css";

function EnterCode() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer in seconds
  const { resendStatus, resendError, resendMessage } = useSelector((state) => state.auth);

  // Handle cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clear resend messages after 5 seconds
  useEffect(() => {
    if (resendMessage || resendError) {
      const timeout = setTimeout(() => {
        dispatch(clearResendMessage());
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [resendMessage, resendError, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email not provided. Please register again.");
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      await dispatch(verifyCode({ email, code })).unwrap();
      navigate("/login", { state: { message: "Email verified successfully. Please log in." } });
    } catch (err) {
      setError(err || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return; // Prevent resend during cooldown

    try {
      await dispatch(resendCode(email)).unwrap();
      setResendCooldown(60); // Start 60-second cooldown
    } catch (err) {
      // Error is handled by Redux state (resendError)
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Enter Verification Code</h1>
      <p className={styles.message}>
        A 6-digit code has been sent to {email}. Please enter it below to verify your email.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          label="Verification Code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength="6"
          placeholder="123456"
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <LoadingSpinner /> : "Verify Code"}
        </Button>
      </form>
      <div className={styles.resendContainer}>
        <p>Didn't receive a code?</p>
        <Button
          onClick={handleResendCode}
          variant="secondary"
          disabled={resendCooldown > 0 || resendStatus === "loading"}
        >
          {resendCooldown > 0
            ? `Resend Code (${resendCooldown}s)`
            : resendStatus === "loading"
            ? "Resending..."
            : "Resend Code"}
        </Button>
        {resendMessage && <p className={styles.success}>{resendMessage}</p>}
        {resendError && <p className={styles.error}>{resendError}</p>}
      </div>
    </div>
  );
}

export default EnterCode;