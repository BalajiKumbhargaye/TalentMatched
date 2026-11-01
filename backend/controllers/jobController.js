const Job = require('../models/Job');
const Application = require('../models/Application');
const { calculateSkillMatch } = require('../utils/skillMatcher');

// @desc    Get all job openings with search, filters, and student match scores
// @route   GET /api/jobs
// @access  Public / Optional Auth
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      domain,
      role,
      jobType,
      onlyEligible,
      status = 'Active',
    } = req.query;

    const query = {};

    // Filter by status (default: Active)
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by domain
    if (domain && domain !== 'All Domains') {
      query.domain = domain;
    }

    // Filter by role
    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    // Filter by jobType
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    // Search keyword across title, company, description, or requiredSkills
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { role: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Fetch jobs populated with recruiter info
    let jobs = await Job.find(query)
      .populate('recruiter', 'name companyName email')
      .sort({ createdAt: -1 });

    // If a student is logged in, calculate match score and application status for each job
    if (req.user && req.user.role === 'student') {
      const studentSkills = req.user.skills || [];

      // Fetch student's existing applications
      const studentApplications = await Application.find({
        student: req.user._id,
      }).select('job status');

      const appliedJobMap = new Map();
      studentApplications.forEach((app) => {
        appliedJobMap.set(app.job.toString(), app.status);
      });

      jobs = jobs.map((job) => {
        const jobObj = job.toObject();
        const matchData = calculateSkillMatch(
          studentSkills,
          job.requiredSkills,
          job.description
        );

        jobObj.matchScore = matchData;
        jobObj.hasApplied = appliedJobMap.has(job._id.toString());
        jobObj.applicationStatus = appliedJobMap.get(job._id.toString()) || null;
        return jobObj;
      });

      // Filter by only eligible jobs if requested
      if (onlyEligible === 'true') {
        jobs = jobs.filter((j) => j.matchScore && j.matchScore.isEligible);
      }
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs.',
    });
  }
};

// @desc    Get single job by ID with detailed match breakdown
// @route   GET /api/jobs/:id
// @access  Public / Optional Auth
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter',
      'name companyName companyWebsite email'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    const jobObj = job.toObject();

    if (req.user && req.user.role === 'student') {
      const matchData = calculateSkillMatch(
        req.user.skills || [],
        job.requiredSkills,
        job.description
      );
      jobObj.matchScore = matchData;

      const application = await Application.findOne({
        job: job._id,
        student: req.user._id,
      });

      jobObj.hasApplied = !!application;
      jobObj.applicationStatus = application ? application.status : null;
    }

    res.status(200).json({
      success: true,
      job: jobObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job details.',
    });
  }
};

// @desc    Create a new job opening
// @route   POST /api/jobs
// @access  Private (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      domain,
      role,
      jobType,
      location,
      salary,
      description,
      requiredSkills,
      deadline,
      maxPositions,
    } = req.body;

    // Normalize required skills
    let skillsArray = [];
    if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof requiredSkills === 'string') {
      skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (!skillsArray.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one required skill for the job.',
      });
    }

    const newJob = await Job.create({
      title,
      company: company || req.user.companyName || 'Tech Innovations Inc.',
      recruiter: req.user._id,
      domain: domain || 'Fullstack',
      role,
      jobType: jobType || 'Full-Time',
      location: location || 'Remote',
      salary: salary || 'Competitive',
      description,
      requiredSkills: skillsArray,
      deadline: new Date(deadline),
      maxPositions: parseInt(maxPositions, 10) || 1,
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Job opening created successfully!',
      job: newJob,
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create job opening.',
    });
  }
};

// @desc    Update existing job opening
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only - Job owner)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job opening.',
      });
    }

    const {
      title,
      company,
      domain,
      role,
      jobType,
      location,
      salary,
      description,
      requiredSkills,
      deadline,
      maxPositions,
      status,
    } = req.body;

    if (title) job.title = title;
    if (company) job.company = company;
    if (domain) job.domain = domain;
    if (role) job.role = role;
    if (jobType) job.jobType = jobType;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (description) job.description = description;

    if (requiredSkills) {
      let skillsArray = Array.isArray(requiredSkills)
        ? requiredSkills.map((s) => s.trim()).filter(Boolean)
        : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        job.requiredSkills = skillsArray;
      }
    }

    if (deadline) job.deadline = new Date(deadline);
    if (maxPositions) job.maxPositions = parseInt(maxPositions, 10);
    if (status) job.status = status;

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job opening updated successfully.',
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job opening.',
    });
  }
};

// @desc    Delete job opening (if date gone, positions fulfilled, or recruiter action)
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only - Job owner)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job opening.',
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });

    // Delete job
    await Job.findByIdAndDelete(job._id);

    res.status(200).json({
      success: true,
      message: 'Job opening and associated applications deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete job opening.',
    });
  }
};

// @desc    Get all jobs posted by current recruiter with stats
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter only)
exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({
      createdAt: -1,
    });

    // Populate applicant statistics for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        const totalApplications = await Application.countDocuments({
          job: job._id,
        });
        const shortlistedCount = await Application.countDocuments({
          job: job._id,
          status: 'Shortlisted',
        });
        const acceptedCount = await Application.countDocuments({
          job: job._id,
          status: 'Accepted',
        });

        jobObj.applicantCount = totalApplications;
        jobObj.shortlistedCount = shortlistedCount;
        jobObj.acceptedCount = acceptedCount;

        // Auto check if expired
        jobObj.isExpired = new Date() > new Date(job.deadline);
        jobObj.isFullyFilled = job.filledPositions >= job.maxPositions;

        return jobObj;
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithStats.length,
      jobs: jobsWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recruiter jobs.',
    });
  }
};
