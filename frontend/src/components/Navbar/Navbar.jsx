import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Ethio Jobs</Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/" className={styles.link}>Home</Link>
        </li>
        <li>
          <Link to="/job-search" className={styles.link}>Search Jobs</Link>
        </li>
        {token ? (
          <>
            <li>
              <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={styles.link}>Login</Link>
            </li>
            <li>
              <Link to="/role-selection" className={styles.link}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;