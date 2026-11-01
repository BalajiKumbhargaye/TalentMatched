const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  addSkill,
  removeSkill,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All profile endpoints are for students
router.use(protect);
router.use(authorize('student'));

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/skills', addSkill);
router.delete('/skills/:skillName', removeSkill);

module.exports = router;
