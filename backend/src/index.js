const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');
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