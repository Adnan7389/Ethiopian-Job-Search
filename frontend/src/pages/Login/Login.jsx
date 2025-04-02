import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { login } from "../../features/auth/authSlice";
import styles from './Login.module.css';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const onSubmit = (data) => {
    dispatch(login({ identifier: data.identifier, password: data.password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          label="Email or Username"
          name="identifier"
          register={register}
          error={errors.identifier}
          {...register('identifier', { required: 'Email or username is required' })}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          {...register('password', { required: 'Password is required' })}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Login'}
        </Button>
        <Link to="/forgot-password" className={styles.link}>Forgot Password?</Link>
      </form>
    </div>
  );
}

export default Login;