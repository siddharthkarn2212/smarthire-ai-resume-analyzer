import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const parseNumeric = (value) => {
  const found = String(value).match(/\d+/);
  return found ? Number(found[0]) : null;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = false,
}) {
  const numeric = useMemo(() => parseNumeric(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (numeric === null) return;

    let frame;
    let current = 0;

    const step = () => {
      current += Math.max(1, Math.ceil(numeric / 25));

      if (current >= numeric) {
        setDisplay(numeric);
        return;
      }

      setDisplay(current);
      frame = requestAnimationFrame(step);
    };

    setDisplay(0);
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [numeric]);

  const displayValue =
    numeric === null
      ? value
      : `${display}${String(value).includes("%") ? "%" : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500/40 via-cyan-500/30 to-fuchsia-500/40"
    >
      {/* INNER CARD */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl p-5 border border-white/10 shadow-lg hover:shadow-indigo-500/20 transition">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60 font-medium">{title}</p>

          {Icon && (
            <div className="p-2 rounded-lg bg-white/10 border border-white/10">
              <Icon size={16} className="text-cyan-300" />
            </div>
          )}
        </div>

        {/* VALUE */}
        <h3
          className={`mt-3 text-3xl font-extrabold tracking-tight ${
            gradient
              ? "bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent"
              : "text-white"
          }`}
        >
          {displayValue}
        </h3>

        {/* SUBTEXT */}
        {subtitle && (
          <p className="mt-2 text-xs text-white/50">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}