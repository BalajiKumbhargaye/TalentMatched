const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { parseResume } = require('../utils/resumeParser');

// @desc    Get student profile
// @route   GET /api/profile
// @access  Private (Student)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
};

// @desc    Update student profile details
// @route   PUT /api/profile
// @access  Private (Student)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, education, experienceLevel, skills } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (education) user.education = education;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (Array.isArray(skills)) user.skills = Array.from(new Set(skills));

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

// @desc    Upload resume, auto-extract skills, and attach to student profile
// @route   POST /api/profile/resume
// @access  Private (Student)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or TXT).',
      });
    }

    const buffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : null);
    if (!buffer) {
      return res.status(400).json({ success: false, message: 'Could not read file buffer.' });
    }
    const mimeType = req.file.mimetype;

    // Parse resume and extract skills automatically
    const parseResult = await parseResume(buffer, mimeType);
    const extractedSkills = parseResult.skills;

    // Get current student
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge extracted skills with existing skills (case-insensitive deduplication)
    const existingLower = new Set((user.skills || []).map((s) => s.toLowerCase()));
    const mergedSkills = [...(user.skills || [])];

    for (const skill of extractedSkills) {
      if (!existingLower.has(skill.toLowerCase())) {
        mergedSkills.push(skill);
        existingLower.add(skill.toLowerCase());
      }
    }

    // Save uploaded file relative URL and updated skills
    user.skills = mergedSkills;
    
    // Safely determine resume filename and path
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (e) {}
    }

    const ext = path.extname(req.file.originalname) || '.pdf';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const resumeFileName = req.file.filename || `resume-${uniqueSuffix}${ext}`;

    // If file was uploaded to memory, save to uploads if writable
    if (req.file.buffer && !req.file.path) {
      try {
        const destPath = path.join(uploadDir, resumeFileName);
        fs.writeFileSync(destPath, buffer);
        user.resumeUrl = `/uploads/${resumeFileName}`;
      } catch (writeErr) {
        // Fallback for strictly read-only serverless environments
        user.resumeUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    } else {
      user.resumeUrl = `/uploads/${resumeFileName}`;
    }

    user.resumeOriginalName = req.file.originalname;
    user.resumeUploadedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: `Resume parsed successfully! Extracted ${extractedSkills.length} skills.`,
      extractedSkills,
      allSkills: user.skills,
      resumeUrl: user.resumeUrl,
      resumeOriginalName: user.resumeOriginalName,
      user,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process and parse resume.',
    });
  }
};

// @desc    Add single skill manually to profile
// @route   POST /api/profile/skills
// @access  Private (Student)
exports.addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid skill name.' });
    }

    const user = await User.findById(req.user._id);
    const trimmed = skill.trim();

    if (!user.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      user.skills.push(trimmed);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Skill added.',
      skills: user.skills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add skill.' });
  }
};

// @desc    Remove skill manually from profile
// @route   DELETE /api/profile/skills/:skillName
// @access  Private (Student)
exports.removeSkill = async (req, res) => {
  try {
    const skillName = decodeURIComponent(req.params.skillName);
    const user = await User.findById(req.user._id);

    user.skills = user.skills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed.',
      skills: user.skills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove skill.' });
  }
};
