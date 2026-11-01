const fs = require('fs');
const pdfParse = require('pdf-parse');

// Comprehensive Skill Taxonomy with aliases and canonical names
const SKILL_TAXONOMY = [
  // Programming Languages
  { canonical: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'es2015', 'ecmascript'] },
  { canonical: 'TypeScript', aliases: ['typescript', 'ts'] },
  { canonical: 'Python', aliases: ['python', 'py'] },
  { canonical: 'Java', aliases: ['java', 'core java', 'j2ee'] },
  { canonical: 'C++', aliases: ['c\\+\\+', 'cpp'] },
  { canonical: 'C#', aliases: ['c#', 'csharp', 'c-sharp'] },
  { canonical: 'C', aliases: ['\\bc\\b'] },
  { canonical: 'Go', aliases: ['\\bgolang\\b', '\\bgo\\s+language\\b'] },
  { canonical: 'Rust', aliases: ['rust'] },
  { canonical: 'PHP', aliases: ['php'] },
  { canonical: 'Ruby', aliases: ['ruby'] },
  { canonical: 'Swift', aliases: ['swift'] },
  { canonical: 'Kotlin', aliases: ['kotlin'] },
  { canonical: 'SQL', aliases: ['sql', 't-sql', 'pl/sql'] },
  { canonical: 'R', aliases: ['\\br\\s+language\\b', '\\br\\s+programming\\b'] },
  { canonical: 'HTML5', aliases: ['html5', 'html'] },
  { canonical: 'CSS3', aliases: ['css3', 'css'] },
  { canonical: 'Sass', aliases: ['sass', 'scss'] },
  { canonical: 'Bash', aliases: ['bash', 'shell script', 'shell scripting', 'powershell'] },

  // Frontend Frameworks & Libraries
  { canonical: 'React', aliases: ['react', 'react.js', 'reactjs'] },
  { canonical: 'Next.js', aliases: ['next.js', 'nextjs', 'next js'] },
  { canonical: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
  { canonical: 'Nuxt.js', aliases: ['nuxt', 'nuxt.js', 'nuxtjs'] },
  { canonical: 'Angular', aliases: ['angular', 'angularjs', 'angular.js'] },
  { canonical: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { canonical: 'Redux', aliases: ['redux', 'redux toolkit', 'rtk'] },
  { canonical: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { canonical: 'Bootstrap', aliases: ['bootstrap', 'bootstrap 5', 'bootstrap 4'] },
  { canonical: 'Material UI', aliases: ['material ui', 'mui', 'material-ui'] },
  { canonical: 'Chakra UI', aliases: ['chakra ui', 'chakra-ui'] },
  { canonical: 'Webpack', aliases: ['webpack'] },
  { canonical: 'Vite', aliases: ['vite', 'vitejs'] },

  // Backend Frameworks & Runtimes
  { canonical: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node'] },
  { canonical: 'Express', aliases: ['express', 'express.js', 'expressjs'] },
  { canonical: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { canonical: 'Django', aliases: ['django'] },
  { canonical: 'FastAPI', aliases: ['fastapi', 'fast-api'] },
  { canonical: 'Flask', aliases: ['flask'] },
  { canonical: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework'] },
  { canonical: 'ASP.NET', aliases: ['asp.net', '.net core', 'dotnet', 'dotnet core'] },
  { canonical: 'Ruby on Rails', aliases: ['ruby on rails', 'rails'] },
  { canonical: 'GraphQL', aliases: ['graphql', 'apollo graphql', 'apollo server', 'apollo client'] },
  { canonical: 'REST APIs', aliases: ['rest api', 'rest apis', 'restful api', 'restful apis', 'rest services'] },
  { canonical: 'Microservices', aliases: ['microservices', 'microservice architecture'] },
  { canonical: 'gRPC', aliases: ['grpc'] },
  { canonical: 'Socket.io', aliases: ['socket.io', 'websockets', 'websocket'] },

  // Databases & Storage
  { canonical: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongoose'] },
  { canonical: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'] },
  { canonical: 'MySQL', aliases: ['mysql'] },
  { canonical: 'SQLite', aliases: ['sqlite'] },
  { canonical: 'Redis', aliases: ['redis'] },
  { canonical: 'Cassandra', aliases: ['cassandra'] },
  { canonical: 'DynamoDB', aliases: ['dynamodb', 'dynamo db'] },
  { canonical: 'Firebase', aliases: ['firebase', 'firestore'] },
  { canonical: 'Supabase', aliases: ['supabase'] },
  { canonical: 'Elasticsearch', aliases: ['elasticsearch', 'elk stack'] },
  { canonical: 'Prisma', aliases: ['prisma', 'prisma orm'] },
  { canonical: 'Sequelize', aliases: ['sequelize'] },

  // Cloud & DevOps
  { canonical: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { canonical: 'Google Cloud (GCP)', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonical: 'Docker', aliases: ['docker', 'docker container', 'dockerfile'] },
  { canonical: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'CI/CD', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
  { canonical: 'Jenkins', aliases: ['jenkins'] },
  { canonical: 'GitHub Actions', aliases: ['github actions', 'gh actions'] },
  { canonical: 'GitLab CI', aliases: ['gitlab ci'] },
  { canonical: 'Terraform', aliases: ['terraform'] },
  { canonical: 'Ansible', aliases: ['ansible'] },
  { canonical: 'Nginx', aliases: ['nginx'] },
  { canonical: 'Linux', aliases: ['linux', 'ubuntu', 'debian', 'centos'] },

  // AI / ML / Data Science
  { canonical: 'Machine Learning', aliases: ['machine learning', '\\bml\\b'] },
  { canonical: 'Deep Learning', aliases: ['deep learning', '\\bdl\\b'] },
  { canonical: 'Artificial Intelligence', aliases: ['artificial intelligence', '\\bai\\b'] },
  { canonical: 'Data Science', aliases: ['data science', 'data analytics', 'data analysis'] },
  { canonical: 'NLP', aliases: ['nlp', 'natural language processing'] },
  { canonical: 'Computer Vision', aliases: ['computer vision', 'opencv'] },
  { canonical: 'TensorFlow', aliases: ['tensorflow', 'tf'] },
  { canonical: 'PyTorch', aliases: ['pytorch', 'torch'] },
  { canonical: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
  { canonical: 'Pandas', aliases: ['pandas'] },
  { canonical: 'NumPy', aliases: ['numpy'] },
  { canonical: 'Matplotlib', aliases: ['matplotlib', 'seaborn'] },
  { canonical: 'Generative AI', aliases: ['generative ai', 'genai', 'llm', 'llms', 'large language models'] },
  { canonical: 'HuggingFace', aliases: ['huggingface', 'transformers'] },
  { canonical: 'Tableau', aliases: ['tableau'] },
  { canonical: 'Power BI', aliases: ['power bi', 'powerbi'] },

  // CS Fundamentals & Methodologies
  { canonical: 'Data Structures', aliases: ['data structures', 'dsa'] },
  { canonical: 'Algorithms', aliases: ['algorithms', 'algorithm design'] },
  { canonical: 'Object-Oriented Programming (OOP)', aliases: ['oop', 'oops', 'object-oriented programming'] },
  { canonical: 'System Design', aliases: ['system design', 'distributed systems'] },
  { canonical: 'Design Patterns', aliases: ['design patterns'] },
  { canonical: 'Agile/Scrum', aliases: ['agile', 'scrum', 'kanban'] },
  { canonical: 'Git', aliases: ['git', 'version control'] },
  { canonical: 'GitHub', aliases: ['github'] },
  { canonical: 'GitLab', aliases: ['gitlab'] },
  { canonical: 'Bitbucket', aliases: ['bitbucket'] },
  { canonical: 'Postman', aliases: ['postman'] },
  { canonical: 'Jira', aliases: ['jira'] },

  // Mobile & Cross-Platform
  { canonical: 'React Native', aliases: ['react native', 'react-native'] },
  { canonical: 'Flutter', aliases: ['flutter', 'dart'] },
  { canonical: 'Android Development', aliases: ['android sdk', 'android app development', 'android studio'] },
  { canonical: 'iOS Development', aliases: ['ios development', 'xcode', 'cocoapods'] },

  // Testing & Quality Assurance
  { canonical: 'Jest', aliases: ['jest'] },
  { canonical: 'Mocha', aliases: ['mocha', 'chai'] },
  { canonical: 'Cypress', aliases: ['cypress'] },
  { canonical: 'Selenium', aliases: ['selenium', 'selenium webdriver'] },
  { canonical: 'Playwright', aliases: ['playwright'] },
  { canonical: 'Unit Testing', aliases: ['unit testing', 'test driven development', 'tdd'] },

  // UI/UX & Design
  { canonical: 'Figma', aliases: ['figma'] },
  { canonical: 'Adobe XD', aliases: ['adobe xd'] },
  { canonical: 'UI/UX Design', aliases: ['ui/ux', 'user interface design', 'wireframing', 'prototyping'] },
];

/**
 * Extracts plain text from a file buffer (PDF or plain text)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromFile = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.warn('PDF parse error, falling back to string extraction:', err.message);
      return buffer.toString('utf-8');
    }
  }
  // Plain text or fallback
  return buffer.toString('utf-8');
};

/**
 * Parses resume text and automatically extracts matching skills
 * @param {string} text - Raw text from resume
 * @returns {Array<string>} List of canonical skills detected
 */
const extractSkillsFromText = (text) => {
  if (!text || typeof text !== 'string') return [];

  const normalizedText = text.toLowerCase();
  const detectedSkills = new Set();

  for (const skill of SKILL_TAXONOMY) {
    for (const alias of skill.aliases) {
      // Build safe regex: match boundary or special chars
      let pattern;
      if (alias.startsWith('\\b') || alias.endsWith('\\b') || alias.includes('\\+')) {
        pattern = new RegExp(alias, 'i');
      } else {
        // Safe regex escaping for non-regex string
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      }

      if (pattern.test(normalizedText)) {
        detectedSkills.add(skill.canonical);
        break; // Match found for this skill, move to next skill
      }
    }
  }

  return Array.from(detectedSkills).sort();
};

/**
 * Full resume parsing service function
 * @param {Buffer} buffer - Uploaded file buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise<{text: string, skills: string[]}>}
 */
const parseResume = async (buffer, mimeType) => {
  const text = await extractTextFromFile(buffer, mimeType);
  const skills = extractSkillsFromText(text);
  return {
    text: text.substring(0, 5000), // snippet/sample
    skills,
    skillsCount: skills.length,
  };
};

module.exports = {
  SKILL_TAXONOMY,
  extractTextFromFile,
  extractSkillsFromText,
  parseResume,
};
