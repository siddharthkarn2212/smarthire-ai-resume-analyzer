import { motion } from "framer-motion";

const modes = [
  { id: "job-seeker", label: "Job Seeker" },
  { id: "recruiter", label: "Recruiter" },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="relative inline-flex rounded-2xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 dark:backdrop-blur-xl p-1 shadow-lg">

      {modes.map((item) => {
        const active = mode === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="relative w-32 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
          >
            {/* 🔥 ACTIVE BACKGROUND */}
            {active && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-lg"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}

            {/* 🔥 TEXT */}
            <span
              className={`relative z-10 ${
               active
                ? "text-white"
                : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

    </div>
  );
}