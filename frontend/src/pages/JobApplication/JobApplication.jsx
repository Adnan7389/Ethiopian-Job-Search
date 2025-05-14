import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button/Button";
import { applyForJob } from "../../features/job/jobSlice";
import styles from "./JobApplication.module.css";
import { FiFileText, FiAlertCircle, FiCheckCircle, FiX, FiUpload } from "react-icons/fi";

function JobApplication() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { job, status, error } = useSelector((state) => state.job);
  const { userType, resume_url } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userType !== "job_seeker") {
      toast.error("Only job seekers can apply for jobs.");
      return;
    }
    if (!resume_url) {
      toast.error("Please upload a resume before applying.");
      return;
    }
    try {
      const result = await dispatch(applyForJob({ slug })).unwrap();
      toast.success("Application submitted successfully!");
      // Wait for 2 seconds before redirecting to show the success message
      setTimeout(() => {
      navigate("/dashboard", { state: { applicationSuccess: true } });
      }, 2000);
    } catch (err) {
      console.error("Application error:", err);
      toast.error(err.message || "Failed to submit application. Please try again.");
    }
  };

  const handleUploadResume = () => {
    toast.info("Redirecting to profile page to upload resume...");
    navigate("/profile?focus=resume");
  };

  if (!job || job.slug !== slug) {
    return (
      <div className={styles.notFound}>
        <FiAlertCircle size={24} />
        <p>Job not found</p>
        <Button variant="secondary" onClick={() => navigate("/job-search")}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  const hasResume = !!resume_url;
  const canApply = userType === "job_seeker" && hasResume;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Apply for <span>{job.title}</span>
        </h1>
        
        <div className={styles.resumeStatus}>
          {hasResume ? (
            <div className={`${styles.status} ${styles.hasResume}`}>
              <FiCheckCircle />
              <div>
                <h3>Resume Attached</h3>
                <p>Your saved resume will be included with this application</p>
              </div>
            </div>
          ) : (
            <div className={`${styles.status} ${styles.noResume}`}>
              <FiAlertCircle />
              <div>
                <h3>Resume Required</h3>
                <p>You need to upload a resume before applying</p>
              </div>
            </div>
          )}
        </div>

        {!hasResume && (
          <div className={styles.uploadPrompt}>
            <Button
              variant="primary"
              onClick={handleUploadResume}
              icon={<FiUpload />}
            >
              Upload Resume
            </Button>
            <p className={styles.note}>
              After uploading, return to this page to complete your application
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              disabled={status === "loading" || !canApply}
              icon={status === "loading" ? null : <FiFileText />}
            >
              {status === "loading" ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/jobs/${slug}`)}
              icon={<FiX />}
            >
              Cancel
            </Button>
          </div>
          {error && (
            <div className={styles.error}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default JobApplication;