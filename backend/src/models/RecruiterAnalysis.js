const mongoose = require("mongoose");

const recruiterCandidateSchema = new mongoose.Schema(
  {
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const recruiterAnalysisSchema = new mongoose.Schema(
  {
    jobRole: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true, trim: true },
    candidates: { type: [recruiterCandidateSchema], default: [] },
    bestCandidate: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("RecruiterAnalysis", recruiterAnalysisSchema);
