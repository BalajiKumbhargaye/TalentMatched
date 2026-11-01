const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please enter company name'],
      trim: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: [true, 'Please select a domain'],
      enum: [
        'Frontend',
        'Backend',
        'Fullstack',
        'Mobile Development',
        'DevOps & Cloud',
        'AI & Machine Learning',
        'Data Science',
        'Cybersecurity',
        'UI/UX Design',
        'QA & Testing',
        'Other',
      ],
      default: 'Fullstack',
    },
    role: {
      type: String,
      required: [true, 'Please specify the role'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote'],
      default: 'Full-Time',
    },
    location: {
      type: String,
      default: 'Remote',
    },
    salary: {
      type: String,
      default: 'Competitive',
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed job description'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please specify at least one required skill'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A job must have at least one required skill',
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify an application deadline date'],
    },
    maxPositions: {
      type: Number,
      required: [true, 'Please specify total positions/openings'],
      default: 1,
      min: 1,
    },
    filledPositions: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Filled'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if deadline has passed
jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

// Virtual to check if positions are filled
jobSchema.virtual('isFullyFilled').get(function () {
  return this.filledPositions >= this.maxPositions;
});

module.exports = mongoose.model('Job', jobSchema);
