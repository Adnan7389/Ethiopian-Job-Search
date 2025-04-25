import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProfile, updateProfile, uploadResume, uploadProfilePicture } from "../../features/profile/profileSlice";
import Button from "../Button/Button";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Profile.module.css";
import defaultProfileIcon from "../../assets/default-profile-icon.png";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, status, error, uploadStatus, uploadError } = useSelector((state) => state.profile);
  const { userType } = useSelector((state) => state.auth);

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [editMode, setEditMode] = useState(location.state?.editMode || false);
  const [initialLoadFailed, setInitialLoadFailed] = useState(false);

  const [jobSeekerForm, setJobSeekerForm] = useState({
    full_name: "",
    bio: "",
    skills: [],
    education: [],
    experience: [],
    location: "",
  });

  const [employerForm, setEmployerForm] = useState({
    company_name: "",
    industry: "",
    website: "",
    description: "",
    contact_email: "",
    location: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
  const [newExperience, setNewExperience] = useState({ position: "", company: "", start_year: "", end_year: "" });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (status === "failed" && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        dispatch(fetchProfile());
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === "failed" && retryCount >= maxRetries) {
      if (!profile) {
        setInitialLoadFailed(true);
        setEditMode(true);
      }
    }
  }, [status, retryCount, dispatch, maxRetries, profile]);

  useEffect(() => {
    if (profile) {
      if (userType === "job_seeker") {
        setJobSeekerForm({
          full_name: profile.full_name || "",
          bio: profile.bio || "",
          skills: profile.skills || [],
          education: profile.education || [],
          experience: profile.experience || [],
          location: profile.location || "",
        });
      } else if (userType === "employer") {
        setEmployerForm({
          company_name: profile.company_name || "",
          industry: profile.industry || "",
          website: profile.website || "",
          description: profile.description || "",
          contact_email: profile.contact_email || "",
          location: profile.location || "",
        });
      }
    }
  }, [profile, userType]);

  const validateJobSeekerForm = () => {
    const errors = {};
    if (jobSeekerForm.full_name && (jobSeekerForm.full_name.length < 2 || jobSeekerForm.full_name.length > 100)) {
      errors.full_name = "Full name must be between 2 and 100 characters";
    }
    if (jobSeekerForm.bio && jobSeekerForm.bio.length > 1000) {
      errors.bio = "Bio must be less than 1000 characters";
    }
    if (jobSeekerForm.location && jobSeekerForm.location.length > 100) {
      errors.location = "Location must be less than 100 characters";
    }
    if (jobSeekerForm.skills.length > 10) {
      errors.skills = "You can add up to 10 skills";
    }
    if (jobSeekerForm.education.length > 10) {
      errors.education = "You can add up to 10 education entries";
    }
    if (jobSeekerForm.experience.length > 10) {
      errors.experience = "You can add up to 10 experience entries";
    }
    return errors;
  };

  const validateEmployerForm = () => {
    const errors = {};
    if (!employerForm.company_name || employerForm.company_name.length < 2 || employerForm.company_name.length > 100) {
      errors.company_name = "Company name is required and must be between 2 and 100 characters";
    }
    if (employerForm.industry && employerForm.industry.length > 50) {
      errors.industry = "Industry must be less than 50 characters";
    }
    if (employerForm.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(employerForm.website)) {
      errors.website = "Invalid website URL";
    }
    if (employerForm.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employerForm.contact_email)) {
      errors.contact_email = "Invalid contact email";
    }
    if (employerForm.description && employerForm.description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }
    if (employerForm.location && employerForm.location.length > 100) {
      errors.location = "Location must be less than 100 characters";
    }
    return errors;
  };

  const handleJobSeekerChange = (e) => {
    const { name, value } = e.target;
    setJobSeekerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployerChange = (e) => {
    const { name, value } = e.target;
    setEmployerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && jobSeekerForm.skills.length < 10) {
      setJobSeekerForm((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => (e) => {
    e.preventDefault();
    setJobSeekerForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (newEducation.degree && newEducation.institution && newEducation.year && jobSeekerForm.education.length < 10) {
      setJobSeekerForm((prev) => ({
        ...prev,
        education: [...prev.education, { ...newEducation }],
      }));
      setNewEducation({ degree: "", institution: "", year: "" });
    }
  };

  const handleRemoveEducation = (index) => (e) => {
    e.preventDefault();
    setJobSeekerForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (newExperience.position && newExperience.company && newExperience.start_year && jobSeekerForm.experience.length < 10) {
      setJobSeekerForm((prev) => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }],
      }));
      setNewExperience({ position: "", company: "", start_year: "", end_year: "" });
    }
  };

  const handleRemoveExperience = (index) => (e) => {
    e.preventDefault();
    setJobSeekerForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};

    if (userType === "job_seeker") {
      errors = validateJobSeekerForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      dispatch(updateProfile(jobSeekerForm));
    } else if (userType === "employer") {
      errors = validateEmployerForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      dispatch(updateProfile(employerForm));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, resume: "Only PDF, DOC, and DOCX files are allowed" });
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, resume: "File size must be less than 5MB" });
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setFormErrors({ ...formErrors, resume: null });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, profilePicture: "Only PNG, JPG, and JPEG files are allowed" });
        setProfilePictureFile(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors({ ...formErrors, profilePicture: "File size must be less than 2MB" });
        setProfilePictureFile(null);
        return;
      }
      setProfilePictureFile(file);
      setFormErrors({ ...formErrors, profilePicture: null });
    }
  };

  const handleResumeUpload = (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);
    dispatch(uploadResume(formData));
  };

  const handleProfilePictureUpload = (e) => {
    e.preventDefault();
    if (!profilePictureFile) return;
    const formData = new FormData();
    formData.append("profilePicture", profilePictureFile);
    dispatch(uploadProfilePicture(formData));
  };

  const handleDownloadResume = (e) => {
    e.preventDefault();
    window.open("http://localhost:5000/api/profile/resume/download", "_blank");
  };

  const handlePreviewResume = (e) => {
    e.preventDefault();
    if (profile?.resume_url && profile.resume_url.endsWith(".pdf")) {
      window.open(`http://localhost:5000${profile.resume_url}`, "_blank");
    } else {
      handleDownloadResume(e);
    }
  };

  if (status === "loading" && retryCount === 0 && !profile) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "failed" && retryCount >= maxRetries && !initialLoadFailed) {
    const isTimeout = error?.includes("timeout");
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.error}>
          {isTimeout
            ? "Failed to load profile: The request timed out after multiple attempts."
            : `Failed to load profile: ${error?.message || error || "An error occurred."}`}
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            onClick={() => {
              setRetryCount(0);
              dispatch(fetchProfile());
            }}
            variant="primary"
            className={styles.submitButton}
          >
            Retry
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            className={styles.submitButton}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Profile</h1>

      {!editMode ? (
        <div className={styles.viewMode}>
          <div className={styles.profilePictureSection}>
            <img
              src={profile?.profile_picture_url ? `http://localhost:5000${profile.profile_picture_url}` : defaultProfileIcon}
              alt="Profile"
              className={styles.profilePicture}
            />
          </div>

          {userType === "job_seeker" ? (
            <>
              <p><strong>Full Name:</strong> {profile?.full_name || "Not set"}</p>
              <p><strong>Bio:</strong> {profile?.bio || "Not set"}</p>
              <p><strong>Location:</strong> {profile?.location || "Not set"}</p>
              <p><strong>Skills:</strong></p>
              {profile?.skills?.length > 0 ? (
                <ul className={styles.list}>
                  {profile.skills.map((skill, index) => (
                    <li key={index} className={styles.listItem}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>Not set</p>
              )}
              <p><strong>Education:</strong></p>
              {profile?.education?.length > 0 ? (
                <ul className={styles.list}>
                  {profile.education.map((edu, index) => (
                    <li key={index} className={styles.listItem}>
                      {edu.degree}, {edu.institution}, {edu.year}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Not set</p>
              )}
              <p><strong>Experience:</strong></p>
              {profile?.experience?.length > 0 ? (
                <ul className={styles.list}>
                  {profile.experience.map((exp, index) => (
                    <li key={index} className={styles.listItem}>
                      {exp.position} at {exp.company}, {exp.start_year} - {exp.end_year || "Present"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Not set</p>
              )}
              {profile?.resume_url && (
                <div className={styles.resumeActions}>
                  <Button onClick={handlePreviewResume} variant="secondary">
                    Preview Resume
                  </Button>
                  <Button onClick={handleDownloadResume} variant="secondary">
                    Download Resume
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <p><strong>Company Name:</strong> {profile?.company_name || "Not set"}</p>
              <p><strong>Industry:</strong> {profile?.industry || "Not set"}</p>
              <p><strong>Website:</strong> {profile?.website || "Not set"}</p>
              <p><strong>Description:</strong> {profile?.description || "Not set"}</p>
              <p><strong>Contact Email:</strong> {profile?.contact_email || "Not set"}</p>
              <p><strong>Location:</strong> {profile?.location || "Not set"}</p>
            </>
          )}

          <Button
            onClick={(e) => {
              e.preventDefault();
              setEditMode(true);
            }}
            variant="primary"
            className={styles.submitButton}
          >
            Edit Profile
          </Button>

          {profile?.updated_at && (
            <p className={styles.lastUpdated}>
              Last Updated: {new Date(profile.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className={styles.profilePictureSection}>
            <img
              src={profile?.profile_picture_url ? `http://localhost:5000${profile.profile_picture_url}` : defaultProfileIcon}
              alt="Profile"
              className={styles.profilePicture}
            />
            <div>
              <input
                type="file"
                id="profilePicture"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleProfilePictureChange}
                className={styles.fileInput}
                aria-label="Upload profile picture"
              />
              <Button
                onClick={handleProfilePictureUpload}
                disabled={!profilePictureFile || uploadStatus === "loading"}
                variant="primary"
                className={styles.uploadButton}
              >
                {uploadStatus === "loading" ? "Uploading..." : "Upload Profile Picture"}
              </Button>
              {formErrors.profilePicture && <p className={styles.error}>{formErrors.profilePicture}</p>}
              {uploadError && <p className={styles.error}>{uploadError?.message || uploadError}</p>}
              {uploadStatus === "succeeded" && !uploadError && (
                <p className={styles.success}>Profile picture uploaded successfully!</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {userType === "job_seeker" ? (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={jobSeekerForm.full_name}
                    onChange={handleJobSeekerChange}
                    placeholder="Enter your full name"
                    className={styles.input}
                    aria-describedby={formErrors.full_name ? "full_name-error" : undefined}
                  />
                  {formErrors.full_name && (
                    <span id="full_name-error" className={styles.error}>
                      {formErrors.full_name}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={jobSeekerForm.bio}
                    onChange={handleJobSeekerChange}
                    placeholder="Tell us about yourself"
                    className={styles.textarea}
                    aria-describedby={formErrors.bio ? "bio-error" : undefined}
                  />
                  {formErrors.bio && (
                    <span id="bio-error" className={styles.error}>
                      {formErrors.bio}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Skills</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., JavaScript"
                      className={styles.input}
                    />
                    <Button
                      onClick={handleAddSkill}
                      variant="primary"
                      disabled={!newSkill.trim() || jobSeekerForm.skills.length >= 10}
                      className={styles.addButton}
                    >
                      Add Skill
                    </Button>
                  </div>
                  {formErrors.skills && <p className={styles.error}>{formErrors.skills}</p>}
                  <ul className={styles.list}>
                    {jobSeekerForm.skills.map((skill, index) => (
                      <li key={index} className={styles.listItem}>
                        {skill}
                        <Button
                          onClick={handleRemoveSkill(index)}
                          variant="danger"
                          className={styles.removeButton}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.formGroup}>
                  <label>Education</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="degree"
                      value={newEducation.degree}
                      onChange={handleEducationChange}
                      placeholder="Degree, e.g., BSc Computer Science"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="institution"
                      value={newEducation.institution}
                      onChange={handleEducationChange}
                      placeholder="Institution, e.g., Addis Ababa University"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="year"
                      value={newEducation.year}
                      onChange={handleEducationChange}
                      placeholder="Year, e.g., 2020"
                      className={styles.input}
                    />
                    <Button
                      onClick={handleAddEducation}
                      variant="primary"
                      disabled={
                        !newEducation.degree ||
                        !newEducation.institution ||
                        !newEducation.year ||
                        jobSeekerForm.education.length >= 10
                      }
                      className={styles.addButton}
                    >
                      Add Education
                    </Button>
                  </div>
                  {formErrors.education && <p className={styles.error}>{formErrors.education}</p>}
                  <ul className={styles.list}>
                    {jobSeekerForm.education.map((edu, index) => (
                      <li key={index} className={styles.listItem}>
                        {edu.degree}, {edu.institution}, {edu.year}
                        <Button
                          onClick={handleRemoveEducation(index)}
                          variant="danger"
                          className={styles.removeButton}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.formGroup}>
                  <label>Experience</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="position"
                      value={newExperience.position}
                      onChange={handleExperienceChange}
                      placeholder="Position, e.g., Software Engineer"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="company"
                      value={newExperience.company}
                      onChange={handleExperienceChange}
                      placeholder="Company, e.g., Company X"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="start_year"
                      value={newExperience.start_year}
                      onChange={handleExperienceChange}
                      placeholder="Start Year, e.g., 2021"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="end_year"
                      value={newExperience.end_year}
                      onChange={handleExperienceChange}
                      placeholder="End Year, e.g., 2023 (optional)"
                      className={styles.input}
                    />
                    <Button
                      onClick={handleAddExperience}
                      variant="primary"
                      disabled={
                        !newExperience.position ||
                        !newExperience.company ||
                        !newExperience.start_year ||
                        jobSeekerForm.experience.length >= 10
                      }
                      className={styles.addButton}
                    >
                      Add Experience
                    </Button>
                  </div>
                  {formErrors.experience && <p className={styles.error}>{formErrors.experience}</p>}
                  <ul className={styles.list}>
                    {jobSeekerForm.experience.map((exp, index) => (
                      <li key={index} className={styles.listItem}>
                        {exp.position} at {exp.company}, {exp.start_year} - {exp.end_year || "Present"}
                        <Button
                          onClick={handleRemoveExperience(index)}
                          variant="danger"
                          className={styles.removeButton}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={jobSeekerForm.location}
                    onChange={handleJobSeekerChange}
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    className={styles.input}
                    aria-describedby={formErrors.location ? "location-error" : undefined}
                  />
                  {formErrors.location && (
                    <span id="location-error" className={styles.error}>
                      {formErrors.location}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="resume">Resume</label>
                  <input
                    type="file"
                    id="resume"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeChange}
                    className={styles.fileInput}
                    aria-label="Upload resume"
                  />
                  <Button
                    onClick={handleResumeUpload}
                    disabled={!resumeFile || uploadStatus === "loading"}
                    variant="primary"
                    className={styles.uploadButton}
                  >
                    {uploadStatus === "loading" ? "Uploading..." : "Upload Resume"}
                  </Button>
                  {formErrors.resume && <p className={styles.error}>{formErrors.resume}</p>}
                  {profile?.resume_url && (
                    <div className={styles.resumeActions}>
                      <Button onClick={handlePreviewResume} variant="secondary">
                        Preview Resume
                      </Button>
                      <Button onClick={handleDownloadResume} variant="secondary">
                        Download Resume
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="company_name">Company Name</label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={employerForm.company_name}
                    onChange={handleEmployerChange}
                    placeholder="Enter your company name"
                    className={styles.input}
                    required
                    aria-describedby={formErrors.company_name ? "company_name-error" : undefined}
                  />
                  {formErrors.company_name && (
                    <span id="company_name-error" className={styles.error}>
                      {formErrors.company_name}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={employerForm.industry}
                    onChange={handleEmployerChange}
                    placeholder="e.g., IT, Finance, Healthcare"
                    className={styles.input}
                    aria-describedby={formErrors.industry ? "industry-error" : undefined}
                  />
                  {formErrors.industry && (
                    <span id="industry-error" className={styles.error}>
                      {formErrors.industry}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={employerForm.website}
                    onChange={handleEmployerChange}
                    placeholder="e.g., https://www.example.com"
                    className={styles.input}
                    aria-describedby={formErrors.website ? "website-error" : undefined}
                  />
                  {formErrors.website && (
                    <span id="website-error" className={styles.error}>
                      {formErrors.website}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={employerForm.description}
                    onChange={handleEmployerChange}
                    placeholder="Tell us about your company"
                    className={styles.textarea}
                    aria-describedby={formErrors.description ? "description-error" : undefined}
                  />
                  {formErrors.description && (
                    <span id="description-error" className={styles.error}>
                      {formErrors.description}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact_email">Contact Email</label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={employerForm.contact_email}
                    onChange={handleEmployerChange}
                    placeholder="Enter contact email"
                    className={styles.input}
                    aria-describedby={formErrors.contact_email ? "contact_email-error" : undefined}
                  />
                  {formErrors.contact_email && (
                    <span id="contact_email-error" className={styles.error}>
                      {formErrors.contact_email}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={employerForm.location}
                    onChange={handleEmployerChange}
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    className={styles.input}
                    aria-describedby={formErrors.location ? "location-error" : undefined}
                  />
                  {formErrors.location && (
                    <span id="location-error" className={styles.error}>
                      {formErrors.location}
                    </span>
                  )}
                </div>
              </>
            )}

            {error && <p className={styles.error}>{error?.message || error}</p>}
            {status === "succeeded" && !error && (
              <p className={styles.success}>Profile updated successfully!</p>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                type="submit"
                variant="primary"
                disabled={status === "loading"}
                className={styles.submitButton}
              >
                {status === "loading" ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                variant="secondary"
                className={styles.submitButton}
              >
                Cancel
              </Button>
            </div>
          </form>

          {profile?.updated_at && (
            <p className={styles.lastUpdated}>
              Last Updated: {new Date(profile.updated_at).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;