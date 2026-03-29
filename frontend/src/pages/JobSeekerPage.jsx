import { PieChart, Pie } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import { analyzeResumeApi, uploadResumeApi } from "../services/api";

export default function JobSeekerPage() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("full stack developer");
  const [jobDescription, setJobDescription] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    if (!analysis) return [];
    return [
      { name: "ATS", value: analysis.atsScore },
      { name: "Match", value: analysis.matchPercentage },
    ];
  }, [analysis]);

  const breakdownData = useMemo(() => {
    if (!analysis?.breakdown) return [];
    return [
      { name: "Skills", value: analysis.breakdown.skills || 0 },
      { name: "Content", value: analysis.breakdown.content || 0 },
      { name: "Structure", value: analysis.breakdown.structure || 0 },
    ];
  }, [analysis]);

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file");
    setLoading(true);
    try {
      const data = await uploadResumeApi(file);
      setUploaded(data);
      if (data.suggestedRoles?.length) setRole(data.suggestedRoles[0]);
      toast.success("Uploaded successfully");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploaded?.extractedText) return toast.error("Upload first");
    setLoading(true);
    try {
      const data = await analyzeResumeApi({
        extractedText: uploaded.extractedText,
        role,
        jobDescription,
      });
      setAnalysis(data);
      toast.success("Analysis complete");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };
  const matched = analysis?.extractedSkills?.length || 0;
const missing = analysis?.missingSkills?.length || 0;

const matchRatio = matched / (matched + missing || 1);
let score = matchRatio * 100;

// bonus
if (analysis?.sections?.hasProjects) score += 5;
if (analysis?.sections?.hasExperience) score += 5;
if (analysis?.sections?.hasEducation) score += 5;

// final ATS
const improvedATS = analysis
  ? Math.min(100, Math.max(60, Math.round(score)))
  : 0;

  return (
    <section className="max-w-6xl mx-auto px-6 space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white"> Resume Intelligence</h1>
        <p className="text-slate-600 dark:text-white/60">Analyze and improve your resume using AI</p>
      </div>

      {/* 🔥 UPLOAD CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl shadow-lg">

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold hover:scale-105 transition"
          >
            Upload
          </button>

          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold hover:scale-105 transition"
          >
            Analyze
          </button>
        </div>

        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-4 w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
        />

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="mt-3 w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
          placeholder="Job Description"
        />
      </div>

      {/* 🔥 LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600 dark:text-white/70">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
          <p className="mt-4 text-lg"> Analyzing your resume...</p>
        </div>
      )}

      {/* 🔥 RESULTS */}
      {analysis && !loading && (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard title="ATS" value={`${improvedATS}%`} />
            <StatCard title="Match" value={`${analysis.matchPercentage}%`} />
            <StatCard title="Skills" value={analysis?.extractedSkills?.length || 0} />
            <StatCard title="Missing" value={analysis?.missingSkills?.length || 0} />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <h3 className="text-slate-700 dark:text-white/80 mb-3">Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((d) => (
                      <Cell key={d.name} fill="#6366f1" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <h3 className="text-slate-700 dark:text-white/80 mb-3"></h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={breakdownData}>
                  <CartesianGrid stroke="#444" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
              {/* 🔥 Skill Match Overview (SaaS Upgrade) */}
<div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">

  <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-4">
    📊 Skill Match Overview
  </h3>

  {/* DATA */}
  {(() => {
    const skillData = [
      {
        name: "Matched",
        value: analysis?.extractedSkills?.length || 0,
      },
      {
        name: "Missing",
        value: analysis?.missingSkills?.length || 0,
      },
     
    ];

    return (
      <>
        {/* PIE CHART */}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={skillData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              <Cell fill="#6366f1" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* PROGRESS BARS */}
        <div className="space-y-3 mt-6">
          {skillData.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm text-slate-600 dark:text-white/70">
                <span>{item.name}</span>
                <span>{item.value}</span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-1">
                <div
                  className={`h-2 rounded-full ${
                    item.name === "Matched"
                      ? "bg-indigo-500"
                      : item.name === "Missing"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(item.value * 20, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  })()}

</div>

      

          {/* Suggestions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <h3 className="text-slate-900 dark:text-white mb-3">💡 Suggestions</h3>
            <div className="space-y-2">
              {analysis?.suggestions?.map((s) => (
                <div key={s} className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <h3 className="text-slate-900 dark:text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis?.extractedSkills?.map((s) => (
                <span key={s} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                  {s}
                </span>
              ))}
              {analysis?.missingSkills?.map((s) => (
                <span key={s} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!analysis && !loading && (
        <div className="text-center py-20 text-slate-600 dark:text-white/60">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-slate-900 dark:text-white text-lg font-semibold">
            Upload Resume to Get Started
          </h3>
        </div>
      )}
    </section>
  );
}