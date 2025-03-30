import styles from './FormInput.module.css';

function FormInput({ label, name, type = 'text', register, error }) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
  );
}

export default FormInput;