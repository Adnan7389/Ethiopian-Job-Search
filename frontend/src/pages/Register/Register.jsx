import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { register } from '../../store/authSlice';
import styles from './Register.module.css';

function Register() {
  const { register: formRegister, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedRole, loading, error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    dispatch(register({ ...data, user_type: selectedRole })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/login');
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Register as {selectedRole === 'job_seeker' ? 'Job Seeker' : 'Employer'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          label="Username"
          name="username"
          register={formRegister}
          error={errors.username}
          {...formRegister('username', { required: 'Username is required' })}
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          register={formRegister}
          error={errors.email}
          {...formRegister('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          register={formRegister}
          error={errors.password}
          {...formRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
        />
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={formRegister}
          error={errors.confirmPassword}
          {...formRegister('confirmPassword', {
            required: 'Confirm password is required',
            validate: (value) => value === watch('password') || 'Passwords do not match'
          })}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Register'}
        </Button>
      </form>
    </div>
  );
}

export default Register;