import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import {
  fetchEmployerJobs,
  deleteJob,
  restoreJob,
  duplicateJob,
  setPage,
  setPageSize,
  setSearch,
  setFilters,
  setIncludeArchived,
  clearFilters,
} from "../../features/job/jobSlice";
import { logout } from "../../features/auth/authSlice";
import styles from "./EmployerDashboard.module.css";

function EmployerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    jobs,
    total,
    currentPage,
    totalPages,
    pageSize,
    search,
    filters = { job_type: '', industry: '', experience_level: '', status: '', date_posted: '' }, // Added default value
    includeArchived,
    status,
    error,
  } = useSelector((state) => state.job);
  const { userType } = useSelector((state) => state.auth) || { userType: null };

  const [confirmAction, setConfirmAction] = useState(null);

  // Extract individual filter values with defaults to avoid undefined errors
  const {
    job_type = '',
    industry = '',
    experience_level = '',
    status: filterStatus = '',
    date_posted = '',
  } = filters;

  // Memoize the params to avoid unnecessary re-renders
  const fetchParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search,
      job_type,
      industry,
      experience_level,
      status: filterStatus,
      date_posted,
      includeArchived,
    }),
    [
      currentPage,
      pageSize,
      search,
      job_type,
      industry,
      experience_level,
      filterStatus,
      date_posted,
      includeArchived,
    ]
  );

  console.log("EmployerDashboard state:", { jobs, status, error, userType });

  useEffect(() => {
    if (!userType) {
      console.log("No userType, redirecting to login...");
      navigate("/login");
    } else if (userType !== "employer") {
      console.log("User is not an employer, redirecting to home...");
      navigate("/");
    } else {
      console.log("Fetching employer jobs...");
      dispatch(fetchEmployerJobs(fetchParams)).catch((err) => {
        if (err.message === "No token provided" || err.message === "Invalid token") {
          dispatch(logout());
          navigate("/login");
        }
      });
    }
  }, [dispatch, userType, navigate, fetchParams]);

  const handleDelete = (jobId) => {
    setConfirmAction({ type: "delete", jobId });
  };

  const handleRestore = (jobId) => {
    setConfirmAction({ type: "restore", jobId });
  };

  const confirmActionHandler = async () => {
    if (confirmAction.type === "delete") {
      await dispatch(deleteJob(confirmAction.jobId)).unwrap();
    } else if (confirmAction.type === "restore") {
      await dispatch(restoreJob(confirmAction.jobId)).unwrap();
      dispatch(fetchEmployerJobs(fetchParams));
    }
    setConfirmAction(null);
  };

  const handleDuplicate = async (jobId) => {
    await dispatch(duplicateJob(jobId)).unwrap();
    dispatch(fetchEmployerJobs(fetchParams));
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handlePageSizeChange = (e) => {
    dispatch(setPageSize(parseInt(e.target.value)));
  };

  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  const handleIncludeArchivedChange = (e) => {
    dispatch(setIncludeArchived(e.target.checked));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  if (status === "loading" && !jobs.length) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Employer Dashboard</h1>
      <Outlet />
      {window.location.pathname === "/dashboard" && (
        <>
          <Button
            onClick={() => navigate("post-job")}
            variant="primary"
            className={styles.postButton}
          >
            Post New Job
          </Button>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <select name="job_type" value={job_type} onChange={handleFilterChange}>
              <option value="">All Job Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>
            <select name="industry" value={industry} onChange={handleFilterChange}>
              <option value="">All Industries</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Legal">Legal</option>
              <option value="Construction">Construction</option>
              <option value="Other">Other</option>
            </select>
            <select name="experience_level" value={experience_level} onChange={handleFilterChange}>
              <option value="">All Experience Levels</option>
              <option value="entry-level">Entry-Level</option>
              <option value="mid-level">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
            <select name="status" value={filterStatus} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="paused">Paused</option>
            </select>
            <select name="date_posted" value={date_posted} onChange={handleFilterChange}>
              <option value="">All Dates</option>
              <option value="last_24_hours">Last 24 Hours</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={handleIncludeArchivedChange}
              />
              Show Archived Jobs
            </label>
            <Button onClick={handleClearFilters} variant="secondary">Clear Filters</Button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Job Type</th>
                    <th>Industry</th>
                    <th>Experience Level</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.job_id}>
                      <td>{job.title}</td>
                      <td>{job.status}</td>
                      <td>{job.job_type}</td>
                      <td>{job.industry}</td>
                      <td>{job.experience_level}</td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td>
                        <Button
                          onClick={() => navigate(`edit-job/${job.slug}`)}
                          variant="primary"
                          className={styles.actionButton}
                        >
                          Edit
                        </Button>
                        {job.is_archived ? (
                          <Button
                            onClick={() => handleRestore(job.job_id)}
                            variant="secondary"
                            className={styles.actionButton}
                          >
                            Restore
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleDelete(job.job_id)}
                              variant="danger"
                              className={styles.actionButton}
                            >
                              Delete
                            </Button>
                            <Button
                              onClick={() => handleDuplicate(job.job_id)}
                              variant="secondary"
                              className={styles.actionButton}
                            >
                              Duplicate
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <select value={pageSize} onChange={handlePageSizeChange}>
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </>
          )}
          {confirmAction && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <p>Are you sure you want to {confirmAction.type} this job?</p>
                <Button onClick={confirmActionHandler} variant="primary">Yes</Button>
                <Button onClick={() => setConfirmAction(null)} variant="secondary">No</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployerDashboard;