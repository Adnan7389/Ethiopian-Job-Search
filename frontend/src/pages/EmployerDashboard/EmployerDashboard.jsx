import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
  fetchApplicationsByJobId,
  clearApplications,
} from "../../features/job/jobSlice";
import NotificationPreview from '../../components/JobSeeker/NotificationPreview';
import { logout } from "../../features/auth/authSlice";
import styles from "./EmployerDashboard.module.css";

function EmployerDashboard() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    jobs,
    total,
    currentPage,
    totalPages,
    pageSize,
    search,
    filters = { job_type: "", industry: "", experience_level: "", status: "", date_posted: "" },
    includeArchived,
    applications,
    fetchingApplications,
    status,
    error,
  } = useSelector((state) => state.job);
  const { userType, status: authStatus, error: authError } = useSelector((state) => state.auth);

  const [confirmAction, setConfirmAction] = useState(null);
  const [localSearch, setLocalSearch] = useState(search);

  const fetchParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search,
      job_type: filters.job_type,
      industry: filters.industry,
      experience_level: filters.experience_level,
      status: filters.status,
      date_posted: filters.date_posted,
      includeArchived,
    }),
    [
      currentPage,
      pageSize,
      search,
      filters.job_type,
      filters.industry,
      filters.experience_level,
      filters.status,
      filters.date_posted,
      includeArchived,
    ]
  );

  useEffect(() => {
    if (authStatus !== "succeeded") {
      if (authStatus === "failed") {
        console.error("Auth failed:", authError);
        dispatch(logout());
        navigate("/login");
      }
      return;
    }
    if (userType !== "employer") {
      navigate("/");
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        await dispatch(fetchEmployerJobs(fetchParams)).unwrap();
      } catch (err) {
        if (isCancelled) return;
        console.error("Error fetching jobs:", err);
        if (
          err === "No token provided" ||
          err === "Invalid token" ||
          err === "Token has expired"
        ) {
          dispatch(logout());
          navigate("/login");
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
      dispatch(clearApplications());
    };
  }, [dispatch, userType, navigate, authStatus, authError, fetchParams]);

  useEffect(() => {
    if (authStatus !== "succeeded" || jobs.length === 0) return;

    let isCancelled = false;

    const fetchApplications = async () => {
      const jobsToFetch = jobs.filter(
        (job) =>
          applications[String(job.job_id)] === undefined &&
          !fetchingApplications.includes(String(job.job_id))
      );

      if (jobsToFetch.length === 0) return;

      try {
        await Promise.all(
          jobsToFetch.map((job) =>
            dispatch(fetchApplicationsByJobId(String(job.job_id))).unwrap().catch((err) => {
              console.error(`Error fetching applications for job ${job.job_id}:`, err);
              return [];
            })
          )
        );
      } catch (err) {
        if (isCancelled) return;
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, jobs, authStatus, applications, fetchingApplications]);

  const handleDelete = useCallback((jobId) => {
    setConfirmAction({ type: "delete", jobId });
  }, []);

  const handleRestore = useCallback((jobId) => {
    setConfirmAction({ type: "restore", jobId });
  }, [fetchParams]);

  const handleDuplicate = useCallback(
    async (jobId) => {
      try {
        await dispatch(duplicateJob(jobId)).unwrap();
        await dispatch(fetchEmployerJobs(fetchParams));
      } catch (err) {
        console.error("Error duplicating job:", err);
      }
    },
    [dispatch, fetchParams]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "delete") {
        await dispatch(deleteJob(confirmAction.jobId)).unwrap();
        const updatedApplications = { ...applications };
        delete updatedApplications[String(confirmAction.jobId)];
      } else if (confirmAction.type === "restore") {
        await dispatch(restoreJob(confirmAction.jobId)).unwrap();
        await dispatch(fetchEmployerJobs(fetchParams));
      }
    } catch (err) {
      console.error(`Error performing ${confirmAction.type}:`, err);
    } finally {
      setConfirmAction(null);
    }
  }, [confirmAction, dispatch, fetchParams, applications]);

  const handleCancelAction = useCallback(() => {
    setConfirmAction(null);
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const handlePageSizeChange = useCallback(
    (e) => {
      dispatch(setPageSize(parseInt(e.target.value)));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    dispatch(setSearch(localSearch));
    dispatch(setPage(1));
  }, [dispatch, localSearch]);

  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch(setFilters({ [name]: value }));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handleIncludeArchivedChange = useCallback(
    (e) => {
      dispatch(setIncludeArchived(e.target.checked));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    setLocalSearch("");
    dispatch(clearFilters());
    dispatch(setPage(1));
  }, [dispatch]);

  const handlePostNewJob = useCallback(() => {
    navigate("post-job");
  }, [navigate]);

  const handleViewApplications = useCallback(
    (jobId) => {
      navigate(`/dashboard/job/${jobId}/applicants`);
    },
    [navigate]
  );

  const handleEditJob = useCallback(
    (slug) => {
      navigate(`edit-job/${slug}`);
    },
    [navigate]
  );

  if (authStatus === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Employer Dashboard</h1>
        <Button
          onClick={handlePostNewJob}
          variant="primary"
          className={styles.postButton}
          aria-label="Post a new job"
        >
          Post New Job
        </Button>
      </header>

      <div className={styles.notificationWidget}>
        <NotificationPreview />
        <button
          onClick={() => navigate('/notifications')}
          className={styles.viewAllLink}
          aria-label="View all notifications"
        >
          View all notifications →
        </button>
      </div>

      <Outlet />

      {location.pathname === "/dashboard" && (
        <>
          <div className={styles.filters}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={localSearch}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                className={styles.searchInput}
                aria-label="Search jobs"
              />
              <Button onClick={handleSearchSubmit} aria-label="Submit search">
                Search
              </Button>
            </div>
            
            <select
              name="job_type"
              value={filters.job_type}
              onChange={handleFilterChange}
              aria-label="Filter by job type"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>
            
            <select
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
              aria-label="Filter by industry"
            >
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
            
            <select
              name="experience_level"
              value={filters.experience_level}
              onChange={handleFilterChange}
              aria-label="Filter by experience level"
            >
              <option value="">All Experience Levels</option>
              <option value="entry-level">Entry-Level</option>
              <option value="mid-level">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
            
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              aria-label="Filter by job status"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="paused">Paused</option>
            </select>
            
            <select
              name="date_posted"
              value={filters.date_posted}
              onChange={handleFilterChange}
              aria-label="Filter by date posted"
            >
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
                aria-label="Include archived jobs"
              />
              Show Archived Jobs
            </label>
            
            <Button onClick={handleClearFilters} variant="secondary" aria-label="Clear all filters">
              Clear Filters
            </Button>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          {status === "loading" && jobs.length === 0 ? (
            <div className={styles.flexCenter}>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.flexCenter}>
              <p>No jobs found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Job Type</th>
                      <th>Industry</th>
                      <th>Experience</th>
                      <th>Created At</th>
                      <th>Applications</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const jobApplications = applications[String(job.job_id)];
                      const isFetching = fetchingApplications.includes(String(job.job_id));
                      return (
                        <tr key={job.job_id}>
                          <td data-label="Title">{job.title}</td>
                          <td data-label="Status">
                            <span className={`${styles.statusBadge} ${styles[job.status]}`}>
                              {job.status}
                              {job.is_archived && " (Archived)"}
                            </span>
                          </td>
                          <td data-label="Job Type">{job.job_type}</td>
                          <td data-label="Industry">{job.industry}</td>
                          <td data-label="Experience">{job.experience_level}</td>
                          <td data-label="Created At">
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td data-label="Applications">
                            {isFetching || jobApplications === undefined ? (
                              "Loading..."
                            ) : (
                              <>
                                {jobApplications?.length || 0}
                                <Button
                                  onClick={() => handleViewApplications(job.job_id)}
                                  variant="secondary"
                                  className={styles.actionButton}
                                  aria-label={`View applicants for ${job.title}`}
                                >
                                  View
                                </Button>
                              </>
                            )}
                          </td>
                          <td data-label="Actions">
                            <div className={styles.actionButtons}>
                              <Button
                                onClick={() => handleEditJob(job.slug)}
                                variant="primary"
                                className={styles.actionButton}
                                aria-label={`Edit ${job.title}`}
                              >
                                Edit
                              </Button>
                              {job.is_archived ? (
                                <Button
                                  onClick={() => handleRestore(job.job_id)}
                                  variant="secondary"
                                  className={styles.actionButton}
                                  aria-label={`Restore ${job.title}`}
                                >
                                  Restore
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => handleDelete(job.job_id)}
                                    variant="danger"
                                    className={styles.actionButton}
                                    aria-label={`Delete ${job.title}`}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    onClick={() => handleDuplicate(job.job_id)}
                                    variant="secondary"
                                    className={styles.actionButton}
                                    aria-label={`Duplicate ${job.title}`}
                                  >
                                    Duplicate
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages} (Total: {total} jobs)
                </span>
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
                
                <select 
                  value={pageSize} 
                  onChange={handlePageSizeChange}
                  aria-label="Items per page"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </>
          )}

          {confirmAction && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h3>Confirm Action</h3>
                  <p>
                    Are you sure you want to {confirmAction.type} this job?
                    {confirmAction.type === "delete" && (
                      <span> This action cannot be undone.</span>
                    )}
                  </p>
                  <div className={styles.modalButtons}>
                    <Button 
                      onClick={handleConfirmAction} 
                      variant={confirmAction.type === "delete" ? "danger" : "primary"}
                      aria-label={`Confirm ${confirmAction.type}`}
                    >
                      Yes, {confirmAction.type}
                    </Button>
                    <Button 
                      onClick={handleCancelAction} 
                      variant="secondary"
                      aria-label="Cancel action"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployerDashboard;