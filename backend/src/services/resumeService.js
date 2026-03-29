const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { getSkillsForRole } = require("../utils/roleSkillMap");

// ================= SKILLS =================
const SKILL_KEYWORDS = [
  "react","javascript","typescript","node.js","express","mongodb","sql","html","css",
  "tailwind","redux","next.js","python","java","aws","docker","kubernetes","git",
  "api","rest","graphql","ci/cd","linux","testing","jest","cypress","figma",
  "communication","leadership","agile","scrum","tableau","power bi","excel",
];

// ================= FILE TEXT EXTRACTION =================
const extractTextFromFile = async (filePath) => {
  if (!filePath) return "";

  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      try {
        const data = await pdfParse(buffer);
        return data.text || "";
      } catch {
        return "";
      }
    }

    if (ext === ".docx") {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || "";
      } catch {
        return "";
      }
    }

    if (ext === ".txt" || ext === ".doc") {
      try {
        return fs.readFileSync(filePath, "utf8");
      } catch {
        return "";
      }
    }

    return "";
  } catch {
    return "";
  }
};

// ================= 🆕 NAME EXTRACTION =================
const extractCandidateName = (text = "") => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i];

    // ignore emails / numbers / long sentences
    if (
      !line.includes("@") &&
      !/\d/.test(line) &&
      line.length > 3 &&
      line.length < 40
    ) {
      return line;
    }
  }

  return "Unknown Candidate";
};

// ================= ROLE NORMALIZATION =================
const normalizeRole = (role = "") => {
  const r = role.toLowerCase().trim();

  return (
    getSkillsForRole(r) ||
    getSkillsForRole(r + " developer") ||
    getSkillsForRole("full stack developer") ||
    []
  );
};

// ================= SECTION DETECTION =================
const detectSections = (text) => {
  const lower = text.toLowerCase();

  return {
    hasProjects: lower.includes("project"),
    hasExperience: lower.includes("experience"),
    hasEducation: lower.includes("education"),
  };
};

// ================= SKILL EXTRACTION =================
const extractSkills = (text = "") => {
  const source = text.toLowerCase();

  return SKILL_KEYWORDS.filter((skill) =>
    source.includes(skill.toLowerCase())
  );
};

// ================= ATS =================
const computeATS = ({ text, roleSkills, extractedSkills, jobDescription }) => {
  const words = text ? text.split(/\s+/).length : 0;

  const completeness = Math.min((words / 500) * 100, 100);

  const matchedSkills = extractedSkills.filter((s) =>
    roleSkills.includes(s)
  );

  const skillMatch = roleSkills.length
    ? (matchedSkills.length / roleSkills.length) * 100
    : 40;

  const keywordBase = jobDescription || roleSkills.join(" ");
  const keywords = keywordBase.toLowerCase().split(/\W+/).filter(Boolean);

  const hits = keywords.filter((k) =>
    text.toLowerCase().includes(k)
  ).length;

  const keywordScore = keywords.length
    ? (hits / keywords.length) * 100
    : 40;

  return Math.round(0.4 * keywordScore + 0.4 * skillMatch + 0.2 * completeness);
};

// ================= ANALYSIS =================
const analyzeResume = async ({ text = "", role = "", jobDescription = "" }) => {

  const roleSkills = normalizeRole(role);
  const extractedSkills = extractSkills(text);

  const matchedSkills = extractedSkills.filter((s) =>
    roleSkills.includes(s)
  );

  const missingSkills = roleSkills.filter(
    (s) => !extractedSkills.includes(s)
  );

  const matchPercentage = roleSkills.length
    ? Math.round((matchedSkills.length / roleSkills.length) * 100)
    : 0;

  const atsScore = computeATS({
    text,
    roleSkills,
    extractedSkills,
    jobDescription,
  });

  const sections = detectSections(text);

  const breakdown = {
    skills: Math.min(matchedSkills.length * 10, 100),
    content: Math.min(text.length / 40, 100),
    structure:
      (sections.hasProjects + sections.hasExperience + sections.hasEducation) * 33,
  };

  const issues = [];

  if (missingSkills.length > 3)
    issues.push("Missing important role-based skills");

  if (!sections.hasProjects)
    issues.push("No projects section found");

  if (!sections.hasExperience)
    issues.push("No experience section");

  if (text.length < 800)
    issues.push("Resume content is too short");

  const suggestions = [
    ...missingSkills.slice(0, 3).map(
      (s) => `Add ${s} with real project usage`
    ),
    !sections.hasProjects &&
      "Add 2–3 strong projects with technologies used",
    !sections.hasExperience &&
      "Include internship or real-world experience",
    "Use measurable results (e.g., improved performance by 30%)",
    matchPercentage < 50 &&
      "Your resume is not aligned with the selected job role",
  ].filter(Boolean);

  return {
    atsScore,
    matchPercentage,
    extractedSkills,
    missingSkills,
    matchedSkills,
    sections,
    breakdown,
    issues,
    suggestions,
  };
};

module.exports = {
  extractTextFromFile,
  analyzeResume,
  extractSkills,
  extractCandidateName, // ✅ NEW EXPORT
};