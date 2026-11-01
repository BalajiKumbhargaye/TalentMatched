const { extractSkillsFromText } = require('./resumeParser');

// Curated learning pathways and actionable tips for popular skills
const SKILL_LEARNING_GUIDES = {
  'TypeScript': {
    focus: 'Static typing, interfaces, generics, type guards, and TSConfig in React/Node apps',
    project: 'Migrate a standard JS React/Express app to strict TypeScript with typed API endpoints',
  },
  'Docker': {
    focus: 'Dockerfiles, containerization, multi-stage builds, port mapping, and Docker Compose',
    project: 'Containerize a full-stack MERN application with Docker Compose for local orchestration',
  },
  'Kubernetes': {
    focus: 'Pods, Deployments, Services, ConfigMaps, Ingress, and basic helm charts',
    project: 'Deploy a microservices app to a local Minikube cluster with auto-scaling',
  },
  'AWS': {
    focus: 'EC2, S3 bucket management, IAM policies, Lambda serverless, and RDS/DocumentDB',
    project: 'Deploy a Node.js backend to AWS Elastic Beanstalk / App Runner with S3 asset storage',
  },
  'GraphQL': {
    focus: 'Schemas, queries, mutations, resolvers, Apollo Server, and caching with Apollo Client',
    project: 'Build a GraphQL API layer on top of MongoDB with nested relationship resolvers',
  },
  'Next.js': {
    focus: 'Server-Side Rendering (SSR), Static Site Generation (SSG), App Router, and Server Actions',
    project: 'Build an SEO-optimized blog or e-commerce dashboard using Next.js App Router',
  },
  'PostgreSQL': {
    focus: 'Relational data modeling, foreign keys, indexing, joins, transactions, and Prisma/TypeORM',
    project: 'Design an ACID-compliant order processing database schema with complex queries',
  },
  'Redis': {
    focus: 'In-memory caching, Pub/Sub, session storage, rate limiting, and Redis data types',
    project: 'Implement API response caching and JWT token blocklisting with Redis in Express',
  },
  'CI/CD': {
    focus: 'Automated test runners, build pipelines, GitHub Actions workflows, and branch protections',
    project: 'Create a GitHub Actions workflow that runs linting, tests, and auto-deploys on push',
  },
  'Jest': {
    focus: 'Unit testing, mocking modules, async testing, test coverage reports, and supertest',
    project: 'Achieve 85%+ test coverage on an Express REST API using Jest and Supertest',
  },
  'System Design': {
    focus: 'Scalability, load balancers, caching strategies, database sharding, and CAP theorem',
    project: 'Design an architecture diagram for an URL shortener or real-time chat service',
  },
  'React': {
    focus: 'Hooks (useState, useEffect, useMemo), Context API, Custom Hooks, component lifecycle',
    project: 'Build an interactive dashboard with state management, debounce search, and dark mode',
  },
  'Node.js': {
    focus: 'Event loop, asynchronous programming, streams, file system, buffer, and process management',
    project: 'Build an asynchronous streaming file upload processor with progress tracking',
  },
  'MongoDB': {
    focus: 'Document modeling, aggregation pipelines, schema validation, indexing, and Mongoose hooks',
    project: 'Write high-performance aggregation pipelines for analytics and reporting queries',
  },
  'Python': {
    focus: 'Data structures, list comprehensions, decorators, generators, virtual environments, and OOP',
    project: 'Build an automated web scraping pipeline or data processing utility script',
  },
  'Machine Learning': {
    focus: 'Supervised/unsupervised algorithms, model evaluation (F1/ROC-AUC), Scikit-Learn pipelines',
    project: 'Train and deploy a classification model via a FastAPI REST endpoint',
  },
};

/**
 * Normalizes a skill string for comparison (lowercase, trimmed, strip hyphens/spaces)
 */
const normalize = (skill) => {
  if (!skill) return '';
  return skill.toLowerCase().replace(/[\s\-_.]/g, '');
};

/**
 * Calculates skill matching score between student profile and job requirements
 * @param {Array<string>} studentSkills - Array of skills from student profile
 * @param {Array<string>} requiredSkills - Array of required skills from job post
 * @param {string} jobDescription - Job description text
 * @returns {object} Matching metrics, missing skills, and improvement roadmap
 */
const calculateSkillMatch = (studentSkills = [], requiredSkills = [], jobDescription = '') => {
  const normStudentSkills = new Map(
    (studentSkills || []).map((s) => [normalize(s), s])
  );

  const matchedSkills = [];
  const missingSkills = [];

  // 1. Check primary required skills
  if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
    for (const reqSkill of requiredSkills) {
      const normReq = normalize(reqSkill);
      let matched = false;

      // Exact normalized match or substring inclusion
      for (const [normStu, origStu] of normStudentSkills.entries()) {
        if (normStu === normReq || normStu.includes(normReq) || normReq.includes(normStu)) {
          matchedSkills.push(reqSkill);
          matched = true;
          break;
        }
      }

      if (!matched) {
        missingSkills.push(reqSkill);
      }
    }
  }

  // 2. Base match percentage based on required skills
  const totalRequired = requiredSkills.length;
  let matchPercentage = 0;

  if (totalRequired === 0) {
    matchPercentage = 100;
  } else {
    const rawScore = (matchedSkills.length / totalRequired) * 100;

    // Bonus points: Check if student has other skills mentioned in the job description!
    const descSkills = extractSkillsFromText(jobDescription);
    let descBonus = 0;
    if (descSkills.length > 0) {
      for (const dSkill of descSkills) {
        const normD = normalize(dSkill);
        // If not already in required skills but student has it
        if (!requiredSkills.some((r) => normalize(r) === normD)) {
          if (normStudentSkills.has(normD)) {
            descBonus += 2; // small bonus per bonus skill mentioned in description
          }
        }
      }
    }

    matchPercentage = Math.min(100, Math.round(rawScore + Math.min(descBonus, 10)));
  }

  // 3. 85% Threshold Check
  const isEligible = matchPercentage >= 85;

  // 4. Generate Targeted Improvement Guidance if < 85%
  const improvementAreas = [];
  const improvementSuggestions = [];

  if (!isEligible) {
    // Number of additional skills required to reach 85%
    const neededCount = Math.max(1, Math.ceil(0.85 * totalRequired) - matchedSkills.length);

    improvementAreas.push({
      type: 'summary',
      message: `You currently match ${matchPercentage}% of the requirements. To reach the 85% application threshold, you need to master at least ${neededCount} more required skill${neededCount > 1 ? 's' : ''}.`,
    });

    for (const missing of missingSkills) {
      const guide = SKILL_LEARNING_GUIDES[missing] || {
        focus: `Deep-dive into core concepts, best practices, and standard patterns of ${missing}.`,
        project: `Build a portfolio project demonstrating hands-on integration of ${missing}.`,
      };

      improvementSuggestions.push({
        skill: missing,
        priority: 'High',
        coreTopics: guide.focus,
        recommendedProject: guide.project,
        impact: `Adding this skill will boost your match score by +${Math.round((1 / totalRequired) * 100)}%!`,
      });
    }
  }

  return {
    matchPercentage,
    isEligible,
    threshold: 85,
    totalRequired,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,
    matchedSkills,
    missingSkills,
    improvementAreas,
    improvementSuggestions,
  };
};

module.exports = {
  calculateSkillMatch,
  SKILL_LEARNING_GUIDES,
};
