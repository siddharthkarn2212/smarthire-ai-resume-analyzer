import { Cell } from "recharts";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getAnalyticsApi } from "../services/api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalyticsApi();
        setData(res);
      } catch (err) {
        console.error("Analytics error:", err);
        setError("Failed to load analytics");
      }
    };

    fetchAnalytics();
  }, []);

  // 🔥 Loading state
  if (!data && !error) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-white/60">
        ⏳ Loading analytics...
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  // ✅ Safe fallback
  const totalResumes = data?.totalResumes || 0;
  const avgATS = data?.avgATS || 0;
  const topSkills = data?.topSkills || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          📊 Analytics Dashboard
        </h1>
        <p className="text-white/60">
          Real-time insights from analyzed resumes
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur shadow-lg">
          <h3 className="text-white/60">Total Resumes</h3>
          <p className="text-4xl font-bold text-white mt-2">
            {totalResumes}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 backdrop-blur shadow-lg">
          <h3 className="text-white/60">Average ATS Score</h3>
          <p className="text-4xl font-bold text-cyan-300 mt-2">
            {avgATS}%
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          🧠 Top Skills Distribution
        </h3>

        {topSkills.length === 0 ? (
          <p className="text-white/60 text-sm">No skill data available</p>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={topSkills}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="_id" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #444",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {topSkills.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index % 2 === 0 ? "#6366f1" : "#22d3ee"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}