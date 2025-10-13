import { Box } from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  CaretUpIcon,
  CaretDownIcon,
  LockClosedIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function StatusBar({ 
  user, 
  globalRank,
  onMakePredictions, 
  loading = false,
  nextMatchData = null 
}) {
  // Get theme context
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Use provided user data or show loading
  const userData = user || {
    username: "Loading...",
    points: 0,
    rank: 0,
    rankChange: 0,
    predictions: 0,
    pendingPredictions: 0,
  };

  // Calculate time until next match
  let timeDisplay = "Loading...";
  
  if (nextMatchData && nextMatchData.nextMatchTime) {
    const nextMatch = new Date(nextMatchData.nextMatchTime);
    const now = new Date();
    const timeUntilMatch = nextMatch - now;
    
    if (timeUntilMatch > 0) {
      const totalHours = Math.floor(timeUntilMatch / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilMatch % (1000 * 60 * 60)) / (1000 * 60));
      
      if (totalHours >= 24) {
        // More than 24 hours: show days & hours
        const days = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;
        timeDisplay = `${days}d ${remainingHours}h`;
      } else {
        // Less than 24 hours: show hours & minutes
        timeDisplay = `${totalHours}h ${minutes}m`;
      }
    } else {
      timeDisplay = "Live now";
    }
  }

  // Skeleton component for loading states
  const Skeleton = ({ width, height = "h-4" }) => (
    <div
      className={`${height} ${width} ${
        theme === "dark" ? "bg-slate-700/50" : "bg-slate-200"
      } rounded animate-pulse`}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${
        theme === "dark"
          ? "bg-primary-500/90 border-slate-800"
          : "bg-slate-50 border-slate-200"
      } backdrop-blur-md border`}
    >
      <Box className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center">
            {loading ? (
              <div className="h-9 w-9 bg-slate-700/50 rounded-full mr-3 animate-pulse" />
            ) : (
              <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                {userData.username.substring(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              {loading ? (
                <>
                  <Skeleton width="w-24" height="h-5" />
                  <div className="mt-1">
                    <Skeleton width="w-20" height="h-3" />
                  </div>
                </>
              ) : (
                <>
                  <h3
                    className={`${
                      theme === "dark" ? "text-teal-100" : "text-teal-700"
                    } font-medium font-outfit`}
                  >
                    {userData.username}
                  </h3>
                  <div
                    className={`flex items-center text-xs ${
                      theme === "dark" ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    <span>Rank: {globalRank?.value?.toString() || "N/A"}</span>
                    <span
                      className={`flex items-center ml-2 ${
                        userData.rankChange > 0
                          ? theme === "dark"
                            ? "text-green-400"
                            : "text-green-600"
                          : userData.rankChange < 0
                          ? theme === "dark"
                            ? "text-red-400"
                            : "text-red-600"
                          : theme === "dark"
                          ? "text-white/60"
                          : "text-slate-400"
                      }`}
                    >
                      {userData.rankChange > 0 ? (
                        <>
                          <CaretUpIcon className="mr-0.5" /> {userData.rankChange}
                        </>
                      ) : userData.rankChange < 0 ? (
                        <>
                          <CaretDownIcon className="mr-0.5" />
                          {Math.abs(userData.rankChange)}
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="flex space-x-6">
            {/* Points */}
            <div className="flex flex-col items-center">
              <span
                className={`text-xs ${
                  theme === "dark" ? "text-white/60" : "text-slate-500"
                } font-outfit`}
              >
                POINTS
              </span>
              {loading ? (
                <Skeleton width="w-12" height="h-6" />
              ) : (
                <span
                  className={`${
                    theme === "dark" ? "text-teal-200" : "text-teal-600"
                  } font-bold font-dmSerif text-lg`}
                >
                  {userData.points?.toString() || "0"}
                </span>
              )}
            </div>

            {/* Predictions */}
            <div className="flex flex-col items-center">
              <span
                className={`text-xs ${
                  theme === "dark" ? "text-white/60" : "text-slate-500"
                } font-outfit`}
              >
                PREDICTIONS
              </span>
              {loading ? (
                <Skeleton width="w-8" height="h-6" />
              ) : (
                <span
                  className={`${
                    theme === "dark" ? "text-teal-200" : "text-teal-600"
                  } font-bold font-dmSerif text-lg`}
                >
                  {userData.predictions}
                </span>
              )}
            </div>

            {/* Next Match */}
            <div className="hidden md:flex flex-col items-center">
              <span
                className={`text-xs ${
                  theme === "dark" ? "text-white/60" : "text-slate-500"
                } font-outfit`}
              >
                NEXT MATCH IN
              </span>
              {loading || !nextMatchData ? (
                <Skeleton width="w-16" height="h-6" />
              ) : (
                <span
                  className={`${
                    theme === "dark" ? "text-teal-200" : "text-teal-600"
                  } font-bold font-dmSerif text-lg flex items-center`}
                >
                  <ClockIcon className="mr-1" /> {timeDisplay}
                </span>
              )}
            </div>
          </div>
          {/* Action Button & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* Action Button */}
            {loading ? (
              <Skeleton width="w-32" height="h-9" />
            ) : userData.pendingPredictions > 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMakePredictions}
                className={`${
                  theme === "dark"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white text-sm py-2 px-4 rounded-md flex items-center font-outfit transition-colors`}
              >
                Make Predictions
                <span className="ml-2 bg-white text-indigo-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {userData.pendingPredictions}
                </span>
              </motion.button>
            ) : (
              <button
                className={`${
                  theme === "dark"
                    ? "bg-indigo-700/50 text-white/70"
                    : "bg-indigo-100 text-indigo-500"
                } text-sm py-2 px-4 rounded-md flex items-center font-outfit cursor-not-allowed`}
              >
                <LockClosedIcon className="mr-1" /> All Predictions Made
              </button>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                theme === "dark"
                  ? "text-white/70 hover:bg-primary-600/40 hover:text-teal-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-teal-700"
              }`}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: theme === "dark" ? 0 : 360 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </Box>
    </motion.div>
  );
}
