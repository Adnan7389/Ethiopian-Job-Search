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
  updateJobStatus,
} from "../../features/job/jobSlice";
import NotificationPreview from '../../components/JobSeeker/NotificationPreview';
import { logout } from "../../features/auth/authSlice";
import styles from "./EmployerDashboard.module.css";
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCopy, 
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiEye,
  FiArchive
} from "react-icons/fi";
import { io } from "socket.io-client";

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
  const [showFilters, setShowFilters] = useState(false);

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

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Socket: No token found for socket connection");
      return;
    }

    // Remove the /api part since Socket.IO should connect to the base URL not API path
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    console.log('Connecting to Socket.IO at:', baseUrl);
    
    const socket = io(baseUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('jobs-updated', ({ updatedJobIds, newStatus }) => {
      console.log('Socket received jobs-updated:', { updatedJobIds, newStatus });
      updatedJobIds.forEach(jobId => {
        dispatch(updateJobStatus({ jobId, status: newStatus }));
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Polling fallback in case WebSocket fails
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchEmployerJobs(fetchParams));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, fetchParams]);

  // Existing data fetching logic
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

  // Existing applications fetching logic
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

  // All existing handler functions remain exactly the same
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
      navigate(`/dashboard/edit-job/${slug}`);
    },
    [navigate]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  if (authStatus === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>💼</span>
            Employer Dashboard
          </h1>
          <div className={styles.headerActions}>
            <Button
              onClick={handlePostNewJob}
              variant="primary"
              className={styles.postButton}
              aria-label="Post a new job"
            >
              <FiPlus className={styles.buttonIcon} />
              Post New Job
            </Button>
          </div>
        </div>
        <p className={styles.subtitle}>Manage your job postings and applications</p>
      </header>

      <div className={styles.notificationWidget}>
        <div className={styles.notificationHeader}>
          <FiBell className={styles.notificationIcon} />
          <h3>Notifications</h3>
        </div>
        <NotificationPreview />
        <button
          onClick={() => navigate('/notifications')}
          className={styles.viewAllLink}
          aria-label="View all notifications"
        >
          View all notifications <FiChevronRight className={styles.linkIcon} />
        </button>
      </div>

      <Outlet />

      {location.pathname === "/dashboard" && (
        <>
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search jobs by title, location, or keywords..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                  className={styles.searchInput}
                  aria-label="Search jobs"
                />
              </div>
              <Button 
                onClick={handleSearchSubmit} 
                variant="primary" 
                className={styles.searchButton}
                aria-label="Submit search"
              >
                <FiSearch className={styles.buttonIcon} />
                Search
              </Button>
              <Button 
                onClick={toggleFilters}
                variant="secondary"
                className={styles.filterToggle}
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                <FiFilter className={styles.buttonIcon} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {showFilters && (
              <div className={styles.filterPanel}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Job Type</label>
                  <select
                    name="job_type"
                    value={filters.job_type}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                    aria-label="Filter by job type"
                  >
                    <option value="">All Job Types</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Industry</label>
                  <select
                    name="industry"
                    value={filters.industry}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
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
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Experience</label>
                  <select
                    name="experience_level"
                    value={filters.experience_level}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                    aria-label="Filter by experience level"
                  >
                    <option value="">All Levels</option>
                    <option value="entry-level">Entry-Level</option>
                    <option value="mid-level">Mid-Level</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <select 
                    name="status" 
                    value={filters.status} 
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                    aria-label="Filter by job status"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="paused">Paused</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Date Posted</label>
                  <select
                    name="date_posted"
                    value={filters.date_posted}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                    aria-label="Filter by date posted"
                  >
                    <option value="">All Dates</option>
                    <option value="last_24_hours">Last 24 Hours</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="last_30_days">Last 30 Days</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={handleIncludeArchivedChange}
                      className={styles.checkboxInput}
                      aria-label="Include archived jobs"
                    />
                    <span className={styles.checkboxCustom}></span>
                    Show Archived Jobs
                  </label>
                </div>

                <Button 
                  onClick={handleClearFilters} 
                  variant="secondary" 
                  className={styles.clearFiltersButton}
                  aria-label="Clear all filters"
                >
                  <FiX className={styles.buttonIcon} />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className={styles.errorAlert} role="alert">
              <div className={styles.errorContent}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            </div>
          )}

          {status === "loading" && jobs.length === 0 ? (
            <div className={styles.loadingContainer}>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <h3>No jobs found</h3>
                <p>No jobs match your current search and filter criteria.</p>
                <Button 
                  onClick={handleClearFilters}
                  variant="primary"
                  className={styles.emptyStateButton}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.jobList}>
                {jobs.filter(job => job && job.job_id && job.slug).map((job) => {
                  const jobApplications = applications[String(job.job_id)];
                  const isFetching = fetchingApplications.includes(String(job.job_id));
                  const isArchived = job.is_archived;
                  
                  return (
                    <div 
                      key={job.job_id} 
                      className={`${styles.jobCard} ${isArchived ? styles.archived : ''}`}
                    >
                      <div className={styles.jobHeader}>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                        <div className={styles.jobMeta}>
                          <span className={`${styles.jobStatus} ${styles[job.status]}`}>
                            {job.status}
                            {isArchived && <FiArchive className={styles.archiveIcon} />}
                          </span>
                          <span className={styles.jobType}>{job.job_type}</span>
                          <span className={styles.jobIndustry}>{job.industry}</span>
                          <span className={styles.jobExperience}>{job.experience_level}</span>
                        </div>
                        <div className={styles.jobDate}>
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className={styles.jobDetails}>
                        <div className={styles.applicationsInfo}>
                          <div className={styles.applicationsCount}>
                            {isFetching || jobApplications === undefined ? (
                              <span>Loading applications...</span>
                            ) : (
                              <>
                                <strong>
                                  {jobApplications?.length || 0}
                                </strong> qualified applications
                              </>
                            )}
                          </div>
                          <Button
                            onClick={() => handleViewApplications(job.job_id)}
                            variant="secondary"
                            className={styles.actionButton}
                            aria-label={`View qualified applicants for ${job.title}`}
                          >
                            <FiEye className={styles.buttonIcon} />
                            View
                          </Button>
                        </div>

                        <div className={styles.jobActions}>
                          {job.slug && (
                          <Button
                            onClick={() => handleEditJob(job.slug)}
                            variant="primary"
                            className={styles.actionButton}
                            aria-label={`Edit ${job.title}`}
                          >
                            <FiEdit2 className={styles.buttonIcon} />
                            Edit
                          </Button>
                          )}
                          {isArchived ? (
                            <Button
                              onClick={() => handleRestore(job.job_id)}
                              variant="secondary"
                              className={styles.actionButton}
                              aria-label={`Restore ${job.title}`}
                            >
                              <FiRefreshCw className={styles.buttonIcon} />
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
                                <FiTrash2 className={styles.buttonIcon} />
                                Delete
                              </Button>
                              <Button
                                onClick={() => handleDuplicate(job.job_id)}
                                variant="secondary"
                                className={styles.actionButton}
                                aria-label={`Duplicate ${job.title}`}
                              >
                                <FiCopy className={styles.buttonIcon} />
                                Duplicate
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)}</strong> of <strong>{total}</strong> jobs
                </div>
                
                <div className={styles.paginationControls}>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                    className={styles.paginationButton}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className={styles.buttonIcon} />
                    Previous
                  </Button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                    className={styles.paginationButton}
                    aria-label="Next page"
                  >
                    Next
                    <FiChevronRight className={styles.buttonIcon} />
                  </Button>
                </div>
                
                <div className={styles.pageSizeSelector}>
                  <label htmlFor="pageSize" className={styles.pageSizeLabel}>Jobs per page:</label>
                  <select 
                    id="pageSize"
                    value={pageSize} 
                    onChange={handlePageSizeChange}
                    className={styles.pageSizeSelect}
                    aria-label="Items per page"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {confirmAction && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h3 className={styles.modalTitle}>
                    {confirmAction.type === "delete" ? (
                      <FiTrash2 className={styles.modalIcon} />
                    ) : (
                      <FiRefreshCw className={styles.modalIcon} />
                    )}
                    Confirm {confirmAction.type}
                  </h3>
                  <p className={styles.modalText}>
                    Are you sure you want to {confirmAction.type} this job?
                    {confirmAction.type === "delete" && (
                      <span className={styles.warningText}> This action cannot be undone.</span>
                    )}
                  </p>
                  <div className={styles.modalButtons}>
                    <Button 
                      onClick={handleConfirmAction} 
                      variant={confirmAction.type === "delete" ? "danger" : "primary"}
                      className={styles.modalButton}
                      aria-label={`Confirm ${confirmAction.type}`}
                    >
                      Yes, {confirmAction.type}
                    </Button>
                    <Button 
                      onClick={handleCancelAction} 
                      variant="secondary"
                      className={styles.modalButton}
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