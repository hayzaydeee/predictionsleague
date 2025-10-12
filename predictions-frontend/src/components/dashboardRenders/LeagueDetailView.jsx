import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isValid } from "date-fns";
import {
  ArrowLeftIcon,
  PersonIcon,
  CalendarIcon,
  TargetIcon,
  GearIcon,
  StarIcon,
  ClockIcon,
  Pencil2Icon,
  BarChartIcon,
  StackIcon,
  ExclamationTriangleIcon,
  CopyIcon,
} from "@radix-ui/react-icons";

import { showToast } from "../../services/notificationService";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { backgrounds, text, buttons } from "../../utils/themeUtils";
import leagueAPI from "../../services/api/leagueAPI";
import PredictionCarousel from "../predictions/PredictionCarousel";
import LeaguePredictionViewToggleBar from "../predictions/LeaguePredictionViewToggleBar";
import LeaguePredictionContentView from "../predictions/LeaguePredictionContentView";
import LeaguePredictionFilters from "../predictions/LeaguePredictionFilters";


const LeagueDetailView = ({ leagueId, league, onBack, onManage }) => {
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Get theme context
  const { theme } = useContext(ThemeContext);

  console.log('LeagueDetailView props:', { leagueId, league: league ? 'present' : 'missing' });

  // Use the passed league object, with fallback to loading state
  if (!league) {
    console.log('LeagueDetailView: No league data, showing loading state');
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center py-12 space-y-4"
      >
        <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-teal-400' : 'border-teal-600'} border-t-transparent rounded-full animate-spin`}></div>
        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-outfit`}>
          Loading league details...
        </p>
      </motion.div>
    );
  }

  console.log('LeagueDetailView: League data found:', league.name);

  // Safe date formatter that handles invalid dates
  const formatSafeDate = (dateValue, formatString) => {
    try {
      if (!dateValue) return "N/A";

      // Handle string dates by parsing them first
      const date =
        typeof dateValue === "string"
          ? parseISO(dateValue)
          : new Date(dateValue);

      // Check if date is valid before formatting
      if (!isValid(date)) return "N/A";

      return format(date, formatString);
    } catch (error) {
      console.warn(`Error formatting date: ${error.message}`);
      return "N/A";
    }
  };

  // Handle sharing league
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("League link copied to clipboard!", "success");
  };

  // Handle copying join code
  const handleCopyJoinCode = () => {
    if (league.joinCode) {
      navigator.clipboard.writeText(league.joinCode);
      showToast("Join code copied to clipboard!", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        {" "}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${
            theme === "dark"
              ? "text-slate-400 hover:text-white"
              : "text-slate-600 hover:text-slate-800"
          } transition-colors group font-outfit`}
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Leagues</span>
        </button>
        <div className="flex items-center gap-3">
          {" "}
          {league.isAdmin && (
            <button
              onClick={() => onManage(league.id)}
              className={`flex items-center gap-2 px-3 py-2 ${
                theme === "dark"
                  ? "bg-teal-600/20 hover:bg-teal-600/30 border-teal-500/30 text-teal-400 hover:text-teal-300"
                  : "bg-teal-100 hover:bg-teal-200 border-teal-200 text-teal-600 hover:text-teal-700"
              } border rounded-lg text-sm transition-all duration-200 font-outfit`}
            >
              <GearIcon className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>
      </motion.div>

      {/* League Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl ${
          theme === "dark"
            ? "bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-slate-600/30"
            : "bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200 shadow-sm"
        } border backdrop-blur-sm`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-teal-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-teal-500/5 to-indigo-500/5"
          }`}
        />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shrink-0">
                  <TrophyIcon className="w-8 h-8 text-teal-400" />
                </div> */}
                <div className="min-w-0">
                  {" "}
                  <div className="flex items-center gap-3 mb-2">
                    <h1
                      className={`text-2xl lg:text-3xl font-bold ${text.primary[theme]} font-outfit`}
                    >
                      {league.name}
                    </h1>
                    {league.isAdmin && (
                      <span
                        className={`px-2 py-1 ${
                          theme === "dark"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-600"
                        } border rounded-lg text-xs font-medium font-outfit`}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                  <p
                    className={`${text.secondary[theme]} max-w-2xl leading-relaxed font-outfit`}
                  >
                    {league.description}
                  </p>
                  <div
                    className={`flex items-center gap-4 mt-3 text-sm ${text.muted[theme]} font-outfit`}
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Created {formatSafeDate(league.createdAt, "MMM d, yyyy")}
                      </span>
                    </div>
                    <span
                      className={`w-1 h-1 ${
                        theme === "dark" ? "bg-slate-500" : "bg-slate-400"
                      } rounded-full`}
                    />
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{league.type}</span> League
                    </div>
                    {league.joinCode && (
                      <>
                        <span
                          className={`w-1 h-1 ${
                            theme === "dark" ? "bg-slate-500" : "bg-slate-400"
                          } rounded-full`}
                        />
                        <div className="flex items-center gap-2">
                          <span>Code: {league.joinCode}</span>
                          <button
                            onClick={handleCopyJoinCode}
                            className={`p-1 rounded-md transition-colors ${
                              theme === "dark"
                                ? "hover:bg-slate-700 text-slate-400 hover:text-slate-300"
                                : "hover:bg-slate-200 text-slate-600 hover:text-slate-700"
                            }`}
                            title="Copy join code"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* League Stats Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6 shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <PersonIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    {league.members}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Members
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChartIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    #{league.position}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Your Rank
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <StarIcon className={`w-4 h-4 ${text.muted[theme]}`} />
                  <span
                    className={`text-2xl font-bold ${text.primary[theme]} font-outfit`}
                  >
                    {league.points}
                  </span>
                </div>
                <span className={`text-xs ${text.muted[theme]} font-outfit`}>
                  Your Points
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`flex ${
          theme === "dark"
            ? "bg-slate-800/50 border-slate-700/30"
            : "bg-slate-100 border-slate-200"
        } rounded-2xl p-1 border`}
      >
        {[
          { id: "leaderboard", label: "Leaderboard", icon: TargetIcon },
          { id: "predictions", label: "Predictions", icon: StackIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium font-outfit transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-teal-600 text-white shadow-lg ${
                    theme === "dark"
                      ? "shadow-teal-600/20"
                      : "shadow-teal-600/10"
                  }`
                : `${
                    theme === "dark"
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                  }`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {" "}
          {activeTab === "leaderboard" && (
            <LeaderboardContent
              leagueId={leagueId}
              formatSafeDate={formatSafeDate}
            />
          )}
          {activeTab === "predictions" && (
            <PredictionsContent leagueId={leagueId} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Leaderboard Content Component
const LeaderboardContent = ({ leagueId, formatSafeDate }) => {
  const { theme } = useContext(ThemeContext);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const data = await leagueAPI.getLeagueStandings(leagueId);
        setStandings(data.standings || []);
      } catch (err) {
        console.error('Failed to fetch league standings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center py-12"
      >
        <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-teal-400' : 'border-teal-600'} border-t-transparent rounded-full animate-spin`}></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className={`text-red-500 mb-4`}>
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="font-outfit">Failed to load standings</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${
        theme === "dark"
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-white border-slate-200"
      } backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm`}
    >
      <div
        className={`p-6 border-b ${
          theme === "dark" ? "border-slate-700/50" : "border-slate-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2
              className={`text-xl font-semibold ${text.primary[theme]} mb-1 font-outfit`}
            >
              Leaderboard
            </h2>
            <p className={`${text.muted[theme]} text-sm font-outfit`}>
              {standings && standings.length > 0
                ? `${standings.length} members competing`
                : "No rankings yet"}
            </p>
          </div>
        </div>
      </div>

      {standings && standings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  theme === "dark" ? "border-slate-700/30" : "border-slate-200"
                }`}
              >
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Rank
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Player
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Joined
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Predictions
                </th>
                <th
                  className={`px-6 py-4 text-right text-sm font-medium font-outfit ${text.muted[theme]}`}
                >
                  Points
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark" ? "divide-slate-700/20" : "divide-slate-200"
              }`}
            >
              {standings.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    player.isCurrentUser
                      ? theme === "dark"
                        ? "bg-teal-900/20 border-teal-500/30"
                        : "bg-teal-50 border-teal-200"
                      : theme === "dark"
                      ? "hover:bg-slate-700/20"
                      : "hover:bg-slate-50"
                  } transition-colors ${player.isCurrentUser ? 'border-l-2' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-outfit ${
                        index === 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : index === 1
                          ? "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          : index === 2
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : theme === "dark"
                          ? "bg-slate-700/50 text-slate-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {player.displayName.charAt(0)}
                      </div>
                      <div>
                        <div
                          className={`${text.primary[theme]} font-medium font-outfit`}
                        >
                          {player.displayName}
                        </div>
                        <div
                          className={`${text.muted[theme]} text-sm font-outfit`}
                        >
                          @{player.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${text.secondary[theme]}`}>
                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className={`w-4 h-4 ${text.muted[theme]}`}
                      />
                      <span className="font-outfit">
                        {formatSafeDate(player.joinedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`${text.primary[theme]} font-medium font-outfit`}
                    >
                      {player.predictions || 0}
                    </div>
                    <div className={`${text.muted[theme]} text-sm font-outfit`}>
                      predictions made
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`text-lg font-bold ${text.primary[theme]} font-outfit`}
                    >
                      {player.points}
                    </div>
                    <div className={`text-sm ${text.muted[theme]} font-outfit`}>
                      points
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <TargetIcon
            className={`w-12 h-12 ${text.muted[theme]} mx-auto mb-4`}
          />
          <h3
            className={`text-lg font-semibold ${text.primary[theme]} mb-2 font-outfit`}
          >
            No Rankings Yet
          </h3>
          <p className={`${text.muted[theme]} font-outfit`}>
            Start making predictions to see the leaderboard!
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Predictions Content Component
const PredictionsContent = ({ leagueId }) => {
  const { theme } = useContext(ThemeContext);
  const { preferences, updatePreferences } = useUserPreferences();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentGameweek, setCurrentGameweek] = useState(15); // Default to current gameweek
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [selectedViewMode, setSelectedViewMode] = useState(
    // Migrate old 'members' preference to 'teams'
    preferences?.leaguePredictionViewMode === 'members' ? 'teams' : (preferences?.leaguePredictionViewMode || 'teams')
  );

  // Filter states - following standard pattern
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameweekFilter, setGameweekFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const data = await leagueAPI.getLeaguePredictions(leagueId);
        setPredictions(data);
      } catch (err) {
        console.error('Failed to fetch league predictions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchPredictions();
    }
  }, [leagueId]);

  // Handle view mode changes with preferences persistence
  const handleViewModeChange = (viewMode) => {
    setSelectedViewMode(viewMode);
    updatePreferences({ leaguePredictionViewMode: viewMode });
  };

  // Filter predictions based on active filters
  const filteredPredictions = predictions.filter((prediction) => {
    // Filter by status
    if (activeFilter === "pending" && prediction.status !== "pending") return false;
    if (activeFilter === "completed" && prediction.status !== "completed") return false;
    if (activeFilter === "correct" && !["exact", "partial"].includes(prediction.correct)) return false;

    // Filter by gameweek
    if (gameweekFilter !== "all" && prediction.gameweek !== Number(gameweekFilter)) return false;

    // Filter by member
    if (memberFilter !== "all" && prediction.userDisplayName !== memberFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        prediction.userDisplayName?.toLowerCase().includes(query) ||
        prediction.homeTeam?.toLowerCase().includes(query) ||
        prediction.awayTeam?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "gameweek") {
      return b.gameweek - a.gameweek;
    } else if (sortBy === "member") {
      return a.userDisplayName?.localeCompare(b.userDisplayName) || 0;
    } else if (sortBy === "points") {
      if (a.points === null && b.points !== null) return 1;
      if (a.points !== null && b.points === null) return -1;
      if (a.points === null && b.points === null) return 0;
      return b.points - a.points;
    }
    return 0;
  });

  // Get available gameweeks from predictions
  const availableGameweeks = [...new Set(predictions.map(p => p.gameweek))].sort((a, b) => b - a);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center py-12"
      >
        <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-teal-400' : 'border-teal-600'} border-t-transparent rounded-full animate-spin`}></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className={`text-red-500 mb-4`}>
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="font-outfit">Failed to load predictions</p>
        </div>
      </motion.div>
    );
  }

  // Show empty state only if no raw predictions exist, let filtered empty state be handled in render
  if (!predictions || predictions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <TargetIcon className={`w-12 h-12 ${text.muted[theme]} mx-auto mb-4`} />
        <h3
          className={`text-lg font-semibold ${text.primary[theme]} mb-2 font-outfit`}
        >
          No Predictions Yet
        </h3>
        <p className={`${text.muted[theme]} font-outfit`}>
          League members will appear here once they start making predictions
        </p>
      </motion.div>
    );
  }

  const handlePredictionSelect = (prediction) => {
    setSelectedPrediction(prediction);
    // Could open a detailed modal here if needed
    console.log('Selected prediction:', prediction);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header with View Toggle Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className={`text-lg font-semibold ${text.primary[theme]} font-outfit`}>
            League Predictions
          </h3>
          <p className={`${text.secondary[theme]} text-sm font-outfit`}>
            View and compare member predictions for this league
          </p>
        </div>

        {/* View Toggle Bar */}
        <div className="flex-shrink-0">
          <LeaguePredictionViewToggleBar
            viewMode={selectedViewMode}
            setViewMode={handleViewModeChange}
          />
        </div>
      </div>

      {/* Filters and Content Container */}
      <div
        className={`${
          theme === "dark"
            ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60"
            : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
        } rounded-xl border overflow-hidden font-outfit p-5`}
      >
        {/* Prediction Filters */}
        <LeaguePredictionFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          gameweekFilter={gameweekFilter}
          setGameweekFilter={setGameweekFilter}
          memberFilter={memberFilter}
          setMemberFilter={setMemberFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          predictions={predictions}
        />

        {/* Gameweek Selector - Moved below filters */}
        {availableGameweeks.length > 1 && (
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-slate-700/20">
            <label className={`text-sm font-medium ${text.primary[theme]}`}>
              Focus Gameweek:
            </label>
            <select
              value={currentGameweek}
              onChange={(e) => setCurrentGameweek(Number(e.target.value))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {availableGameweeks.map(gw => (
                <option key={gw} value={gw}>
                  Gameweek {gw}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* League Prediction Content with View System */}
        {sortedPredictions.length === 0 ? (
          <div className="text-center py-12">
            <TargetIcon className={`w-12 h-12 ${text.muted[theme]} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${text.primary[theme]} mb-2 font-outfit`}>
              No Predictions Found
            </h3>
            <p className={`${text.secondary[theme]} font-outfit`}>
              {activeFilter !== "all" || searchQuery || gameweekFilter !== "all" || memberFilter !== "all"
                ? "Try adjusting your filters to see more predictions."
                : "League members will appear here once they start making predictions."}
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <LeaguePredictionContentView
              viewMode={selectedViewMode}
              predictions={sortedPredictions}
              currentGameweek={currentGameweek}
              onPredictionSelect={handlePredictionSelect}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeagueDetailView;
