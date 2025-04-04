const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');
const cron = require("node-cron");
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicantRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend
  credentials: true, // If you plan to use cookies or auth headers
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);

// Schedule job expiry notifications (runs every hour)
cron.schedule("0 * * * *", async () => {
  try {
    const expiringJobs = await Job.findExpiringJobs();
    for (const job of expiringJobs) {
      console.log(`Mock Notification: Job "${job.title}" (ID: ${job.job_id}) is expiring soon for employer ${job.email}`);
      // In production, send an email using nodemailer
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