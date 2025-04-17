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
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Role</h2>
      </div>
      <div className={styles.buttonGroup}>
        <Button variant="primary" onClick={() => handleRoleSelect('job_seeker')}>
          Job Seeker
        </Button>
        <Button variant="primary" onClick={() => handleRoleSelect('employer')}>
          Employer
        </Button>
      </div>
      <Button variant="secondary" onClick={handleBack}>
          Back
      </Button>
    </div>
  );
}

export default RoleSelection;