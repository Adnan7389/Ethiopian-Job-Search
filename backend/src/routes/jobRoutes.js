const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/employer", authMiddleware, jobController.getEmployerJobs);
router.get("/:slug", jobController.getJobBySlug);
router.post("/", authMiddleware, jobController.createJob);
router.put("/:slug", authMiddleware, jobController.updateJob);
router.put("/:jobId/archive", authMiddleware, jobController.archiveJob);
router.put("/:jobId/restore", authMiddleware, jobController.restoreJob);
router.post("/:jobId/duplicate", authMiddleware, jobController.duplicateJob);

module.exports = router;