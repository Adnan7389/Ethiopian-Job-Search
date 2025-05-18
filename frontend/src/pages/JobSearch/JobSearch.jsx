import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs, fetchRecommendedJobs } from "../../features/job/jobSlice";
import JobCard from "../../components/JobCard/JobCard";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./JobSearch.module.css";
import { FiSearch, FiX, FiBriefcase, FiMapPin, FiClock, FiAward, FiInfo } from "react-icons/fi";
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
    // Show loading state immediately
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

  // Add debounced search for better performance
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
    
    // If it's the search input, use debounced search
    if (name === 'search') {
      debouncedSearch(value);
    } else {
      // For other filters, search immediately
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
    // Reset and fetch jobs with default filters
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        status: "open",
        includeArchived: false,
      })
    );
  };

  const handleJobClick = (slug) => {
    navigate(`/jobs/${slug}`);
  };

  // Validate recommended job
  const isValidRecommendedJob = (job) => {
    if (!job || !job.job) return false;
    
    const { job_id, slug, status, expires_at } = job.job;
    
    // Check if job has required fields
    if (!job_id || !slug) return false;
    
    // Check if job is open and not expired
    if (status !== 'open') return false;
    if (expires_at && new Date(expires_at) < new Date()) return false;
    
    return true;
  };

  // Get valid recommended jobs
  const getValidRecommendedJobs = () => {
    if (!recommendedJobs || !Array.isArray(recommendedJobs)) return [];
    return recommendedJobs.filter(isValidRecommendedJob);
  };

  // Filter out recommended jobs from the main job list
  const getFilteredJobs = () => {
    if (!jobs || !Array.isArray(jobs)) return [];
    const recommendedJobIds = getValidRecommendedJobs().map(job => job.job.job_id);
    return jobs.filter(job => !recommendedJobIds.includes(job.job_id));
  };

  // Add a function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== "");
  };

  // Add a function to get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  // Add a function to get active filter names
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
          <div className={styles.searchInput}>
            <FiSearch className={styles.searchIcon} />
            <FormInput
              name="search"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Job title, keywords, or company"
              aria-label="Search jobs"
              hideLabel
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            className={styles.searchButton}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Searching..." : "Search Jobs"}
          </Button>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterHeader}>
            <h3 className={styles.filterTitle}>
              <FiBriefcase className={styles.filterIcon} /> Filter Jobs
            </h3>
            {hasActiveFilters() && (
              <div className={styles.activeFilters}>
                <span className={styles.activeFilterCount}>
                  {getActiveFilterCount()} {getActiveFilterCount() === 1 ? 'filter' : 'filters'} active
                </span>
                <Button
                  type="button"
                  variant="text"
                  onClick={handleResetFilters}
                  icon={<FiX />}
                  className={styles.clearFiltersButton}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          
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
              <FormInput
                name="location"
                type="text"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City or region"
                hideLabel
                
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
        </div>
      </form>

      {/* Recommended Jobs Section (Job Seekers Only) */}
      {userType === "job_seeker" && (
        <section className={styles.recommendedSection}>
          <h2 className={styles.recommendedTitle}>Recommended Jobs for You</h2>
          {recommendedStatus === "loading" && (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p className={styles.loadingText}>Loading recommendations...</p>
            </div>
          )}
          {recommendedStatus === "failed" && (
            <div className={styles.errorCard}>
              <h3 className={styles.errorTitle}>Unable to Load Recommendations</h3>
            <p className={styles.errorMessage}>
                {recommendedError || "We couldn't load your job recommendations. Please try again later."}
            </p>
              <Button
                onClick={() => dispatch(fetchRecommendedJobs())}
                variant="primary"
                className={styles.retryButton}
              >
                Retry
              </Button>
            </div>
          )}
          {recommendedStatus === "succeeded" && (
            <>
              {getValidRecommendedJobs().length > 0 ? (
            <div className={styles.recommendedList}>
                  {getValidRecommendedJobs().map((recommendedJob, index) => (
                    <div 
                      key={`${recommendedJob.job.job_id}-${index}`} 
                      className={styles.recommendedJobCard}
                    onClick={() => handleJobClick(recommendedJob.job.slug)}
                  >
                      <JobCard job={recommendedJob.job} showMatchScore={false} />
                </div>
              ))}
            </div>
          ) : (
                <div className={styles.emptyState}>
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

      {/* Job Listings */}
      <section className={styles.jobListSection}>
        {status === "loading" && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p className={styles.loadingText}>
              {hasActiveFilters() ? "Filtering jobs..." : "Searching for jobs..."}
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className={styles.errorCard}>
            <h3 className={styles.errorTitle}>Error Loading Jobs</h3>
            <p className={styles.errorMessage}>
              {error || "An error occurred while loading jobs. Please try again."}
            </p>
            <Button
              onClick={() => dispatch(fetchJobs({ page: 1, limit: 10 }))}
              variant="primary"
              className={styles.retryButton}
            >
              Retry
            </Button>
          </div>
        )}

        {status === "succeeded" && getFilteredJobs().length === 0 && (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyStateTitle}>No jobs found</h3>
            <p className={styles.emptyStateText}>
              {hasActiveFilters() 
                ? "No jobs match your current filters. Try adjusting your search criteria."
                : "No jobs available at the moment. Please check back later."}
            </p>
            {hasActiveFilters() && (
              <>
                <div className={styles.activeFilterList}>
                  <p>Active filters:</p>
                  <ul>
                    {getActiveFilterNames().map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={handleResetFilters}
                  variant="secondary"
                  className={styles.emptyStateButton}
                >
                  Reset Filters
                </Button>
              </>
            )}
          </div>
        )}

        {status === "succeeded" && getFilteredJobs().length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                {hasActiveFilters() ? "Filtered Results: " : "All Jobs: "}
                {getFilteredJobs().length} {getFilteredJobs().length === 1 ? "job" : "jobs"}
              </h2>
              {hasActiveFilters() && (
                <Button
                  onClick={handleResetFilters}
                  variant="text"
                  icon={<FiX />}
                  className={styles.clearFiltersButton}
                >
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className={styles.jobList}>
              {getFilteredJobs().map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => handleJobClick(job.slug)}
                  className={styles.jobCardWrapper}
                >
                  <JobCard job={job} showMatchScore={true} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default JobSearch;