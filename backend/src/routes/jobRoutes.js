const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

// New route for recommended jobs
router.get('/recommended', authMiddleware('job_seeker'), jobController.getRecommendedJobs);

router.get("/", jobController.getJobs); // Public route for job seekers
router.get("/employer", authMiddleware("employer"), jobController.getJobsByEmployer);
router.get("/:slug", jobController.getJobBySlug);
router.post("/:slug/apply", authMiddleware("job_seeker"), jobController.applyForJob);
// Removed: router.get("/:jobId/applicants", authMiddleware("employer"), jobController.getApplicationsByJobId);
router.post("/", authMiddleware("employer"), jobController.createJob);
router.put("/:slug", authMiddleware("employer"), jobController.updateJob);
router.put("/:jobId/archive", authMiddleware("employer"), jobController.archiveJob);
router.put("/:jobId/restore", authMiddleware("employer"), jobController.restoreJob);
router.post("/:jobId/duplicate", authMiddleware("employer"), jobController.duplicateJob);

module.exports = router;