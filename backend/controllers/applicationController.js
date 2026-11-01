const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { calculateSkillMatch } = require('../utils/skillMatcher');

// @desc    Apply to a job opening (Requires >= 85% skill match!)
// @route   POST /api/applications/apply/:jobId
// @access  Private (Student only)
exports.applyToJob = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    // Check if job is active
    if (job.status === 'Closed' || job.status === 'Filled') {
      return res.status(400).json({
        success: false,
        message: `This job opening is already ${job.status.toLowerCase()}. Applications are closed.`,
      });
    }

    // Check if deadline has passed
    if (new Date() > new Date(job.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this job has expired.',
      });
    }

    // Check if selections are fulfilled
    if (job.filledPositions >= job.maxPositions) {
      return res.status(400).json({
        success: false,
        message: 'All available positions for this role have been fulfilled.',
      });
    }

    // Check if student has already applied
    const existingApp = await Application.findOne({
      job: job._id,
      student: student._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.',
        application: existingApp,
      });
    }

    // Calculate Skill Match Score
    const matchData = calculateSkillMatch(
      student.skills || [],
      job.requiredSkills,
      job.description
    );

    // CRITICAL REQUIREMENT: Show apply option / allow apply ONLY when skills match >= 85%
    if (matchData.matchPercentage < 85) {
      return res.status(403).json({
        success: false,
        message: `Application rejected: Your skill match is ${matchData.matchPercentage}%. A minimum of 85% is required to apply.`,
        matchScore: matchData,
        improvementAreas: matchData.improvementAreas,
        improvementSuggestions: matchData.improvementSuggestions,
      });
    }

    // Create Application
    const application = await Application.create({
      job: job._id,
      student: student._id,
      recruiter: job.recruiter,
      matchPercentage: matchData.matchPercentage,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      status: 'Applied',
    });

    res.status(201).json({
      success: true,
      message: `Congratulations! Your ${matchData.matchPercentage}% skill match qualifies you for this role. Application submitted successfully!`,
      application,
      matchScore: matchData,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application.',
    });
  }
};

// @desc    Get all applications submitted by current student
// @route   GET /api/applications/student
// @access  Private (Student only)
exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        select: 'title company domain role location salary deadline status filledPositions maxPositions',
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.',
    });
  }
};

// @desc    Get all applicants for a recruiter's jobs
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter only)
exports.getRecruiterApplicants = async (req, res) => {
  try {
    const { jobId } = req.query;
    const filter = { recruiter: req.user._id };

    if (jobId) {
      filter.job = jobId;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'student',
        select: 'name email phone bio education skills experienceLevel resumeUrl resumeOriginalName',
      })
      .populate({
        path: 'job',
        select: 'title company domain role maxPositions filledPositions deadline status',
      })
      .sort({ matchPercentage: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applicants.',
    });
  }
};

// @desc    Update application status (Shortlist, Accept, Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify recruiter owns this job
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application.',
      });
    }

    const previousStatus = application.status;
    application.status = status;
    if (recruiterNotes !== undefined) {
      application.recruiterNotes = recruiterNotes;
    }

    await application.save();

    // If candidate is Accepted and wasn't previously accepted, increment filledPositions
    if (status === 'Accepted' && previousStatus !== 'Accepted') {
      const job = await Job.findById(application.job._id);
      if (job) {
        job.filledPositions += 1;
        if (job.filledPositions >= job.maxPositions) {
          job.status = 'Filled';
        }
        await job.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Candidate application status updated to '${status}'.`,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update application status.',
    });
  }
};
