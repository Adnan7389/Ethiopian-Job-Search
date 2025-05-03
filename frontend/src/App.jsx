import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar/Navbar";
import RoleSelection from "./pages/RoleSelection/RoleSelection";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import JobSeekerDashboard from './pages/JobSeekerDashboard/JobSeekerDashboard';
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import EnterCode from "./pages/EnterCode/EnterCode";
import EnterResetCode from "./pages/EnterResetCode/EnterResetCode";
import JobSearch from "./pages/JobSearch/JobSearch";
import PostJob from "./pages/PostJob/PostJob";
import EditJob from "./pages/EditJob/EditJob";
import EmployerDashboard from "./pages/EmployerDashboard/EmployerDashboard";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import JobDetail from "./pages/JobDetail/JobDetail";
import JobApplication from "./pages/JobApplication/JobApplication";
import MyApplications from './pages/MyApplications/MyApplications';
import ApplicantsPage from "./pages/ApplicantsPage/ApplicantsPage";
import Profile from "./components/Profile/Profile";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { initializeAuth } from "./features/auth/authSlice";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

// 🧩 ADD THESE:
import { initSocket } from "./services/socket";
import { receiveNotification } from "./features/notification/notificationSlice";
import { store } from "./store";

function PrivateRoute({ children, allowedRoles }) {
  const { token, userType, isVerified, status, hasInitialized } = useSelector((state) => state.auth);

  if (!hasInitialized || status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "failed") {
    return <Navigate to="/login" />;
  }

  const localToken = localStorage.getItem("token");
  const localUserType = localStorage.getItem("userType");
  const localIsVerified = localStorage.getItem("isVerified") === "true";

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
  const dispatch = useDispatch();
  const { token, userType, isVerified, hasInitialized, status } = useSelector((state) => state.auth);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ INIT AUTH ON LOAD
  useEffect(() => {
    if (hasInitialized || authChecked) {
      setAuthChecked(true);
      return;
    }

    dispatch(initializeAuth())
      .then(() => {
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, [dispatch, hasInitialized, authChecked]);

  // ✅ INIT SOCKET.IO WHEN LOGGED IN
  useEffect(() => {
    if (token && userType && isVerified) {
      const socket = initSocket();

      if (!socket) return;

      socket.on("notification", (notification) => {
        store.dispatch(receiveNotification(notification));
        toast.info(notification.message);
      });

      return () => {
        socket.off("notification");
        // socket.disconnect();
      };
    }
  }, [token, userType, isVerified]);

  if (!authChecked || status === "loading") {
    return <LoadingSpinner />;
  }

  if (location.pathname === "/" && token && userType && isVerified) {
    if (userType === "job_seeker") {
      return <Navigate to="/job-search" />;
    } else if (userType === "employer") {
      return <Navigate to="/dashboard" />;
    }
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/enter-reset-code" element={<EnterResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/enter-code" element={<EnterCode />} />
          <Route path="/job-search" element={<PrivateRoute><JobSearch /></PrivateRoute>} />
          <Route path="/jobs/:slug" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
          <Route
            path="/jobs/:slug/apply"
            element={<PrivateRoute allowedRoles={["job_seeker"]}><JobApplication /></PrivateRoute>}
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {userType === 'employer' ? <EmployerDashboard /> : <JobSeekerDashboard />}
              </PrivateRoute>
            }
           >
            <Route path="post-job" element={<PrivateRoute allowedRoles={["employer"]}><PostJob /></PrivateRoute>} />
            <Route path="edit-job/:slug" element={<PrivateRoute allowedRoles={["employer"]}><EditJob /></PrivateRoute>} />
            <Route path="/dashboard/job/:jobId/applicants" element={<ApplicantsPage />} />
          </Route>
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/my-applications" element={<PrivateRoute allowedRoles={["job_seeker"]}><MyApplications /></PrivateRoute>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  );
}

export default App;