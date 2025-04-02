import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { verifyEmail } from "../../features/auth/authSlice";
import styles from './VerifyEmail.module.css';

function VerifyEmail() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(verifyEmail(token)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/login');
      }
    });
  }, [dispatch, token, navigate]);

  return (
    <div className={styles.container}>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <p className={styles.message}>Verifying your email...</p>
      )}
    </div>
  );
}

export default VerifyEmail;