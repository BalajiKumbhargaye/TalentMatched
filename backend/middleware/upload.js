const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isVercel = !!process.env.VERCEL;

let storage;

if (isVercel) {
  // Use memory storage for Vercel serverless environment (read-only filesystem)
  storage = multer.memoryStorage();
} else {
  // Use local disk storage for local development
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
      // Fallback to memory storage if directory creation fails
    }
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `resume-${uniqueSuffix}${ext}`);
    },
  });
}

// File filter for allowed resume formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a PDF or TXT file.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max limit
  },
  fileFilter,
});

module.exports = upload;
