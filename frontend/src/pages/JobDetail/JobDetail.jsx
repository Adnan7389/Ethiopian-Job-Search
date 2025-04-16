import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobBySlug } from "../../features/job/jobSlice";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import Button from "../../components/Button/Button";
import styles from "./JobDetail.module.css";

function JobDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { job, status, error } = useSelector((state) => state.job);
  const { userType } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchJobBySlug(slug));
  }, [dispatch, slug]);

  const handleApply = () => {
    alert("Apply functionality coming soon!");
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (status === "loading") return <LoadingSpinner />;
  if (status === "failed") return <p className={styles.error}>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="secondary" onClick={handleBack}>
          Back
        </Button>
        <h1 className={styles.title}>{job.title}</h1>
      </div>
      <div className={styles.details}>
        <p><strong>Location:</strong> {job.location || "Not specified"}</p>
        <p><strong>Salary:</strong> {job.salary_range ? job.salary_range : "Not specified"}</p>
        <p><strong>Job Type:</strong> {job.job_type}</p>
        <p><strong>Industry:</strong> {job.industry}</p>
        <p><strong>Experience Level:</strong> {job.experience_level}</p>
        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Expires At:</strong> {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Not specified"}</p>
        <p><strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
        <div className={styles.description}>
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>
      </div>
      <div className={styles.actions}>
        {userType === "job_seeker" && (
          <Button onClick={handleApply} variant="primary">
            Apply Now
          </Button>
        )}
        {userType === "employer" && job.employer_id === useSelector((state) => state.auth.userId) && (
          <Button
            onClick={() => navigate(`/dashboard/edit-job/${slug}`)}
            variant="secondary"
          >
            Edit Job
          </Button>
        )}
      </div>
    </div>
  );
}

export default JobDetail;