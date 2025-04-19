const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');
const cron = require("node-cron");
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const Job = require('./models/jobModel');
const notifications = require("./routes/notification")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use("/api/notifications", notifications);

// Mock email sending function
const mockSendEmail = ({ to, subject, text }) => {
  console.log(`Mock Email Sent to ${to}:`, { subject, text });
};

// Schedule job expiry notifications (runs every hour)
cron.schedule("0 * * * *", async () => {
  try {
    const expiringJobs = await Job.findExpiringJobs();
    for (const job of expiringJobs) {
      console.log(`Sending notification for Job "${job.title}" (ID: ${job.job_id}) to employer ${job.email}`);
      mockSendEmail({
        to: job.email,
        subject: `Job Expiry Notification: ${job.title}`,
        text: `Dear Employer,\n\nYour job posting "${job.title}" (ID: ${job.job_id}) is set to expire on ${new Date(job.expires_at).toLocaleString()}. Please review or extend the posting if needed.\n\nBest regards,\nEthiopian Job Search Team`,
      });
    }
  } catch (error) {
    console.error("Error in job expiry notification task:", error.message);
  }
});

app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ethiopian Job Search API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});