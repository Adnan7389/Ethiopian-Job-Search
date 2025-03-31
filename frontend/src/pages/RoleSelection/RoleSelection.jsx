import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import styles from './RoleSelection.module.css';
import { setRole } from '../../store/authSlice';

function RoleSelection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    dispatch(setRole(role));
    navigate('/register');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Choose Your Role</h2>
      <div className={styles.buttonGroup}>
        <Button onClick={() => handleRoleSelect('job_seeker')}>Job Seeker</Button>
        <Button onClick={() => handleRoleSelect('employer')}>Employer</Button>
      </div>
    </div>
  );
}

export default RoleSelection;