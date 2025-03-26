# Ethiopian Job Search

A web-based job search platform for Ethiopia with AI-driven job matching, real-time notifications, and application tracking.

## Structure
- `/backend`: Node.js + Express backend
- `/frontend`: React frontend with Vite
- `/admin`: Admin panel (to be developed)

## Setup
1. Clone the repo: `git clone https://github.com/Adnan7389/ethiopian-job-search.git`
2. Backend: `cd backend && npm install && npm run dev`
3. Frontend: `cd frontend && npm install && npm run dev`

## Database Optimization
- Indexes added to `applicants` table for performance:
  - `idx_job_id`: Optimizes queries by `job_id`.
  - `idx_job_seeker_id`: Optimizes queries by `job_seeker_id`.
- Run in MySQL: 
  ```sql
  CREATE INDEX idx_job_id ON applicants(job_id);
  CREATE INDEX idx_job_seeker_id ON applicants(job_seeker_id);