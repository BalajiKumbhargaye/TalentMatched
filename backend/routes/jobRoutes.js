const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} = require('../controllers/jobController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/', optionalAuth, getJobs);
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);

router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
