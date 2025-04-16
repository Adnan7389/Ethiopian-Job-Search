import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.logo}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Ethio Jobs</Link>
        </div>
        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburger}></span>
        </button>
        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <li>
            <Link to="/" className={styles.link} onClick={() => setIsMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/job-search" className={styles.link} onClick={() => setIsMenuOpen(false)}>Search Jobs</Link>
          </li>
          {token ? (
            <>
              <li>
                <Link to="/dashboard" className={styles.link} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.logoutButton}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={styles.link} onClick={() => setIsMenuOpen(false)}>Login</Link>
              </li>
              <li>
                <Link to="/role-selection" className={styles.link} onClick={() => setIsMenuOpen(false)}>Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;