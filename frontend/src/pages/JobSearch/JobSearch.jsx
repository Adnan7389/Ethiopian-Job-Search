import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs, fetchRecommendedJobs } from "../../features/job/jobSlice";
import JobCard from "../../components/JobCard/JobCard";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./JobSearch.module.css";
import { 
  FiSearch, 
  FiX, 
  FiBriefcase, 
  FiMapPin, 
  FiClock, 
  FiAward,
  FiFilter,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import { debounce } from "lodash";

const JobSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, recommendedJobs, status, error, recommendedStatus, recommendedError } = useSelector((state) => state.job);
  const { userType } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    location: "",
    job_type: "",
    experience_level: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Initial load of jobs
  useEffect(() => {
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        status: "open",
        includeArchived: false,
      })
    );
    if (userType === "job_seeker") {
      dispatch(fetchRecommendedJobs());
    }
  }, [dispatch, userType]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        search: filters.search.trim(),
        industry: filters.industry,
        location: filters.location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        status: "open",
        includeArchived: false,
      })
    );
  };

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      if (searchValue.trim()) {
        dispatch(
          fetchJobs({
            page: 1,
            limit: 10,
            search: searchValue.trim(),
            industry: filters.industry,
            location: filters.location,
            job_type: filters.job_type,
            experience_level: filters.experience_level,
            status: "open",
            includeArchived: false,
          })
        );
      }
    }, 500),
    [filters.industry, filters.location, filters.job_type, filters.experience_level]
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'search') {
      debouncedSearch(value);
    } else {
      dispatch(
        fetchJobs({
          page: 1,
          limit: 10,
          search: filters.search.trim(),
          industry: name === 'industry' ? value : filters.industry,
          location: name === 'location' ? value : filters.location,
          job_type: name === 'job_type' ? value : filters.job_type,
          experience_level: name === 'experience_level' ? value : filters.experience_level,
          status: "open",
          includeArchived: false,
        })
      );
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      industry: "",
      location: "",
      job_type: "",
      experience_level: "",
    });
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        status: "open",
        includeArchived: false,
      })
    );
    setShowFilters(false);
  };

  const handleJobClick = (slug) => {
    navigate(`/jobs/${slug}`);
  };

  const isValidRecommendedJob = (job) => {
    if (!job || !job.job) return false;
    const { job_id, slug, status, expires_at } = job.job;
    if (!job_id || !slug) return false;
    if (status !== 'open') return false;
    if (expires_at && new Date(expires_at) < new Date()) return false;
    return true;
  };

  const getValidRecommendedJobs = () => {
    if (!recommendedJobs || !Array.isArray(recommendedJobs)) return [];
    return recommendedJobs.filter(isValidRecommendedJob);
  };

  const getFilteredJobs = () => {
    if (!jobs || !Array.isArray(jobs)) return [];
    const recommendedJobIds = getValidRecommendedJobs().map(job => job.job.job_id);
    return jobs.filter(job => !recommendedJobIds.includes(job.job_id));
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== "");
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  const getActiveFilterNames = () => {
    const activeFilters = [];
    if (filters.search) activeFilters.push("Search");
    if (filters.industry) activeFilters.push("Industry");
    if (filters.location) activeFilters.push("Location");
    if (filters.job_type) activeFilters.push("Job Type");
    if (filters.experience_level) activeFilters.push("Experience");
    return activeFilters;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find Your Dream Job in Ethiopia</h1>
        <p className={styles.subtitle}>
          Browse through hundreds of job listings and find the perfect match for your skills
        </p>
      </header>

      {/* Search Form */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Job title, keywords, or company"
              className={styles.searchInput}
              aria-label="Search jobs"
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            className={styles.searchButton}
            disabled={status === "loading"}
          >
            <FiSearch className={styles.buttonIcon} />
            {status === "loading" ? "Searching..." : "Search"}
          </Button>
          <Button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            className={styles.filterToggle}
          >
            <FiFilter className={styles.buttonIcon} />
            Filters {hasActiveFilters() && `(${getActiveFilterCount()})`}
          </Button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label htmlFor="industry" className={styles.filterLabel}>
                  <FiBriefcase className={styles.inputIcon} /> Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  className={styles.filterSelect}
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
                <label htmlFor="location" className={styles.filterLabel}>
                  <FiMapPin className={styles.inputIcon} /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City or region"
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="job_type" className={styles.filterLabel}>
                  <FiClock className={styles.inputIcon} /> Job Type
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={filters.job_type}
                  onChange={handleFilterChange}
                  className={styles.filterSelect}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="experience_level" className={styles.filterLabel}>
                  <FiAward className={styles.inputIcon} /> Experience
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={filters.experience_level}
                  onChange={handleFilterChange}
                  className={styles.filterSelect}
                >
                  <option value="">All Levels</option>
                  <option value="entry-level">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div className={styles.filterActions}>
              <Button
                onClick={handleResetFilters}
                variant="text"
                className={styles.clearFiltersButton}
              >
                <FiX className={styles.buttonIcon} />
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Recommended Jobs Section */}
      {userType === "job_seeker" && (
        <section className={styles.recommendedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiAward className={styles.sectionIcon} />
              Recommended For You
            </h2>
            {getValidRecommendedJobs().length > 0 && (
              <span className={styles.sectionBadge}>
                {getValidRecommendedJobs().length} jobs
              </span>
            )}
          </div>

          {recommendedStatus === "loading" && (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p className={styles.loadingText}>Loading recommendations...</p>
            </div>
          )}

          {recommendedStatus === "failed" && (
            <div className={styles.errorCard}>
              <FiAlertCircle className={styles.errorIcon} />
              <h3 className={styles.errorTitle}>Unable to Load Recommendations</h3>
              <p className={styles.errorMessage}>
                {recommendedError || "We couldn't load your job recommendations. Please try again later."}
              </p>
              <Button
                onClick={() => dispatch(fetchRecommendedJobs())}
                variant="primary"
                className={styles.retryButton}
              >
                Try Again
              </Button>
            </div>
          )}

          {recommendedStatus === "succeeded" && (
            <>
              {getValidRecommendedJobs().length > 0 ? (
                <div className={styles.jobList}>
                  {getValidRecommendedJobs().map((recommendedJob) => (
                    <div 
                      key={recommendedJob.job.job_id}
                      className={styles.jobListItem}
                      onClick={() => handleJobClick(recommendedJob.job.slug)}
                    >
                      <JobCard job={recommendedJob.job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FiInfo className={styles.emptyStateIcon} />
                  <h3 className={styles.emptyStateTitle}>No recommendations yet</h3>
                  <p className={styles.emptyStateText}>
                    Complete your profile and apply for jobs to get personalized recommendations
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* All Jobs Section */}
      <section className={styles.jobsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FiBriefcase className={styles.sectionIcon} />
            {hasActiveFilters() ? "Filtered Jobs" : "All Jobs"}
          </h2>
          {status === "succeeded" && getFilteredJobs().length > 0 && (
            <span className={styles.sectionBadge}>
              {getFilteredJobs().length} jobs
            </span>
          )}
        </div>

        {status === "loading" && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p className={styles.loadingText}>
              {hasActiveFilters() ? "Filtering jobs..." : "Loading jobs..."}
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className={styles.errorCard}>
            <FiAlertCircle className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>Error Loading Jobs</h3>
            <p className={styles.errorMessage}>
              {error || "An error occurred while loading jobs. Please try again."}
            </p>
            <Button
              onClick={() => dispatch(fetchJobs({ page: 1, limit: 10 }))}
              variant="primary"
              className={styles.retryButton}
            >
              Try Again
            </Button>
          </div>
        )}

        {status === "succeeded" && getFilteredJobs().length === 0 && (
          <div className={styles.emptyState}>
            <FiInfo className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>No jobs found</h3>
            <p className={styles.emptyStateText}>
              {hasActiveFilters() 
                ? "No jobs match your current filters. Try adjusting your search criteria."
                : "No jobs available at the moment. Please check back later."}
            </p>
            {hasActiveFilters() && (
              <Button
                onClick={handleResetFilters}
                variant="secondary"
                className={styles.emptyStateButton}
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {status === "succeeded" && getFilteredJobs().length > 0 && (
          <div className={styles.jobList}>
            {getFilteredJobs().map((job) => (
              <div 
                key={job.job_id}
                className={styles.jobListItem}
                onClick={() => handleJobClick(job.slug)}
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default JobSearch;