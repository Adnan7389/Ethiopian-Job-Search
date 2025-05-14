import React from 'react';
import styles from './FormInput.module.css';

function FormInput({ label, type = "text", error, hideLabel = false, icon, children, ...inputProps }) {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            className={`${styles.input} ${error ? styles.errorInput : ''} ${icon ? styles.inputWithIcon : ''}`}
          />
        );
      case 'select':
        return (
          <select
            {...inputProps}
            className={`${styles.input} ${error ? styles.errorInput : ''} ${icon ? styles.inputWithIcon : ''}`}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            type={type}
            {...inputProps}
            className={`${styles.input} ${error ? styles.errorInput : ''} ${icon ? styles.inputWithIcon : ''}`}
          />
        );
    }
  };

  return (
    <div className={styles.formGroup}>
      {!hideLabel && label && (
        <label htmlFor={inputProps.id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {renderInput()}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default FormInput;