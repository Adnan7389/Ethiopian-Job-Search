import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobBySlug } from "../../features/job/jobSlice";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import Button from "../../components/Button/Button";
import styles from "./JobDetail.module.css";

// React Icons
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiDollarSign, 
  FiBriefcase, 
  FiLayers, 
  FiAward, 
  FiClock, 
  FiCalendar,
  FiEdit2,
  FiCheckCircle
} from "react-icons/fi";

function JobDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { job, status, error } = useSelector((state) => state.job);
  const { userType, userId } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchJobBySlug(slug));
  }, [dispatch, slug]);

  const handleApply = () => {
    if (!userType) {
      navigate("/login");
      return;
    }
    if (userType !== "job_seeker") {
      alert("Only job seekers can apply for jobs.");
      return;
    }
    navigate(`/jobs/${slug}/apply`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (status === "loading") return <LoadingSpinner />;
  if (status === "failed") return <p className={styles.error}>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  const isJobOpen = job.status === "open" && (!job.expires_at || new Date(job.expires_at) > new Date());

  // Get status color class
  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return styles.statusOpen;
      case 'closed': return styles.statusClosed;
      case 'draft': return styles.statusDraft;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="secondary" onClick={handleBack} icon={<FiArrowLeft />}>
          Back
        </Button>
        <h1 className={styles.title}>{job.title}</h1>
        <div className={`${styles.statusBadge} ${getStatusColor(job.status)}`}>
          {job.status}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCard}>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <FiMapPin className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Location</h3>
                <p className={styles.metaValue}>{job.location || "Not specified"}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiDollarSign className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Salary</h3>
                <p className={styles.metaValue}>{job.salary_range ? job.salary_range : "Not specified"}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiBriefcase className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Job Type</h3>
                <p className={styles.metaValue}>{job.job_type}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiLayers className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Industry</h3>
                <p className={styles.metaValue}>{job.industry}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiAward className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Experience</h3>
                <p className={styles.metaValue}>{job.experience_level}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiClock className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Posted</h3>
                <p className={styles.metaValue}>{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className={styles.metaItem}>
              <FiCalendar className={styles.metaIcon} />
              <div>
                <h3 className={styles.metaLabel}>Expires</h3>
                <p className={styles.metaValue}>
                  {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.description}>
            <h2 className={styles.descriptionTitle}>Job Description</h2>
            <div className={styles.descriptionContent}>
              {job.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {userType === "job_seeker" && (
            <Button 
              onClick={handleApply} 
              variant="primary" 
              disabled={!isJobOpen}
              icon={<FiCheckCircle />}
            >
              {isJobOpen ? "Apply Now" : "Position Closed"}
            </Button>
          )}
          {userType === "employer" && job.employer_id === userId && (
            <Button
              onClick={() => navigate(`/dashboard/edit-job/${slug}`)}
              variant="secondary"
              icon={<FiEdit2 />}
            >
              Edit Job
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetail;