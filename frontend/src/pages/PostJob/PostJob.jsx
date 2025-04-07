import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { createJob, resetStatus } from "../../features/job/jobSlice";
import { fetchProfile } from "../../features/profile/profileSlice";
import styles from "./PostJob.module.css";
import axios from "axios";
import { toast } from "react-hot-toast";

function PostJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, job } = useSelector((state) => state.job);
  const { profile, status: profileStatus } = useSelector((state) => state.profile);
  const { userType } = useSelector((state) => state.auth);

  // Fetch profile on mount if not loaded
  useEffect(() => {
    if (!profile && userType === "employer") {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile, userType]);

  // Use isApproved from profile
  const isApproved = useSelector((state) => state.profile.isApproved) === 1;

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salary_range: "",
      job_type: "full-time",
      industry: "Other",
      experience_level: "entry-level",
      application_deadline: "",
      status: "open",
    },
  });

  const formValues = watch();

  // Reset status when component mounts
  useEffect(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  // Navigate to payment page after successful job creation
  useEffect(() => {
    console.log("Payment initialization effect triggered with:", {
      status,
      job,
      error,
      hasJobId: job?.jobId || job?.job_id,
      env: {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        NODE_ENV: import.meta.env.MODE,
        BASE_URL: import.meta.env.BASE_URL
      }
    });

    if (status === "succeeded" && job) {
      console.log("Job created successfully, checking for payment URL:", job);
      
      // Check if the job response includes a payment URL directly
      if (job.paymentUrl) {
        console.log("Redirecting to payment URL:", job.paymentUrl);
        // Store tx_ref in localStorage for future reference
        if (job.tx_ref) {
          localStorage.setItem('current_payment_tx_ref', job.tx_ref);
        }
        window.location.href = job.paymentUrl;
        return;
      }
      
      // Fallback - use tx_ref if available (old way)
      const jobId = job.jobId || job.job_id;
      if (jobId) {
        console.log("No payment URL in response, redirecting to payment success page");
        // If we have tx_ref, add it to the URL
        if (job.tx_ref) {
          navigate(`/payment-success?tx_ref=${job.tx_ref}`);
        } else {
          navigate("/payment-success");
        }
      }
    } else if (status === "failed") {
      console.error("Job creation failed:", {
        error,
        status,
        job
      });
      toast.error(error || "Failed to create job. Please try again.");
    } else {
      console.log("Payment initialization conditions not met:", {
        status,
        hasJob: !!job,
        hasJobId: !!(job?.jobId || job?.job_id)
      });
    }
  }, [status, job, error, navigate]);

  const onSubmit = async (data) => {
    console.log("Form submission started with data:", data);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'job_type', 'industry', 'experience_level'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      console.log("Dispatching createJob action...");
      const result = await dispatch(createJob(data)).unwrap();
      console.log("Job creation result:", result);
      
      if (!result || (!result.jobId && !result.job_id)) {
        console.error("Invalid job creation response:", result);
        toast.error("Failed to create job: Invalid response from server");
        return;
      }
      
      toast.success("Job created successfully! Redirecting to payment...");
    } catch (err) {
      console.error("Failed to create job:", {
        error: err.message || err,
        stack: err.stack,
        response: err.response?.data
      });
      toast.error(err.response?.data?.message || err.message || "Failed to create job. Please try again.");
    }
  };

  const handleCancel = () => {
    console.log("Cancel button clicked, navigating to dashboard");
    navigate("/dashboard");
  };

  // Add console logs for debugging
  console.log("Current component state:", {
    profile,
    profileStatus,
    isApproved,
    status,
    error,
    job,
    formValues
  });

  // Add a check for isApproved before rendering the form
  if (!isApproved) {
    console.log("User not approved, showing warning message");
    return (
      <div className={styles.container}>
        <div className={styles.notApprovedWarning}>
          <h2>Your account is not yet approved to post jobs.</h2>
          <p>
            Please <a href="mailto:ethiohirehub@gmail.com" style={{ color: '#0d6efd', textDecoration: 'underline' }}>contact support</a> for assistance.
          </p>
        </div>
      </div>
    );
  }

  console.log("PostJob state:", { status, error });
  console.log("Form errors:", errors);
  console.log("Form values:", formValues);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Post a New Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          label="Job Title"
          type="text"
          {...register("title", { required: "Job title is required" })}
          error={errors.title?.message}
        />
        <div className={styles.textareaContainer}>
          <label>Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className={errors.description ? styles.errorInput : ""}
          />
          {errors.description && <p className={styles.error}>{errors.description.message}</p>}
        </div>
        <FormInput
          label="Location"
          type="text"
          {...register("location", { required: "Location is required" })}
          error={errors.location?.message}
        />
        <FormInput
          label="Salary Range (optional)"
          type="text"
          {...register("salary_range")}
        />
        <div className={styles.selectContainer}>
          <label>Job Type</label>
          <select {...register("job_type", { required: "Job type is required" })}>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
          </select>
          {errors.job_type && <p className={styles.error}>{errors.job_type.message}</p>}
        </div>
        <div className={styles.selectContainer}>
          <label>Industry</label>
          <select {...register("industry", { required: "Industry is required" })}>
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
          {errors.industry && <p className={styles.error}>{errors.industry.message}</p>}
        </div>
        <div className={styles.selectContainer}>
          <label>Experience Level</label>
          <select {...register("experience_level", { required: "Experience level is required" })}>
            <option value="entry-level">Entry-Level</option>
            <option value="mid-level">Mid-Level</option>
            <option value="senior">Senior</option>
          </select>
          {errors.experience_level && <p className={styles.error}>{errors.experience_level.message}</p>}
        </div>
        <FormInput
          label="Application Deadline (optional)"
          type="date"
          {...register("application_deadline")}
        />
        <div className={styles.selectContainer}>
          <label>Status</label>
          <select {...register("status", { required: "Status is required" })}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="paused">Paused</option>
          </select>
          {errors.status && <p className={styles.error}>{errors.status.message}</p>}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {Object.keys(errors).length > 0 && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>Please fix the following errors:</p>
            <ul>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className={styles.error}>
                  {field}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles.formActions}>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={status === "loading"}
            onClick={() => console.log("Submit button clicked")}
          >
            {status === "loading" ? <LoadingSpinner /> : "Post Job"}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;