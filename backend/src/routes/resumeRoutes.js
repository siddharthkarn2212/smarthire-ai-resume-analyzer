const express = require("express");
const multer = require("multer");

const {
  uploadResume,
  analyzeResumeData,
  recruiterAnalyze,
} = require("../controllers/resumeController");

const router = express.Router();

// ✅ File filter
const fileFilter = (_req, file, cb) => {
  const allowed = [".pdf", ".txt", ".doc", ".docx"];
  const ext = require("path").extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed."));
  }

  cb(null, true);
};


const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= ROUTES =================

// Upload single resume
router.post("/upload", upload.single("resume"), uploadResume);

// Analyze resume data (text/json)
router.post("/analyze", analyzeResumeData);

// Recruiter bulk upload
router.post(
  "/recruiter/analyze",
  upload.array("resumes", 25),
  recruiterAnalyze
);

module.exports = router;