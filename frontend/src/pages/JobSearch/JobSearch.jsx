import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, createJob, updateJob, deleteJob } from '../../features/jobs/jobThunks';
import JobCard from '../../components/JobCard/JobCard';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './JobSearch.module.css';

const JobSearch = () => {
  const dispatch = useDispatch();
  const { jobs, status, error } = useSelector((state) => state.jobs);
  const { userType } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    category: '',
    job_title: '',
    location: '',
    job_type: '',
  });
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false); // State to toggle create form
  const [createFormData, setCreateFormData] = useState({
    job_title: '',
    job_type: 'full_time',
    category: 'IT',
    location: '',
    company_name: '',
    salary_min: '',
    salary_max: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchJobs(filters));
  };

  const handleEdit = (job) => {
    setEditingJob(job.job_id);
    setFormData({
      job_title: job.job_title,
      job_type: job.job_type,
      category: job.category,
      location: job.location,
      company_name: job.company_name,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      description: job.description,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateJob({ jobId: editingJob, data: formData })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setEditingJob(null);
        dispatch(fetchJobs(filters));
      }
    });
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createJob(createFormData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateForm(false);
        setCreateFormData({
          job_title: '',
          job_type: 'full_time',
          category: 'IT',
          location: '',
          company_name: '',
          salary_min: '',
          salary_max: '',
          description: '',
        });
        dispatch(fetchJobs(filters));
      }
    });
  };

  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      dispatch(deleteJob(jobId)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          dispatch(fetchJobs(filters));
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Job Search</h1>

      {/* Create Job Button (Visible to Employers Only) */}
      {userType === 'employer' && (
        <div className={styles.createButtonContainer}>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
          >
            {showCreateForm ? 'Cancel' : 'Post a New Job'}
          </Button>
        </div>
      )}

      {/* Create Job Form (Visible to Employers Only) */}
      {userType === 'employer' && showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <h2 className={styles.formTitle}>Post a New Job</h2>
          <div className={styles.formRow}>
            <FormInput
              label="Job Title"
              name="job_title"
              value={createFormData.job_title}
              onChange={handleCreateFormChange}
              required
            />
            <div className={styles.formGroup}>
              <label htmlFor="create_category">Category</label>
              <select
                id="create_category"
                name="category"
                value={createFormData.category}
                onChange={handleCreateFormChange}
                required
              >
                <option value="IT">IT</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="create_job_type">Job Type</label>
              <select
                id="create_job_type"
                name="job_type"
                value={createFormData.job_type}
                onChange={handleCreateFormChange}
                required
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <FormInput
              label="Location"
              name="location"
              value={createFormData.location}
              onChange={handleCreateFormChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <FormInput
              label="Company Name"
              name="company_name"
              value={createFormData.company_name}
              onChange={handleCreateFormChange}
              required
            />
            <FormInput
              label="Min Salary (ETB)"
              name="salary_min"
              type="number"
              value={createFormData.salary_min}
              onChange={handleCreateFormChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <FormInput
              label="Max Salary (ETB)"
              name="salary_max"
              type="number"
              value={createFormData.salary_max}
              onChange={handleCreateFormChange}
              required
            />
            <div className={styles.formGroup}>
              <label htmlFor="create_description">Description</label>
              <textarea
                id="create_description"
                name="description"
                value={createFormData.description}
                onChange={handleCreateFormChange}
                required
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="primary">Post Job</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Search Form */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="job_title">Job Title</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={filters.job_title}
              onChange={handleFilterChange}
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="IT">IT</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
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
            <select id="job_type" name="job_type" value={filters.job_type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <Button type="submit" variant="primary">Search</Button>
          </div>
        </div>
      </form>

      {/* Edit Form */}
      {editingJob && userType === 'employer' && (
        <form className={styles.editForm} onSubmit={handleUpdate}>
          <h2 className={styles.formTitle}>Edit Job</h2>
          <div className={styles.formRow}>
            <FormInput
              label="Job Title"
              name="job_title"
              value={formData.job_title}
              onChange={handleFormChange}
              required
            />
            <div className={styles.formGroup}>
              <label htmlFor="edit_category">Category</label>
              <select id="edit_category" name="category" value={formData.category} onChange={handleFormChange} required>
                <option value="IT">IT</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="edit_job_type">Job Type</label>
              <select id="edit_job_type" name="job_type" value={formData.job_type} onChange={handleFormChange} required>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <FormInput
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleFormChange}
              required
            />
            <FormInput
              label="Min Salary (ETB)"
              name="salary_min"
              type="number"
              value={formData.salary_min}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className={styles.formRow}>
            <FormInput
              label="Max Salary (ETB)"
              name="salary_max"
              type="number"
              value={formData.salary_max}
              onChange={handleFormChange}
              required
            />
            <div className={styles.formGroup}>
              <label htmlFor="edit_description">Description</label>
              <textarea
                id="edit_description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="primary">Update Job</Button>
            <Button type="button" variant="secondary" onClick={() => setEditingJob(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Job Listings */}
      {status === 'loading' && <LoadingSpinner />}
      {status === 'failed' && <p className={styles.error}>{error}</p>}
      {status === 'succeeded' && jobs.length === 0 && (
        <p className={styles.message}>No jobs found.</p>
      )}
      {status === 'succeeded' && jobs.length > 0 && (
        <div className={styles.jobList}>
          {jobs.map((job) => (
            <JobCard
              key={job.job_id}
              job={job}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSearch;