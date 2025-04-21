const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for applicant-related actions
router.post("/apply", authMiddleware("job_seeker"), applicantController.applyForJob);
router.put("/:applicant_id", authMiddleware("job_seeker"), applicantController.updateApplication);
router.delete("/:applicant_id", authMiddleware("job_seeker"), applicantController.deleteApplication);

// Fix: Use applicantController.getApplicationsByJobId
router.get("/:jobId/applicants", authMiddleware("employer"), applicantController.getApplicationsByJobId);

module.exports = router;