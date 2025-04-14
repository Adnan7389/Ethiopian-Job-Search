import React from 'react';
import styles from './FormInput.module.css';

function FormInput({ label, type = "text", error, ...inputProps }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        {...inputProps} // Spread all props from register (name, onChange, onBlur, ref)
        className={`${styles.input} ${error ? styles.errorInput : ''}`} // Add error styling
      />
      {error && <p className={styles.error}>{error}</p>} {/* Display error message */}
    </div>
  );
}

export default FormInput;