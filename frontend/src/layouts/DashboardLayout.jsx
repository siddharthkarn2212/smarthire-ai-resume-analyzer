import ThemeToggle from "../components/ThemeToggle";
import ModeToggle from "../components/ModeToggle";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function DashboardLayout({
  mode,
  setMode,
  theme,
  toggleTheme,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (nextPath) => navigate(nextPath);

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;

    setMode(nextMode);

    if (nextMode === "recruiter") {
      go("/candidates");
    } else {
      go("/dashboard");
    }
  };

  return (
    <div
      className="
        min-h-screen
        text-slate-900 dark:text-slate-100
        bg-gradient-to-br
        from-slate-100 via-white to-slate-200
        dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#020617]
      "
    >
      <div className="mx-auto min-h-screen max-w-7xl">

        {/* 🔥 MAIN */}
        <main className="p-6 md:p-10">

          {/* HEADER */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <ModeToggle mode={mode} onChange={handleModeChange} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </header>

          {/* 🔥 HERO CARD */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="
              relative overflow-hidden rounded-3xl
              border border-slate-200 dark:border-white/10
              ring-1 ring-slate-200 dark:ring-white/10
              bg-white dark:bg-white/5
              p-8
              shadow-lg dark:shadow-xl
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-fuchsia-500/10" />

            <div className="relative z-10">

              {/* BADGE */}
              <div
                className="
                  inline-flex items-center gap-2 px-3 py-1 rounded-full
                  bg-indigo-50 dark:bg-indigo-500/10
                  border border-indigo-200 dark:border-indigo-400/20
                  text-xs text-indigo-700 dark:text-indigo-300
                "
              >
                <Sparkles size={14} />
                Premium AI Hiring Suite
              </div>

              {/* TITLE */}
              <h2
                className="
                  mt-5 text-4xl md:text-5xl font-extrabold
                  bg-gradient-to-r
                  from-slate-900 via-indigo-600 to-fuchsia-600
                  dark:from-white dark:via-indigo-200 dark:to-fuchsia-200
                  bg-clip-text text-transparent
                "
              >
                SmartHire
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-3 max-w-xl text-slate-600 dark:text-white/60">
                Where resumes meet intelligence and hiring meets precision.
              </p>

            </div>
          </motion.section>

          {/* CONTENT */}
          <div className="mt-8">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
  );
}