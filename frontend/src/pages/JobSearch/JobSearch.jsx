import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../../features/job/jobSlice";
import JobCard from "../../components/JobCard/JobCard";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./JobSearch.module.css";
import { FiSearch, FiX, FiBriefcase, FiMapPin, FiClock, FiAward } from "react-icons/fi";

const JobSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, status, error } = useSelector((state) => state.job);
  const { userType } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    location: "",
    job_type: "",
    experience_level: "",
  });

  useEffect(() => {
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        search: filters.search,
        industry: filters.industry,
        location: filters.location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        status: "open",
        includeArchived: false,
      })
    );
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      industry: "",
      location: "",
      job_type: "",
      experience_level: "",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleJobClick = (slug) => {
    navigate(`/jobs/${slug}`);
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
          <Button type="submit" variant="primary" className={styles.searchButton}>
            Search Jobs
          </Button>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>
            <FiBriefcase className={styles.filterIcon} /> Filter Jobs
          </h3>
          
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
                icon={<FiMapPin />}
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
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
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
              type="button"
              variant="secondary"
              onClick={handleResetFilters}
              icon={<FiX />}
              className={styles.resetButton}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </form>

      {/* Job Listings */}
      <section className={styles.jobListSection}>
        {status === "loading" && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p className={styles.loadingText}>Searching for jobs...</p>
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

        {status === "succeeded" && jobs.length === 0 && (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyStateTitle}>No jobs found</h3>
            <p className={styles.emptyStateText}>
              Try adjusting your search filters or check back later for new postings
            </p>
            <Button
              onClick={handleResetFilters}
              variant="secondary"
              className={styles.emptyStateButton}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {status === "succeeded" && jobs.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
              </h2>
            </div>
            
            <div className={styles.jobList}>
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => handleJobClick(job.slug)}
                  className={styles.jobCardWrapper}
                >
                  <JobCard job={job} />
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