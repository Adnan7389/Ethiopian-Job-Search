// frontend/src/services/applicationService.js
import api from './api'; // Assuming you already have an Axios instance in api.js

// Get qualified applicants for a specific job
export const getApplicantsByJob = async (jobId, page = 1, limit = 20) => {
    const response = await api.get(`/applicants/qualified/${jobId}?page=${page}&limit=${limit}`);
    return response.data;
};

export const scheduleInterview = async (applicantId, details) => {
    const response = await api.put(`/applications/${applicantId}/schedule`, details);
    return response.data; // { message, status: 'scheduled' }
};

// Update applicant's status (e.g., shortlist, reject, interview, accept)
export const updateApplicantStatus = async (applicantId, newStatus) => {
    const body = { status: newStatus };
    // if (interviewDate) {
    //   body.interview_date = interviewDate;
    // }
    const response = await api.put(`/applications/${applicantId}/status`, body);
    return response.data;
};

