const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },
    atsScore: { type: Number, required: true, min: 0, max: 100 },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    missingSkills: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Analysis", analysisSchema);
