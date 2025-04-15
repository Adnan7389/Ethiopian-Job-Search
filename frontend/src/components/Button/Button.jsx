import styles from './Button.module.css';

function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button' }) {
  const handleClick = (e) => {
    // Only prevent default for non-submit buttons
    if (type !== 'submit') {
      e.preventDefault();
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;