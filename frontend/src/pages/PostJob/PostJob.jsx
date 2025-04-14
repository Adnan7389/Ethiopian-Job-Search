import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { createJob, resetStatus } from "../../features/job/jobSlice";
import styles from "./PostJob.module.css";

function PostJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.job);
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

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    try {
      // Debug log to confirm resetStatus import
      console.log("resetStatus function:", resetStatus);
      // Reset status if resetStatus is available
      if (typeof resetStatus === "function") {
        dispatch(resetStatus());
        console.log("Status reset, dispatching createJob");
      } else {
        console.warn("resetStatus is not available, proceeding without reset");
      }
      const action = await dispatch(createJob(data));
      if (createJob.fulfilled.match(action)) {
        console.log("Job posted successfully, result:", action.payload);
        navigate("/dashboard");
      } else {
        throw new Error(action.payload || "Failed to create job");
      }
    } catch (err) {
      console.error("Failed to create job:", err.message || err);
    }
  };

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
        <Button type="submit" variant="primary" disabled={status === "loading"}>
          {status === "loading" ? <LoadingSpinner /> : "Post Job"}
        </Button>
      </form>
    </div>
  );
}

export default PostJob;