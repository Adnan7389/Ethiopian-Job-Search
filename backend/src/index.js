const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');
const cron = require("node-cron");
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const Job = require('./models/jobModel');
const notifications = require("./routes/notification");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log environment variables for debugging
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);

// Utility to wrap database queries with a timeout
const queryWithTimeout = async (query, params, timeout = 10000) => {
  const queryPromise = pool.query(query, params);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timed out')), timeout);
  });
  return Promise.race([queryPromise, timeoutPromise]);
};

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${res.statusCode}`);
  });
  next();
});

// Routes
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
    // Test database connection
    const [test] = await queryWithTimeout('SELECT 1', [], 5000);
    if (!test) {
      console.error("Cron job: Database connection failed, skipping job expiry task");
      return;
    }

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
    const [rows] = await queryWithTimeout('SELECT 1 + 1 AS result', [], 5000);
    res.json({ message: 'Database connected', result: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ethiopian Job Search API' });
});

// Catch-all route for unmatched routes
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Server error', details: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set server timeout (20 seconds)
server.setTimeout(20000, () => {
  console.log('Server timeout reached');
});