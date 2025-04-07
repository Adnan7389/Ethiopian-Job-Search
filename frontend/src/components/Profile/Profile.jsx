import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProfile, updateProfile, uploadResume, uploadProfilePicture } from "../../features/profile/profileSlice";
import Button from "../Button/Button";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./Profile.module.css";
import defaultProfileIcon from "../../assets/default-profile-icon.png";
import { FiEdit, FiSave, FiTrash2, FiPlus, FiX, FiUpload, FiDownload, FiEye, FiUser, FiBriefcase, FiAward, FiMapPin, FiLink, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

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
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (status === "succeeded" && !error && isSaving) {
      toast.success("Profile updated successfully!");
      setEditMode(false);
      setIsSaving(false);
    } else if (status === "failed" && error && isSaving) {
      toast.error(error?.message || error || "Failed to update profile");
      setIsSaving(false);
    }
  }, [status, error, isSaving]);

  useEffect(() => {
    if (uploadStatus === "succeeded" && !uploadError) {
      toast.success("File uploaded successfully!");
    } else if (uploadStatus === "failed" && uploadError) {
      toast.error(uploadError?.message || uploadError || "Failed to upload file");
    }
  }, [uploadStatus, uploadError]);

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
    setIsSaving(true);

    if (userType === "job_seeker") {
      errors = validateJobSeekerForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error("Please fix the form errors before saving");
        setIsSaving(false);
        return;
      }
      dispatch(updateProfile(jobSeekerForm));
    } else if (userType === "employer") {
      errors = validateEmployerForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error("Please fix the form errors before saving");
        setIsSaving(false);
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
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      
      // Check file extension
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const isExtensionValid = allowedExtensions.includes(fileExtension);
      
      if (!allowedTypes.includes(file.type) || !isExtensionValid) {
        const errorMsg = `Invalid file type: ${file.name}. Only PNG, JPG, and JPEG files are allowed.`;
        setFormErrors({ ...formErrors, profilePicture: errorMsg });
        setProfilePictureFile(null);
        toast.error(errorMsg);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        const errorMsg = `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 2MB limit.`;
        setFormErrors({ ...formErrors, profilePicture: errorMsg });
        setProfilePictureFile(null);
        toast.error(errorMsg);
        return;
      }
      setProfilePictureFile(file);
      setFormErrors({ ...formErrors, profilePicture: null });
      toast.success("File selected successfully. Click 'Upload' to complete.");
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
    console.log("Loading profile...", { status, retryCount, profile });
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p className={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  if (status === "failed" && retryCount >= maxRetries && !initialLoadFailed) {
    const isTimeout = error?.includes("timeout");
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Profile Loading Error</h1>
        <div className={styles.errorCard}>
          <p className={styles.errorMessage}>
            {isTimeout
              ? "We couldn't load your profile. The request timed out after multiple attempts."
              : `Failed to load profile: ${error?.message || error || "An unknown error occurred."}`}
          </p>
          <div className={styles.errorActions}>
            <Button
              onClick={() => {
                setRetryCount(0);
                dispatch(fetchProfile());
              }}
              variant="primary"
              className={styles.retryButton}
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              className={styles.homeButton}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>
          {userType === "job_seeker" ? (
            <>
              <FiUser className={styles.titleIcon} /> My Profile
            </>
          ) : (
            <>
              <FiBriefcase className={styles.titleIcon} /> Company Profile
            </>
          )}
        </h1>
        {profile?.updated_at && (
          <p className={styles.lastUpdated}>
            Last updated: {new Date(profile.updated_at).toLocaleString()}
          </p>
        )}
      </header>

      {!editMode ? (
        <div className={styles.profileCard}>
          <div className={styles.profilePictureSection}>
            <div className={styles.profilePictureContainer}>
              <img
                src={profile?.profile_picture_url ? `http://localhost:5000${profile.profile_picture_url}` : defaultProfileIcon}
                alt="Profile"
                className={styles.profilePicture}
              />
            </div>
            <div className={styles.profileDetails}>
              {userType === "job_seeker" ? (
                <>
                  <h2 className={styles.profileName}>{profile?.full_name || "Not set"}</h2>
                  <p className={styles.profileBio}>{profile?.bio || "No bio provided"}</p>
                  <div className={styles.profileMeta}>
                    {profile?.location && (
                      <span className={styles.metaItem}>
                        <FiMapPin className={styles.metaIcon} /> {profile.location}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className={styles.profileName}>{profile?.company_name || "Company name not set"}</h2>
                  <p className={styles.profileBio}>{profile?.description || "No company description provided"}</p>
                  <div className={styles.profileMeta}>
                    {profile?.industry && (
                      <span className={styles.metaItem}>
                        <FiBriefcase className={styles.metaIcon} /> {profile.industry}
                      </span>
                    )}
                    {profile?.location && (
                      <span className={styles.metaItem}>
                        <FiMapPin className={styles.metaIcon} /> {profile.location}
                      </span>
                    )}
                    {profile?.website && (
                      <span className={styles.metaItem}>
                        <FiLink className={styles.metaIcon} /> {profile.website}
                      </span>
                    )}
                    {profile?.contact_email && (
                      <span className={styles.metaItem}>
                        <FiMail className={styles.metaIcon} /> {profile.contact_email}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {userType === "job_seeker" && (
            <>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FiAward className={styles.sectionIcon} /> Skills
                </h3>
                {profile?.skills?.length > 0 ? (
                  <ul className={styles.skillsList}>
                    {profile.skills.map((skill, index) => (
                      <li key={index} className={styles.skillItem}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>No skills added yet</p>
                )}
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Education</h3>
                {profile?.education?.length > 0 ? (
                  <ul className={styles.educationList}>
                    {profile.education.map((edu, index) => (
                      <li key={index} className={styles.educationItem}>
                        <h4 className={styles.educationDegree}>{edu.degree}</h4>
                        <p className={styles.educationInstitution}>{edu.institution}</p>
                        <p className={styles.educationYear}>{edu.year}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>No education information added</p>
                )}
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Experience</h3>
                {profile?.experience?.length > 0 ? (
                  <ul className={styles.experienceList}>
                    {profile.experience.map((exp, index) => (
                      <li key={index} className={styles.experienceItem}>
                        <h4 className={styles.experiencePosition}>{exp.position}</h4>
                        <p className={styles.experienceCompany}>{exp.company}</p>
                        <p className={styles.experienceDuration}>
                          {exp.start_year} - {exp.end_year || "Present"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>No experience information added</p>
                )}
              </section>

              {profile?.resume_url && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Resume</h3>
                  <div className={styles.resumeActions}>
                    <Button onClick={handlePreviewResume} variant="secondary" icon={<FiEye />}>
                      Preview Resume
                    </Button>
                    <Button onClick={handleDownloadResume} variant="primary" icon={<FiDownload />}>
                      Download Resume
                    </Button>
                  </div>
                </section>
              )}
            </>
          )}

          <div className={styles.profileActions}>
            <Button
              onClick={() => setEditMode(true)}
              variant="primary"
              icon={<FiEdit />}
              className={styles.editButton}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.editProfileCard}>
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Profile Picture</h3>
              <div className={styles.profilePictureEdit}>
                <div className={styles.profilePictureContainer}>
                  <img
                    src={profile?.profile_picture_url ? `http://localhost:5000${profile.profile_picture_url}` : defaultProfileIcon}
                    alt="Profile"
                    className={styles.profilePicture}
                  />
                </div>
                <div className={styles.uploadControls}>
                  <label className={styles.fileInputLabel}>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleProfilePictureChange}
                      className={styles.fileInput}
                      aria-label="Upload profile picture"
                    />
                    <span className={styles.fileInputButton}>
                      <FiUpload className={styles.uploadIcon} /> Choose File
                    </span>
                    {profilePictureFile && (
                      <span className={styles.fileName}>{profilePictureFile.name}</span>
                    )}
                  </label>
                  <Button
                    onClick={handleProfilePictureUpload}
                    disabled={!profilePictureFile || uploadStatus === "loading"}
                    variant="secondary"
                    className={styles.uploadButton}
                    icon={uploadStatus === "loading" ? null : <FiUpload />}
                  >
                    {uploadStatus === "loading" ? "Uploading..." : "Upload"}
                  </Button>
                  {formErrors.profilePicture && (
                    <p className={styles.errorMessage}>{formErrors.profilePicture}</p>
                  )}
                  {uploadError && (
                    <p className={styles.errorMessage}>{uploadError?.message || uploadError}</p>
                  )}
                  {uploadStatus === "succeeded" && !uploadError && (
                    <p className={styles.successMessage}>Profile picture uploaded successfully!</p>
                  )}
                </div>
              </div>
            </section>

            {userType === "job_seeker" ? (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="full_name" className={styles.formLabel}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={jobSeekerForm.full_name}
                        onChange={handleJobSeekerChange}
                        placeholder="Enter your full name"
                        className={styles.formInput}
                        aria-describedby={formErrors.full_name ? "full_name-error" : undefined}
                      />
                      {formErrors.full_name && (
                        <span id="full_name-error" className={styles.errorMessage}>
                          {formErrors.full_name}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="location" className={styles.formLabel}>
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={jobSeekerForm.location}
                        onChange={handleJobSeekerChange}
                        placeholder="e.g., Addis Ababa, Ethiopia"
                        className={styles.formInput}
                        aria-describedby={formErrors.location ? "location-error" : undefined}
                      />
                      {formErrors.location && (
                        <span id="location-error" className={styles.errorMessage}>
                          {formErrors.location}
                        </span>
                      )}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label htmlFor="bio" className={styles.formLabel}>
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={jobSeekerForm.bio}
                        onChange={handleJobSeekerChange}
                        placeholder="Tell us about yourself"
                        className={styles.formTextarea}
                        rows="4"
                        aria-describedby={formErrors.bio ? "bio-error" : undefined}
                      />
                      {formErrors.bio && (
                        <span id="bio-error" className={styles.errorMessage}>
                          {formErrors.bio}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Skills</h3>
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., JavaScript, Project Management"
                        className={styles.formInput}
                      />
                      <Button
                        onClick={handleAddSkill}
                        variant="secondary"
                        disabled={!newSkill.trim() || jobSeekerForm.skills.length >= 10}
                        className={styles.addButton}
                        icon={<FiPlus />}
                      >
                        Add
                      </Button>
                    </div>
                    {formErrors.skills && (
                      <p className={styles.errorMessage}>{formErrors.skills}</p>
                    )}
                    <ul className={styles.skillsListEdit}>
                      {jobSeekerForm.skills.map((skill, index) => (
                        <li key={index} className={styles.skillItemEdit}>
                          {skill}
                          <button
                            type="button"
                            onClick={handleRemoveSkill(index)}
                            className={styles.removeItemButton}
                            aria-label={`Remove skill ${skill}`}
                          >
                            <FiX />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  <div className={styles.formGroup}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="education-degree" className={styles.formLabel}>
                          Degree
                        </label>
                        <input
                          type="text"
                          id="education-degree"
                          name="degree"
                          value={newEducation.degree}
                          onChange={handleEducationChange}
                          placeholder="e.g., BSc Computer Science"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="education-institution" className={styles.formLabel}>
                          Institution
                        </label>
                        <input
                          type="text"
                          id="education-institution"
                          name="institution"
                          value={newEducation.institution}
                          onChange={handleEducationChange}
                          placeholder="e.g., Addis Ababa University"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="education-year" className={styles.formLabel}>
                          Year
                        </label>
                        <input
                          type="text"
                          id="education-year"
                          name="year"
                          value={newEducation.year}
                          onChange={handleEducationChange}
                          placeholder="e.g., 2020"
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddEducation}
                      variant="secondary"
                      disabled={
                        !newEducation.degree ||
                        !newEducation.institution ||
                        !newEducation.year ||
                        jobSeekerForm.education.length >= 10
                      }
                      className={styles.addButton}
                      icon={<FiPlus />}
                    >
                      Add Education
                    </Button>
                    {formErrors.education && (
                      <p className={styles.errorMessage}>{formErrors.education}</p>
                    )}
                    <ul className={styles.educationListEdit}>
                      {jobSeekerForm.education.map((edu, index) => (
                        <li key={index} className={styles.educationItemEdit}>
                          <div>
                            <h4 className={styles.educationDegree}>{edu.degree}</h4>
                            <p className={styles.educationInstitution}>{edu.institution}</p>
                            <p className={styles.educationYear}>{edu.year}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveEducation(index)}
                            className={styles.removeItemButton}
                            aria-label={`Remove education ${edu.degree}`}
                          >
                            <FiTrash2 />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Experience</h3>
                  <div className={styles.formGroup}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="experience-position" className={styles.formLabel}>
                          Position
                        </label>
                        <input
                          type="text"
                          id="experience-position"
                          name="position"
                          value={newExperience.position}
                          onChange={handleExperienceChange}
                          placeholder="e.g., Software Engineer"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="experience-company" className={styles.formLabel}>
                          Company
                        </label>
                        <input
                          type="text"
                          id="experience-company"
                          name="company"
                          value={newExperience.company}
                          onChange={handleExperienceChange}
                          placeholder="e.g., Company X"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="experience-start_year" className={styles.formLabel}>
                          Start Year
                        </label>
                        <input
                          type="text"
                          id="experience-start_year"
                          name="start_year"
                          value={newExperience.start_year}
                          onChange={handleExperienceChange}
                          placeholder="e.g., 2021"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="experience-end_year" className={styles.formLabel}>
                          End Year
                        </label>
                        <input
                          type="text"
                          id="experience-end_year"
                          name="end_year"
                          value={newExperience.end_year}
                          onChange={handleExperienceChange}
                          placeholder="Leave blank if current"
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddExperience}
                      variant="secondary"
                      disabled={
                        !newExperience.position ||
                        !newExperience.company ||
                        !newExperience.start_year ||
                        jobSeekerForm.experience.length >= 10
                      }
                      className={styles.addButton}
                      icon={<FiPlus />}
                    >
                      Add Experience
                    </Button>
                    {formErrors.experience && (
                      <p className={styles.errorMessage}>{formErrors.experience}</p>
                    )}
                    <ul className={styles.experienceListEdit}>
                      {jobSeekerForm.experience.map((exp, index) => (
                        <li key={index} className={styles.experienceItemEdit}>
                          <div>
                            <h4 className={styles.experiencePosition}>{exp.position}</h4>
                            <p className={styles.experienceCompany}>{exp.company}</p>
                            <p className={styles.experienceDuration}>
                              {exp.start_year} - {exp.end_year || "Present"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveExperience(index)}
                            className={styles.removeItemButton}
                            aria-label={`Remove experience ${exp.position}`}
                          >
                            <FiTrash2 />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Resume</h3>
                  <div className={styles.formGroup}>
                    <label className={styles.fileInputLabel}>
                      <input
                        type="file"
                        id="resume"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeChange}
                        className={styles.fileInput}
                        aria-label="Upload resume"
                      />
                      <span className={styles.fileInputButton}>
                        <FiUpload className={styles.uploadIcon} /> Choose File
                      </span>
                      {resumeFile && (
                        <span className={styles.fileName}>{resumeFile.name}</span>
                      )}
                    </label>
                    <Button
                      onClick={handleResumeUpload}
                      disabled={!resumeFile || uploadStatus === "loading"}
                      variant="secondary"
                      className={styles.uploadButton}
                      icon={uploadStatus === "loading" ? null : <FiUpload />}
                    >
                      {uploadStatus === "loading" ? "Uploading..." : "Upload Resume"}
                    </Button>
                    {formErrors.resume && (
                      <p className={styles.errorMessage}>{formErrors.resume}</p>
                    )}
                    {profile?.resume_url && (
                      <div className={styles.resumeActions}>
                        <Button onClick={handlePreviewResume} variant="secondary" icon={<FiEye />}>
                          Preview Resume
                        </Button>
                        <Button onClick={handleDownloadResume} variant="primary" icon={<FiDownload />}>
                          Download Resume
                        </Button>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Company Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="company_name" className={styles.formLabel}>
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={employerForm.company_name}
                        onChange={handleEmployerChange}
                        placeholder="Enter your company name"
                        className={styles.formInput}
                        required
                        aria-describedby={formErrors.company_name ? "company_name-error" : undefined}
                      />
                      {formErrors.company_name && (
                        <span id="company_name-error" className={styles.errorMessage}>
                          {formErrors.company_name}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="industry" className={styles.formLabel}>
                        Industry
                      </label>
                      <input
                        type="text"
                        id="industry"
                        name="industry"
                        value={employerForm.industry}
                        onChange={handleEmployerChange}
                        placeholder="e.g., IT, Finance, Healthcare"
                        className={styles.formInput}
                        aria-describedby={formErrors.industry ? "industry-error" : undefined}
                      />
                      {formErrors.industry && (
                        <span id="industry-error" className={styles.errorMessage}>
                          {formErrors.industry}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="website" className={styles.formLabel}>
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={employerForm.website}
                        onChange={handleEmployerChange}
                        placeholder="e.g., https://www.example.com"
                        className={styles.formInput}
                        aria-describedby={formErrors.website ? "website-error" : undefined}
                      />
                      {formErrors.website && (
                        <span id="website-error" className={styles.errorMessage}>
                          {formErrors.website}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="contact_email" className={styles.formLabel}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        value={employerForm.contact_email}
                        onChange={handleEmployerChange}
                        placeholder="Enter contact email"
                        className={styles.formInput}
                        aria-describedby={formErrors.contact_email ? "contact_email-error" : undefined}
                      />
                      {formErrors.contact_email && (
                        <span id="contact_email-error" className={styles.errorMessage}>
                          {formErrors.contact_email}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="location" className={styles.formLabel}>
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={employerForm.location}
                        onChange={handleEmployerChange}
                        placeholder="e.g., Addis Ababa, Ethiopia"
                        className={styles.formInput}
                        aria-describedby={formErrors.location ? "location-error" : undefined}
                      />
                      {formErrors.location && (
                        <span id="location-error" className={styles.errorMessage}>
                          {formErrors.location}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Company Description</h3>
                  <div className={styles.formGroup}>
                    <textarea
                      id="description"
                      name="description"
                      value={employerForm.description}
                      onChange={handleEmployerChange}
                      placeholder="Tell us about your company"
                      className={styles.formTextarea}
                      rows="6"
                      aria-describedby={formErrors.description ? "description-error" : undefined}
                    />
                    {formErrors.description && (
                      <span id="description-error" className={styles.errorMessage}>
                        {formErrors.description}
                      </span>
                    )}
                  </div>
                </section>
              </>
            )}

            <div className={styles.formActions}>
              <Button
                type="submit"
                variant="primary"
                disabled={status === "loading"}
                className={styles.saveButton}
                icon={status === "loading" ? null : <FiSave />}
              >
                {status === "loading" ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                variant="secondary"
                className={styles.cancelButton}
                icon={<FiX />}
              >
                Cancel
              </Button>
            </div>

            {error && (
              <div className={styles.formMessage}>
                <p className={styles.errorMessage}>{error?.message || error}</p>
              </div>
            )}
            {status === "succeeded" && !error && (
              <div className={styles.formMessage}>
                <p className={styles.successMessage}>Profile updated successfully!</p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;