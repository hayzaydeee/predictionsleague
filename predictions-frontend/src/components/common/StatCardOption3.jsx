import React, { useContext } from "react";
import { motion } from "framer-motion";
import { DoubleArrowUpIcon, DoubleArrowDownIcon } from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { padding, margins, textScale, iconSize, borderRadius } from "../../utils/mobileScaleUtils";

/**
 * StatCard Option 3: Glassmorphic Design
 * - More translucent background
 * - Stronger blur effect
 * - Floating elevation on hover
 * - Gradient overlays
 * - Premium feel
 */
const StatCardOption3 = ({ title, value, subtitle, badge, icon, trend, accentColor = "teal" }) => {
  const { theme } = useContext(ThemeContext);

  // Accent color variants with gradients
  const accentColors = {
    teal: {
      gradient: "from-teal-500/20 via-cyan-500/10 to-transparent",
      iconGlow: theme === "dark" ? "text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" : "text-teal-600",
      border: theme === "dark" ? "border-teal-500/30" : "border-teal-200",
    },
    purple: {
      gradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
      iconGlow: theme === "dark" ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-purple-600",
      border: theme === "dark" ? "border-purple-500/30" : "border-purple-200",
    },
    blue: {
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      iconGlow: theme === "dark" ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-blue-600",
      border: theme === "dark" ? "border-blue-500/30" : "border-blue-200",
    },
    amber: {
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      iconGlow: theme === "dark" ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-amber-600",
      border: theme === "dark" ? "border-amber-500/30" : "border-amber-200",
    },
  };

  const accent = accentColors[accentColor] || accentColors.teal;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative ${
        theme === "dark"
          ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600/80"
          : "bg-white/70 border-slate-200/60 hover:border-slate-300"
      } backdrop-blur-xl ${borderRadius.card} ${padding.cardCompact} border transition-all duration-300 overflow-hidden group
      ${theme === "dark" ? "hover:shadow-2xl hover:shadow-slate-900/50" : "shadow-lg hover:shadow-xl shadow-slate-200/50"}`}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Subtle animated mesh gradient */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
        <div className={`absolute top-0 -left-10 w-40 h-40 bg-gradient-to-br ${accent.gradient} rounded-full blur-3xl`} />
        <div className={`absolute bottom-0 -right-10 w-40 h-40 bg-gradient-to-tl ${accent.gradient} rounded-full blur-3xl`} />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            <h3
              className={`${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              } font-outfit font-medium ${textScale.label} mb-1`}
            >
              {title}
            </h3>
            
            {/* Subtitle moved up */}
            <p
              className={`${
                theme === "dark" ? "text-slate-500" : "text-slate-500"
              } ${textScale.labelTiny} font-outfit leading-tight`}
            >
              {subtitle}
            </p>
          </div>

          {/* Glowing icon */}
          {icon && (
            <div className={`${iconSize.large} ${accent.iconGlow} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110`}>
              {icon}
            </div>
          )}
        </div>

        {/* Value - Takes center stage */}
        <div className="flex items-baseline gap-2 mb-2">
          <p
            className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            } font-dmSerif leading-none tracking-tight`}
          >
            {value}
          </p>

          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm ${
                trend.direction === "up"
                  ? theme === "dark"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-emerald-100/80 text-emerald-700 border border-emerald-200"
                  : theme === "dark"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-red-100/80 text-red-700 border border-red-200"
              }`}
            >
              {trend.direction === "up" ? (
                <DoubleArrowUpIcon className={iconSize.tiny} />
              ) : (
                <DoubleArrowDownIcon className={iconSize.tiny} />
              )}
              <span className={`${textScale.labelTiny} font-bold`}>{trend.value}</span>
            </div>
          )}
        </div>

        {/* Badge - Bottom right */}
        {badge && badge.text && (
          <div className="flex justify-end">
            <span
              className={`${textScale.labelTiny} font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
                badge.type === "success"
                  ? theme === "dark"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : badge.type === "info"
                  ? theme === "dark"
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                  : theme === "dark"
                  ? "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                  : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              {badge.text}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCardOption3;
