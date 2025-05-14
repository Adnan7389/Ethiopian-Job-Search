const Queue = require('bull');
const applicantMatchingService = require('../services/applicantMatchingService');

const matchingQueue = new Queue('matching-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
});

matchingQueue.process('process-application', async (job) => {
  const { userId, jobId, resume_url } = job.data;
  return await applicantMatchingService.processJobApplication(userId, jobId, resume_url);
});

matchingQueue.process('process-profile-update', async (job) => {
  const { userId } = job.data;
  return await applicantMatchingService.invalidateCache('job_seeker', userId);
});

const queueApplicationProcessing = (userId, jobId, resume_url) => {
  return matchingQueue.add('process-application', { userId, jobId, resume_url }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

const queueProfileUpdate = (userId) => {
  return matchingQueue.add('process-profile-update', { userId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

module.exports = {
  queueApplicationProcessing,
  queueProfileUpdate,
};