const {
  extractTextFromFile,
  extractSkills,
  analyzeResume,
} = require("../services/resumeService");


const { suggestRolesFromSkills } = require("../utils/roleSkillMap");

// ================= UPLOAD =================
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    let extractedText = "";

    try {
      const fs = require("fs");
      const path = require("path");
       const os = require("os"); // for render

            const tempPath = path.join(
        os.tmpdir(),   // ✅ CHANGE HERE
        "resume_" + Date.now() + ".pdf"
      );

      fs.writeFileSync(tempPath, req.file.buffer);

      extractedText = await extractTextFromFile(tempPath);

      fs.unlinkSync(tempPath);
    } catch (err) {
      console.error("Text extraction failed:", err.message);
      return res.status(400).json({
        message: "Failed to read resume file.",
      });
    }

    const skills = extractSkills(extractedText);
    const suggestedRoles = suggestRolesFromSkills(skills);

    return res.json({
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

        // ✅ NO DATABASE — just push result
        analyzedCandidates.push({
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

    return res.json({
      bestCandidate: rankedCandidates[0] || null,
      rankedCandidates,
    });

  } catch (error) {
    console.error("RECRUITER ERROR:", error);

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

