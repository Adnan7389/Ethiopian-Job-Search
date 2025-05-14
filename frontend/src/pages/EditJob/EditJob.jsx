import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { fetchJobBySlug, updateJob } from "../../features/job/jobSlice";
import { toast } from "react-toastify";
import styles from "./EditJob.module.css";

function EditJob() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, job } = useSelector((state) => state.job);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
      dispatch(fetchJobBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        location: job.location || "",
        salary_range: job.salary_range || "",
        job_type: job.job_type,
        industry: job.industry,
        experience_level: job.experience_level,
        application_deadline: job.expires_at ? new Date(job.expires_at).toISOString().split("T")[0] : "",
        status: job.status,
      });
    }
  }, [job, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateJob({ slug, jobData: data })).unwrap();
      toast.success("Job updated successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to update job:", err);
      toast.error(err.message || "Failed to update job. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (status === "loading") return <LoadingSpinner />;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!job) return <div className={styles.error}>Job not found</div>;

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

        <FormInput
          label="Description"
          type="textarea"
            {...register("description", { required: "Description is required" })}
          error={errors.description?.message}
          />

        <FormInput
          label="Location"
          type="text"
          {...register("location", { required: "Location is required" })}
          error={errors.location?.message}
        />

        <FormInput
          label="Salary Range"
          type="text"
          {...register("salary_range")}
          error={errors.salary_range?.message}
        />

        <FormInput
          label="Job Type"
          type="select"
          {...register("job_type", { required: "Job type is required" })}
          error={errors.job_type?.message}
        >
          <option value="">Select Job Type</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </FormInput>

        <FormInput
          label="Industry"
          type="select"
          {...register("industry", { required: "Industry is required" })}
          error={errors.industry?.message}
        >
          <option value="">Select Industry</option>
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
        </FormInput>

        <FormInput
          label="Experience Level"
          type="select"
          {...register("experience_level", { required: "Experience level is required" })}
          error={errors.experience_level?.message}
        >
          <option value="">Select Experience Level</option>
          <option value="entry-level">Entry Level</option>
          <option value="mid-level">Mid Level</option>
            <option value="senior">Senior</option>
        </FormInput>

        <FormInput
          label="Application Deadline"
          type="date"
          {...register("application_deadline")}
          error={errors.application_deadline?.message}
        />

        <FormInput
          label="Status"
          type="select"
          {...register("status", { required: "Status is required" })}
          error={errors.status?.message}
        >
          <option value="">Select Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="paused">Paused</option>
        </FormInput>

        <div className={styles.buttonGroup}>
          <Button type="submit" variant="primary">
            Update Job
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditJob;