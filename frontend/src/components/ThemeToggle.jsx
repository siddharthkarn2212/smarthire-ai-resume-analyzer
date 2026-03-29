import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 dark:backdrop-blur-xl shadow-md transition"
      type="button"
    >
      {/* ICON */}
      <div className="p-1 rounded-lg bg-slate-300 dark:bg-white/10 border border-slate-300 dark:border-white/10">
        {isDark ? (
          <Sun size={16} className="text-yellow-300" />
        ) : (
          <Moon size={16} className="text-cyan-300" />
        )}
      </div>

      {/* TEXT */}
      <span className="text-sm font-medium text-slate-700 dark:text-white/80">
        {isDark ? "Light" : "Dark"}
      </span>
    </motion.button>
  );
}