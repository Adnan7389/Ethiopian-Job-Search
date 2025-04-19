import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { applyForJob } from "../../features/job/jobSlice";
import styles from "./JobApplication.module.css";

function JobApplication() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { job, status, error } = useSelector((state) => state.job);
  const { userType, resume_url } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userType !== "job_seeker") {
      alert("Only job seekers can apply for jobs.");
      return;
    }
    try {
      await dispatch(applyForJob({ slug })).unwrap();
      alert("Application submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(`Failed to apply: ${err.message || "Please try again"}`);
    }
  };

  if (!job || job.slug !== slug) return <div>Job not found</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Apply for {job.title}</h1>
      <p>Are you sure you want to submit your application for this job?</p>
      {resume_url ? (
        <p>Your saved resume will be included.</p>
      ) : (
        <p>Note: No resume is attached. You can add one later in your profile.</p>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" disabled={status === "loading"}>
            Submit Application
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/jobs/${slug}`)}
          >
            Cancel
          </Button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

export default JobApplication;