import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import styles from './RoleSelection.module.css';
import { setRole } from '../../features/auth/authSlice';

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
            variant="secondary"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            Back
          </Button>
          <h2 className={styles.title}>Choose Your Role</h2>
        </div>
        <div className={styles.buttonGroup}>
          <Button
            variant="primary"
            onClick={() => handleRoleSelect('job_seeker')}
            aria-label="Select Job Seeker role"
          >
            Job Seeker
          </Button>
          <Button
            variant="primary"
            onClick={() => handleRoleSelect('employer')}
            aria-label="Select Employer role"
          >
            Employer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;