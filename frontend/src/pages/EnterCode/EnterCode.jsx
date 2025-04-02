import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { verifyCode } from "../../features/auth/authSlice";
import styles from "./EnterCode.module.css";

function EnterCode() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    </div>
  );
}

export default EnterCode;