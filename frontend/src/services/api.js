import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ FIXED upload
export const uploadResumeApi = async (file) => {
  const formData = new FormData();

  // 🔥 MUST MATCH backend: upload.single("resume")
  formData.append("resume", file);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// ✅ analyze
export const analyzeResumeApi = async (payload) => {
  const { data } = await api.post("/analyze", payload);
  return data;
};

// ✅ recruiter bulk upload (already correct)
export const analyzeRecruiterApi = async ({ files, role }) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("resumes", file);
  });

  formData.append("role", role);

  const { data } = await api.post("/recruiter/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
