const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentmatch';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing users, jobs, and applications.');

    // 1. Create Recruiter
    const recruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.example.com',
      designation: 'Lead Technical Recruiter',
      phone: '+1 (555) 234-5678',
      bio: 'Hiring top tier engineering talent across Fullstack, Cloud, and AI.',
    });

    // 2. Create Student
    const student = await User.create({
      name: 'Alex Rivera',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      phone: '+1 (555) 876-5432',
      bio: 'Passionate computer science graduate eager to build modern scalable web applications.',
      education: {
        degree: 'B.Tech in Computer Science',
        college: 'Apex Institute of Technology',
        graduationYear: 2026,
      },
      experienceLevel: 'Fresher',
      skills: [
        'React',
        'Node.js',
        'Express',
        'MongoDB',
        'JavaScript',
        'HTML5',
        'CSS3',
        'Git',
        'REST APIs',
      ],
    });

    console.log('Created sample Recruiter and Student accounts.');

    // 3. Create Sample Jobs
    const oneMonthAhead = new Date();
    oneMonthAhead.setDate(oneMonthAhead.getDate() + 30);

    const jobs = [
      {
        title: 'Fullstack MERN Developer',
        company: 'TechCorp Solutions',
        recruiter: recruiter._id,
        domain: 'Fullstack',
        role: 'Fullstack Engineer',
        jobType: 'Full-Time',
        location: 'Remote (US/Global)',
        salary: '$85,000 - $115,000 / yr',
        description:
          'We are seeking a talented Fullstack Developer to join our core product team. You will build and scale high-performance web applications using MongoDB, Express, React, and Node.js. Experience building REST APIs, managing database schemas, and working with modern React components is essential.',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
        deadline: oneMonthAhead,
        maxPositions: 3,
        filledPositions: 0,
        status: 'Active',
      },
      {
        title: 'Junior Frontend Web Developer',
        company: 'StartupLab Innovations',
        recruiter: recruiter._id,
        domain: 'Frontend',
        role: 'Frontend Developer',
        jobType: 'Full-Time',
        location: 'Hybrid - New York, NY',
        salary: '$70,000 - $90,000 / yr',
        description:
          'StartupLab is hiring a Junior Frontend Developer to craft interactive user interfaces. You will work closely with product designers to implement clean, responsive components using React, modern JavaScript (ES6+), HTML5, and CSS3.',
        requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
        deadline: oneMonthAhead,
        maxPositions: 2,
        filledPositions: 0,
        status: 'Active',
      },
      {
        title: 'Frontend React & Next.js Specialist',
        company: 'PixelWave Studios',
        recruiter: recruiter._id,
        domain: 'Frontend',
        role: 'Senior Frontend Developer',
        jobType: 'Full-Time',
        location: 'Remote',
        salary: '$95,000 - $130,000 / yr',
        description:
          'Looking for a passionate frontend engineer with deep expertise in Next.js, TypeScript, and modern styling libraries like Tailwind CSS. You will architect accessible, SSR-driven applications with high Lighthouse performance scores.',
        requiredSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
        deadline: oneMonthAhead,
        maxPositions: 2,
        filledPositions: 0,
        status: 'Active',
      },
      {
        title: 'Backend Node.js & Microservices Engineer',
        company: 'FinEdge Systems',
        recruiter: recruiter._id,
        domain: 'Backend',
        role: 'Backend Developer',
        jobType: 'Full-Time',
        location: 'Austin, TX (Remote Available)',
        salary: '$90,000 - $125,000 / yr',
        description:
          'Join our fintech backend engineering team to develop resilient microservices handling high-throughput financial transactions. Requires strong knowledge of Node.js, Express, Docker containerization, Redis caching, and MongoDB optimization.',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis', 'REST APIs'],
        deadline: oneMonthAhead,
        maxPositions: 1,
        filledPositions: 0,
        status: 'Active',
      },
      {
        title: 'Cloud & DevOps Platform Engineer',
        company: 'CloudSphere Infrastructure',
        recruiter: recruiter._id,
        domain: 'DevOps & Cloud',
        role: 'DevOps Engineer',
        jobType: 'Full-Time',
        location: 'Remote',
        salary: '$110,000 - $145,000 / yr',
        description:
          'Design and maintain our Kubernetes-based cloud infrastructure across AWS. You will implement CI/CD deployment pipelines using GitHub Actions, infrastructure as code with Terraform, and ensure 99.99% service availability.',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
        deadline: oneMonthAhead,
        maxPositions: 2,
        filledPositions: 0,
        status: 'Active',
      },
      {
        title: 'AI / Machine Learning Engineer',
        company: 'DataMatrix Labs',
        recruiter: recruiter._id,
        domain: 'AI & Machine Learning',
        role: 'ML Engineer',
        jobType: 'Full-Time',
        location: 'San Francisco, CA (Hybrid)',
        salary: '$120,000 - $160,000 / yr',
        description:
          'Develop predictive analytics models and generative AI integrations. You should have strong proficiency in Python, PyTorch/TensorFlow, Scikit-Learn, and experience deploying machine learning models into production REST APIs.',
        requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science'],
        deadline: oneMonthAhead,
        maxPositions: 1,
        filledPositions: 0,
        status: 'Active',
      },
    ];

    await Job.insertMany(jobs);
    console.log(`Created ${jobs.length} realistic jobs across multiple domains.`);

    console.log('\n--- SEED COMPLETED SUCCESSFULLY ---');
    console.log('Recruiter: recruiter@techcorp.com / password123');
    console.log('Student:   student@example.com / password123');
    console.log('------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
