import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import EnterCode from './pages/EnterCode/EnterCode';
import JobSearch from './pages/JobSearch/JobSearch';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary

function PrivateRoute({ children }) {
  const { token, isVerified } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (!isVerified) return <Navigate to="/login" />;
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/enter-code" element={<EnterCode />} /> {/* New route */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><div>Dashboard</div></PrivateRoute>}
          />
          <Route
            path="/job-search"
            element={<PrivateRoute><JobSearch /></PrivateRoute>}
          />
        </Routes>
      </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;