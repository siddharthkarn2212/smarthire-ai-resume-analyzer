const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadResume,
  analyzeResumeData,
  recruiterAnalyze,
} = require("../controllers/resumeController");

const router = express.Router();

// ✅ Ensure uploads folder exists (backend/uploads)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// ✅ File filter
const fileFilter = (_req, file, cb) => {
  const allowed = [".pdf", ".txt", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed."));
  }

  cb(null, true);
};

// ✅ Multer instance (with size limit)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ================= ROUTES =================

// Upload single resume
router.post("/upload", upload.single("resume"), uploadResume);

// Analyze resume data (text/json)
router.post("/analyze", analyzeResumeData);

// Recruiter bulk upload (max 25 files)
router.post(
  "/recruiter/analyze",
  upload.array("resumes", 25),
  recruiterAnalyze
);

module.exports = router;