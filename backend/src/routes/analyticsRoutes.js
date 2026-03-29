import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAnalyticsApi } from "../services/api";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalyticsApi().then(setData);
  }, []);

  if (!data) return <p className="p-10">Loading analytics...</p>;

  return (
    <div className="space-y-6 p-6">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 border rounded-xl">
          <h3>Total Resumes</h3>
          <p className="text-2xl font-bold">{data.totalResumes}</p>
        </div>

        <div className="p-5 border rounded-xl">
          <h3>Average ATS</h3>
          <p className="text-2xl font-bold">{data.avgATS}%</p>
        </div>
      </div>

      {/* Top Skills */}
      <div className="p-5 border rounded-xl">
        <h3>Top Skills</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data.topSkills}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}