import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { verifyResetCode } from "../../features/auth/authSlice";
import styles from "./EnterResetCode.module.css";

function EnterResetCode() {
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
      setError("Email not provided. Please start the reset process again.");
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      await dispatch(verifyResetCode({ email, code })).unwrap();
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Enter Reset Code</h1>
      <p className={styles.message}>
        A 6-digit code has been sent to {email}. Please enter it below to reset your password.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          label="Reset Code"
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

export default EnterResetCode;