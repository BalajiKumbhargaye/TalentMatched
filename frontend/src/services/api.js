// API Base URL - Connects to deployed Render backend in production or VITE_API_URL if provided
const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://talentmatched.onrender.com' : '');

export const BACKEND_URL = API_ORIGIN ? API_ORIGIN.replace(/\/+$/, '') : (import.meta.env.PROD ? 'https://talentmatched.onrender.com' : 'http://localhost:5000');
export const BASE_URL = API_ORIGIN ? `${API_ORIGIN.replace(/\/+$/, '')}/api` : '/api';

/**
 * Helper to get full URL for uploaded files (resumes)
 */
export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};


/**
 * Helper to get authorization headers
 */
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Generic request helper
 */
const request = async (endpoint, options = {}) => {
  const isMultipart = options.body instanceof FormData;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(isMultipart),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ==========================================
// Authentication Endpoints
// ==========================================
export const loginUser = (credentials) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const registerUser = (userData) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const getMe = () => request('/auth/me');

// ==========================================
// Student Profile Endpoints
// ==========================================
export const getStudentProfile = () => request('/profile');

export const updateStudentProfile = (profileData) =>
  request('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

export const uploadStudentResume = (formData) =>
  request('/profile/resume', {
    method: 'POST',
    body: formData,
  });

export const addStudentSkill = (skill) =>
  request('/profile/skills', {
    method: 'POST',
    body: JSON.stringify({ skill }),
  });

export const removeStudentSkill = (skillName) =>
  request(`/profile/skills/${encodeURIComponent(skillName)}`, {
    method: 'DELETE',
  });

// ==========================================
// Jobs Endpoints
// ==========================================
export const fetchJobs = (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.domain && params.domain !== 'All Domains') query.append('domain', params.domain);
  if (params.role) query.append('role', params.role);
  if (params.jobType && params.jobType !== 'All') query.append('jobType', params.jobType);
  if (params.onlyEligible) query.append('onlyEligible', 'true');
  if (params.status) query.append('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/jobs${qs}`);
};

export const fetchJobById = (id) => request(`/jobs/${id}`);

export const createJobOpening = (jobData) =>
  request('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });

export const updateJobOpening = (id, jobData) =>
  request(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  });

export const deleteJobOpening = (id) =>
  request(`/jobs/${id}`, {
    method: 'DELETE',
  });

export const fetchRecruiterJobs = () => request('/jobs/recruiter/my-jobs');

// ==========================================
// Applications Endpoints
// ==========================================
export const applyForJob = (jobId) =>
  request(`/applications/apply/${jobId}`, {
    method: 'POST',
  });

export const fetchStudentApplications = () => request('/applications/student');

export const fetchRecruiterApplicants = (jobId) => {
  const qs = jobId ? `?jobId=${jobId}` : '';
  return request(`/applications/recruiter${qs}`);
};

export const updateApplicantStatus = (applicationId, status, recruiterNotes) =>
  request(`/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, recruiterNotes }),
  });
