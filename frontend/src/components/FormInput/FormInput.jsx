import React from 'react';
import styles from './FormInput.module.css';

function FormInput({ label, name, type = "text", value, onChange, required, maxLength, placeholder }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}

export default FormInput;