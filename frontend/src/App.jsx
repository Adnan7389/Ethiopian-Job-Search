import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import EnterCode from './pages/EnterCode/EnterCode';
import EnterResetCode from './pages/EnterResetCode/EnterResetCode';
import JobSearch from './pages/JobSearch/JobSearch';
import PostJob from './pages/PostJob/PostJob';
import EditJob from './pages/EditJob/EditJob';
import EmployerDashboard from './pages/EmployerDashboard/EmployerDashboard';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import JobDetail from "./pages/JobDetail/JobDetail";
import JobApplication from "./pages/JobApplication/JobApplication";
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { initializeAuth } from './features/auth/authSlice';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

function PrivateRoute({ children, allowedRoles }) {
  const dispatch = useDispatch();
  const { token, userType, isVerified, status, error, hasInitialized } = useSelector((state) => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (hasInitialized || hasCheckedAuth) {
      setHasCheckedAuth(true);
      return;
    }

    dispatch(initializeAuth()).then(() => {
      setHasCheckedAuth(true);
    }).catch(() => {
      setHasCheckedAuth(true);
    });
  }, [dispatch, hasInitialized, hasCheckedAuth]);

  if (!hasCheckedAuth || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'failed') {
    return <Navigate to="/login" />;
  }

  const localToken = localStorage.getItem('token');
  const localUserType = localStorage.getItem('userType');
  const localIsVerified = localStorage.getItem('isVerified') === 'true';

  const effectiveToken = token || localToken;
  const effectiveUserType = userType || localUserType;
  const effectiveIsVerified = isVerified || localIsVerified;

  const isAuthenticated = effectiveToken && effectiveUserType && effectiveIsVerified;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(effectiveUserType)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/enter-reset-code" element={<EnterResetCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/enter-code" element={<EnterCode />} />
            <Route
              path="/job-search"
              element={<PrivateRoute><JobSearch /></PrivateRoute>}
            />
            <Route
              path="/jobs/:slug"
              element={<PrivateRoute><JobDetail /></PrivateRoute>}
            />
            <Route
              path="/jobs/:slug/apply"
              element={
                <PrivateRoute allowedRoles={["job_seeker"]}>
                  <JobApplication />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<PrivateRoute allowedRoles={["employer"]}><EmployerDashboard /></PrivateRoute>}
            >
              <Route path="post-job" element={<PrivateRoute allowedRoles={["employer"]}><PostJob /></PrivateRoute>} />
              <Route path="edit-job/:slug" element={<PrivateRoute allowedRoles={["employer"]}><EditJob /></PrivateRoute>} />
            </Route>
            <Route
              path="/notifications"
              element={<PrivateRoute><NotificationsPage /></PrivateRoute>}
            />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;