import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import JobDetail from './pages/JobDetail/JobDetail';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function PrivateRoute({ children, allowedRoles }) {
  const { token, userType, isVerified } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (!isVerified) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userType)) return <Navigate to="/dashboard" />;
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
              path="/dashboard"
              element={<PrivateRoute allowedRoles={["employer"]}><EmployerDashboard /></PrivateRoute>}
            />
            <Route
              path="/job-search"
              element={<PrivateRoute><JobSearch /></PrivateRoute>}
            />
            <Route
              path="/post-job"
              element={<PrivateRoute allowedRoles={["employer"]}><PostJob /></PrivateRoute>}
            />
            <Route
              path="/edit-job/:slug"
              element={<PrivateRoute allowedRoles={["employer"]}><EditJob /></PrivateRoute>}
            />
            <Route
              path="/jobs/:slug"
              element={<PrivateRoute><JobDetail /></PrivateRoute>}
            />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;