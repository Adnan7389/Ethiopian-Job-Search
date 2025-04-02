import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { resetPassword } from '../../features/auth/authSlice';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    dispatch(resetPassword({ token, password: data.password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/login');
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          label="New Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;