import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../../features/job/jobSlice"; // Import fetchJobs instead
import JobCard from "../../components/JobCard/JobCard";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./JobSearch.module.css";

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
    // Fetch only open, non-archived, non-expired jobs for job seekers
    dispatch(
      fetchJobs({
        page: 1,
        limit: 10,
        search: filters.search,
        industry: filters.industry,
        location: filters.location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        status: "open", // Only show open jobs
        includeArchived: false, // Exclude archived jobs
      })
    );
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filters are already applied via useEffect
  };

  const handleJobClick = (slug) => {
    navigate(`/jobs/${slug}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Job Search</h1>

      {/* Search Form */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="industry">Industry</label>
            <select
              id="industry"
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
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
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g., Addis Ababa"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="job_type">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              value={filters.job_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="experience_level">Experience Level</label>
            <select
              id="experience_level"
              name="experience_level"
              value={filters.experience_level}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="entry-level">Entry Level</option>
              <option value="mid-level">Mid Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <Button type="submit" variant="primary">Search</Button>
          </div>
        </div>
      </form>

      {/* Job Listings */}
      {status === "loading" && <LoadingSpinner />}
      {status === "failed" && <p className={styles.error}>{error}</p>}
      {status === "succeeded" && jobs.length === 0 && (
        <p className={styles.message}>No jobs found.</p>
      )}
      {status === "succeeded" && jobs.length > 0 && (
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
      )}
    </div>
  );
};

export default JobSearch;