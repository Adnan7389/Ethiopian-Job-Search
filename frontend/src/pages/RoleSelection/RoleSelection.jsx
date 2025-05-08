import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import styles from './RoleSelection.module.css';
import { setRole } from '../../features/auth/authSlice';
import { FiArrowLeft, FiUser, FiBriefcase, FiCheck } from 'react-icons/fi';

function RoleSelection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    dispatch(setRole(role));
    navigate('/register');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Button
            variant="text"
            onClick={handleBack}
            aria-label="Go back to previous page"
            icon={<FiArrowLeft />}
          >
            Back
          </Button>
          <h2 className={styles.title}>Join as...</h2>
          <p className={styles.subtitle}>Select your role to continue registration</p>
        </div>

        <div className={styles.roleGrid}>
          <button
            className={styles.roleCard}
            onClick={() => handleRoleSelect('job_seeker')}
            aria-label="Select Job Seeker role"
          >
            <div className={styles.roleIcon}>
              <FiUser />
            </div>
            <h3 className={styles.roleTitle}>Job Seeker</h3>
            <p className={styles.roleDescription}>
              Looking for your next opportunity? Create a profile and start applying.
            </p>
            <div className={styles.roleFeatures}>
              <span><FiCheck /> Apply to jobs</span>
              <span><FiCheck /> Save favorites</span>
              <span><FiCheck /> Get matched</span>
            </div>
            <div className={styles.selectButton}>Select</div>
          </button>

          <button
            className={styles.roleCard}
            onClick={() => handleRoleSelect('employer')}
            aria-label="Select Employer role"
          >
            <div className={styles.roleIcon}>
              <FiBriefcase />
            </div>
            <h3 className={styles.roleTitle}>Employer</h3>
            <p className={styles.roleDescription}>
              Hiring talent? Post jobs and find qualified candidates.
            </p>
            <div className={styles.roleFeatures}>
              <span><FiCheck /> Post jobs</span>
              <span><FiCheck /> Manage applicants</span>
              <span><FiCheck /> View analytics</span>
            </div>
            <div className={styles.selectButton}>Select</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;