import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchJobBySlug } from "../../features/job/jobSlice";
import styles from "./JobDetail.module.css";

function JobDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.job);
  const job = useSelector((state) => state.job.jobs.find((j) => j.slug === slug));

  useEffect(() => {
    dispatch(fetchJobBySlug(slug));
  }, [dispatch, slug]);

  if (status === "loading") return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{job.title}</h1>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Job Type:</strong> {job.job_type}</p>
      <p><strong>Industry:</strong> {job.industry}</p>
      <p><strong>Experience Level:</strong> {job.experience_level}</p>
      {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Posted On:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
      {job.expires_at && <p><strong>Expires On:</strong> {new Date(job.expires_at).toLocaleDateString()}</p>}
    </div>
  );
}

export default JobDetail;