import styles from './Button.module.css';

function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;