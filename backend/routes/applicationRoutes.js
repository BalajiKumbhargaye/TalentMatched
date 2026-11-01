const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getStudentApplications,
  getRecruiterApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Student application endpoints
router.post('/apply/:jobId', protect, authorize('student'), applyToJob);
router.get('/student', protect, authorize('student'), getStudentApplications);

// Recruiter applicant management endpoints
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplicants);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
