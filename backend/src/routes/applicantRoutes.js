const express = require("express");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/apply", authMiddleware("job_seeker"), applicantController.applyForJob);
router.put("/:applicant_id", authMiddleware("job_seeker"), applicantController.updateApplication);
router.delete("/:applicant_id", authMiddleware("job_seeker"), applicantController.deleteApplication);
router.get("/:jobId/applicants", authMiddleware("employer"), applicantController.getApplicationsByJobId);
router.get("/qualified/:jobId", authMiddleware("employer"), applicantController.getQualifiedApplicationsByJobId);

module.exports = router;