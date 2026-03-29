const ROLE_SKILLS = {
  "frontend developer": [
    "react", "javascript", "html", "css", "tailwind", "redux", "typescript"
  ],
  "backend developer": [
    "node.js", "express", "mongodb", "sql", "api", "authentication", "docker"
  ],
  "full stack developer": [
    "react", "node.js", "express", "mongodb", "api", "javascript", "git"
  ],
  "data analyst": [
    "excel", "sql", "python", "tableau", "power bi", "statistics", "data visualization"
  ],
  "devops engineer": [
    "aws", "docker", "kubernetes", "ci/cd", "linux", "terraform", "monitoring"
  ],
  "product manager": [
    "roadmap", "stakeholder", "agile", "analytics", "communication", "strategy"
  ],
};

// ================= NORMALIZE =================
const normalizeRole = (role) => (role || "").trim().toLowerCase();

// ================= SMART MATCH =================
const getSkillsForRole = (role) => {
  const normalized = normalizeRole(role);

  // ✅ 1. Exact match
  if (ROLE_SKILLS[normalized]) {
    return ROLE_SKILLS[normalized];
  }

  // ✅ 2. Partial match (MOST IMPORTANT FIX)
  for (const key in ROLE_SKILLS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return ROLE_SKILLS[key];
    }
  }

  // ✅ 3. Keyword-based fallback
  if (normalized.includes("frontend")) return ROLE_SKILLS["frontend developer"];
  if (normalized.includes("backend")) return ROLE_SKILLS["backend developer"];
  if (normalized.includes("full")) return ROLE_SKILLS["full stack developer"];
  if (normalized.includes("data")) return ROLE_SKILLS["data analyst"];
  if (normalized.includes("devops")) return ROLE_SKILLS["devops engineer"];

  // ✅ 4. Default fallback
  return ROLE_SKILLS["full stack developer"];
};

// ================= ROLE SUGGESTION =================
const suggestRolesFromSkills = (skills) => {
  const lowerSkills = new Set(skills.map((s) => s.toLowerCase()));

  const scored = Object.entries(ROLE_SKILLS)
    .map(([role, requiredSkills]) => {
      const overlap = requiredSkills.filter((skill) =>
        lowerSkills.has(skill.toLowerCase())
      ).length;

      return { role, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3)
    .map((item) => item.role);

  return scored;
};

module.exports = {
  ROLE_SKILLS,
  getSkillsForRole,
  suggestRolesFromSkills,
};