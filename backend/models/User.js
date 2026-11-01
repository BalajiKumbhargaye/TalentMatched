const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'recruiter'],
      default: 'student',
    },
    // Student-specific fields
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    education: {
      degree: { type: String, default: '' },
      college: { type: String, default: '' },
      graduationYear: { type: Number },
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Intern', '1-2 Years', '3-5 Years', '5+ Years'],
      default: 'Fresher',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: { type: String, default: '' },
    resumeOriginalName: { type: String, default: '' },
    resumeUploadedAt: { type: Date },

    // Recruiter-specific fields
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    designation: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
