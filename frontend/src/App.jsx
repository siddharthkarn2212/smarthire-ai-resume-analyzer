import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import JobSeekerPage from "./pages/JobSeekerPage";
import RecruiterPage from "./pages/RecruiterPage";

function App() {
  const [mode, setMode] = useState("job-seeker");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}, [theme]);

  const location = useLocation();
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Keep legacy `mode` for ModeToggle animations/consistency, but derive it from route.
  useEffect(() => {
    setMode(location.pathname === "/candidates" ? "recruiter" : "job-seeker");
  }, [location.pathname]);

  return (
    <>
      <Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: theme === "dark" ? "#111827" : "#ffffff",
      color: theme === "dark" ? "#e2e8f0" : "#0f172a",
      border: theme === "dark"
        ? "1px solid rgba(99,102,241,0.35)"
        : "1px solid rgba(0,0,0,0.1)",
    },
  }}
/>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            element={
              <DashboardLayout
                mode={mode}
                setMode={setMode}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          >
            <Route path="/dashboard" element={<JobSeekerPage />} />
            <Route path="/analytics" element={<JobSeekerPage />} />
            <Route path="/candidates" element={<RecruiterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
