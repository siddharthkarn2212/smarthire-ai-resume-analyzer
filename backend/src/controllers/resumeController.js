const {
  extractTextFromFile,
  extractSkills,
  analyzeResume,
} = require("../services/resumeService");


const { suggestRolesFromSkills } = require("../utils/roleSkillMap");


const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const RecruiterAnalysis = require("../models/RecruiterAnalysis");





// ================= UPLOAD =================
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required." });
    }


    let extractedText = "";


    try {
        text = await extractTextFromFile(file.buffer);
    } catch (err) {
      console.error("Text extraction failed:", err.message);
      return res.status(400).json({
        message: "Failed to read resume file.",
      });
    }


    const skills = extractSkills(extractedText);
    const suggestedRoles = suggestRolesFromSkills(skills);


    const savedResume = await Resume.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      extractedText,
      skills,
    });


    


    return res.json({
      resumeId: savedResume._id,
      extractedText,
      skills,
      suggestedRoles,
    });


  } catch (error) {
    console.error("UPLOAD ERROR:", error);


    return res.status(500).json({
      message: error.message || "Failed to upload resume.",
    });
  }
};


// ================= ANALYZE =================
const analyzeResumeData = async (req, res) => {
  try {
    const { extractedText, role, jobDescription = "", resumeId } = req.body;


    if (!extractedText || !role) {
      return res.status(400).json({
        message: "extractedText and role are required.",
      });
    }


    const analysis = await analyzeResume({
      text: extractedText,
      role,
      jobDescription,
    });


    let targetResumeId = resumeId;


    if (!targetResumeId) {
      const fallbackResume = await Resume.create({
        filename: "manual-input.txt",
        originalName: "manual-input.txt",
        extractedText,
        skills: analysis.extractedSkills || [],
      });


      targetResumeId = fallbackResume._id;
    }


    await Analysis.create({
      resumeId: targetResumeId,
      atsScore: analysis.atsScore,
      matchScore: analysis.matchPercentage,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
    });


    return res.json(analysis);


  } catch (error) {
    console.error("ANALYZE ERROR:", error);


    return res.status(500).json({
      message: error.message || "Failed to analyze resume.",
    });
  }
};


// ================= RECRUITER =================
const recruiterAnalyze = async (req, res) => {
  try {
    const files = req.files || [];
    const { role = "" } = req.body;


    // ✅ FIX: ensure valid jobDescription always
    let jobDescription =
      req.body.jobDescription && req.body.jobDescription.trim()
        ? req.body.jobDescription
        : "No job description provided";


    if (!files.length) {
      return res.status(400).json({
        message: "At least one resume is required.",
      });
    }


    if (!role.trim()) {
      return res.status(400).json({
        message: "Job role is required.",
      });
    }


    const analyzedCandidates = [];
    const candidateDocuments = [];

for (const file of files) {
  try {
    let text = "";

    try {
      text = await extractTextFromFile(file.buffer);
    } catch {
      text = "";
    }

    const analysis = await analyzeResume({
      text,
      role,
      jobDescription,
    });

    const savedResume = await Resume.create({
      filename: file.filename,
      originalName: file.originalname,
      extractedText: text,
      skills: analysis.extractedSkills || [],
    });

    await Analysis.create({
      resumeId: savedResume._id,
      atsScore: analysis.atsScore,
      matchScore: analysis.matchPercentage,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
    });

    candidateDocuments.push({
      resumeId: savedResume._id,
      score: analysis.atsScore,
    });

    analyzedCandidates.push({
      resumeId: savedResume._id,
      fileName: file.originalname,
      atsScore: analysis.atsScore,
      matchPercentage: analysis.matchPercentage,
      missingSkills: analysis.missingSkills || [],
    });

  } catch (err) {
    console.error("File processing error:", err.message);
  }
}


    const rankedCandidates = analyzedCandidates.sort(
      (a, b) => b.atsScore - a.atsScore
    );


    await RecruiterAnalysis.create({
      jobRole: role,
      jobDescription,
      candidates: candidateDocuments.sort((a, b) => b.score - a.score),
      bestCandidate: rankedCandidates[0]?.resumeId,
    });


    return res.json({
      bestCandidate: rankedCandidates[0] || null,
      rankedCandidates,
    });


  } catch (error) {
    console.error("RECRUITER ERROR:", error);
    console.error("STACK:", error.stack);


    


    return res.status(500).json({
      message: error.message || "Recruiter analysis failed.",
    });
  }
};


module.exports = {
  uploadResume,
  analyzeResumeData,
  recruiterAnalyze,
};

