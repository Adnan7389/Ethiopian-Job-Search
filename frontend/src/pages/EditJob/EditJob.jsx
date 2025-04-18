import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { fetchJobBySlug, updateJob } from "../../features/job/jobSlice";
import styles from "./EditJob.module.css";

function EditJob() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.job);
  const job = useSelector((state) => state.job.jobs.find((j) => j.slug === slug));
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (!job) {
      dispatch(fetchJobBySlug(slug));
    } else {
      reset({
        title: job.title,
        description: job.description,
        location: job.location || "",
        salary_range: job.salary || "", // Changed from salary
        job_type: job.job_type,
        industry: job.industry,
        experience_level: job.experience_level,
        application_deadline: job.expires_at ? new Date(job.expires_at).toISOString().split("T")[0] : "", // Changed from expires_at
        status: job.status,
      });
    }
  }, [job, slug, dispatch, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateJob({ slug: job.slug, jobData: data })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to update job:", err);
      alert(`Failed to update job: ${err.message || "Please try again"}`);
    }
  };

  if (!job && status === "loading") return <LoadingSpinner />;
  if (!job) return <div>Job not found</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Job</h1>
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
          {...register("location")}
        />
        <FormInput
         label="Salary (optional)"
         type="text"
          {...register("salary_range")} // Changed from salary
        />
        <div className={styles.selectContainer}>
          <label>Job Type</label>
          <select {...register("job_type")}>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div className={styles.selectContainer}>
          <label>Industry</label>
          <select {...register("industry")}>
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
        <div className={styles.selectContainer}>
          <label>Experience Level</label>
          <select {...register("experience_level")}>
            <option value="entry-level">Entry-Level</option>
            <option value="mid-level">Mid-Level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <FormInput
          label="Expiry Date (optional)"
          type="date"
          {...register("application_deadline")} // Changed from expires_at
        />
        <div className={styles.selectContainer}>
          <label>Status</label>
          <select {...register("status")}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" variant="primary" disabled={status === "loading"}>
          {status === "loading" ? <LoadingSpinner /> : "Update Job"}
        </Button>
      </form>
    </div>
  );
}

export default EditJob;