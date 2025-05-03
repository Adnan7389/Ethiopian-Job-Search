const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');
const cron = require("node-cron");
const { initSocket } = require('./socket');
const jwt = require('jsonwebtoken');
const Job = require('./models/jobModel');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
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

// Handle OPTIONS requests explicitly
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Handling OPTIONS request for ${req.url}`);
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    console.log(`[${new Date().toISOString()}] OPTIONS ${req.url} - Status: 200`);
    return;
  }
  console.log(`[${new Date().toISOString()}] Middleware: OPTIONS handler passed for ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Middleware: CORS passed for ${req.url}`);
  next();
});

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Middleware: express.json passed for ${req.url}`);
  next();
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Middleware: Static uploads passed for ${req.url}`);
  next();
});

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
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
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

const server = http.createServer(app);

const io = initSocket(server);

server.listen(PORT, () => {
   console.log(`🚀 Server and Socket.IO running on port ${PORT}`);
  });

// Set server timeout (60 seconds)
server.setTimeout(60000, (socket) => {
  const req = socket.parser?.incoming;
  console.log(`[${new Date().toISOString()}] Server timeout reached for ${req?.method || 'unknown'} ${req?.url || 'unknown'} - Socket state: ${socket.readyState}`);
});

server.keepAliveTimeout = 10000;

server.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] New socket connection`);
  socket.on('close', () => {
    console.log(`[${new Date().toISOString()}] Socket closed`);
  });
});