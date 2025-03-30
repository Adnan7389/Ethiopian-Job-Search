import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const { token, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect after logout (login page TBD)
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Ethio Jobs</Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/" className={styles.link}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/search" className={styles.link}>
            Search Jobs
          </Link>
        </li>
        {token ? (
          <>
            <li>
              <Link to="/dashboard" className={styles.link}>
                {userType === 'employer' ? 'Employer Dashboard' : 'My Applications'}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;