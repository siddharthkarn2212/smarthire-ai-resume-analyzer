import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Loader2, Medal, Target } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import { analyzeRecruiterApi } from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// ✅ NEW: clean name formatter (SAFE)
const formatName = (fileName = "") => {
  return fileName
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function RecruiterPage() {
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const uploadedFileNames = useMemo(() => files.map((f) => f.name), [files]);

  const handleAnalyze = async () => {
    if (!files.length) {
      toast.error("Upload resumes first");
      return;
    }

    if (!role.trim()) {
      toast.error("Enter job role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeRecruiterApi({ files, role });
      setResult(data);
      toast.success("Analysis completed");
    } catch (err) {
      setError("Analysis failed");
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePickFiles = (picked) => {
    const list = Array.from(picked || []);
    setFiles((prev) => [...prev, ...list]);
  };

  return (
    <section className="space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-xl">
        <h1 className="text-white text-2xl font-bold">
          SmartHire Recruiter Dashboard
        </h1>
        <p className="text-white/90 text-sm mt-1">
          Compare candidates visually and make faster hiring decisions
        </p>
      </div>

      {/* ================= UPLOAD ================= */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-lg p-6 rounded-2xl space-y-4 border border-slate-200 dark:border-white/10">

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            handlePickFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="premium-button px-4 py-2 rounded-xl text-white"
        >
          Upload Resumes
        </button>

        <div className="text-sm text-slate-600 dark:text-gray-300">
          {files.length} files selected
        </div>

        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="premium-input px-3 py-2 w-full"
          placeholder="Enter job role (e.g. Full Stack Developer)"
        />

        <button
          onClick={handleAnalyze}
          className="premium-button px-4 py-2 rounded-xl text-white flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Analyze Candidates
        </button>

        {error && <p className="text-red-400">{error}</p>}
      </div>

      {/* ================= GRAPH ================= */}
      {result?.rankedCandidates?.length > 0 && (
        <div className="bg-white dark:bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10">

          <h3 className="text-slate-900 dark:text-white font-semibold mb-4 text-lg">
            Candidate Comparison
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={result.rankedCandidates.map((c) => ({
                name: formatName(c.fileName), // ✅ FIXED
                ATS: c.atsScore,
                Match: c.matchPercentage,
              }))}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "none",
                  borderRadius: "10px",
                }}
                labelStyle={{ color: "#fff" }}
              />

              <Legend />

              <Bar dataKey="ATS" fill="#6366f1" name="ATS Score" radius={[6,6,0,0]} />
              <Bar dataKey="Match" fill="#22c55e" name="Match %" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>
      )}

      {/* ================= CARDS ================= */}
      {result?.bestCandidate && (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Best Candidate"
            value={formatName(result.bestCandidate.fileName)} // ✅ FIXED
            icon={Crown}
          />
          <StatCard
            title="Top ATS Score"
            value={`${result.bestCandidate.atsScore}%`}
            icon={Medal}
          />
          <StatCard
            title="Top Match"
            value={`${result.bestCandidate.matchPercentage}%`}
            icon={Target}
          />
        </div>
      )}

      {/* ================= LIST ================= */}
      {result?.rankedCandidates?.length > 0 && (
        <div className="bg-white dark:bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-slate-200 dark:border-white/10">

          <h3 className="text-slate-900 dark:text-white font-semibold mb-4 text-lg">
            Ranked Candidates
          </h3>

          {result.rankedCandidates.map((c, i) => (
            <div
              key={i}
              className="mt-3 p-4 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              <p className="text-slate-900 dark:text-white font-medium">
                #{i + 1} {formatName(c.fileName)} {/* ✅ FIXED */}
              </p>

              <div className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                ATS: {c.atsScore}% • Match: {c.matchPercentage}%
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}