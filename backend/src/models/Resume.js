const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    extractedText: { type: String, required: true },
    skills: { type: [String], default: [] },
    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Resume", resumeSchema);
