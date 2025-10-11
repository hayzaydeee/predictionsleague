import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  Cross2Icon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { text, backgrounds } from "../../utils/themeUtils";
import { predictions } from "../../data/sampleData";

const PredictionFilters = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  gameweekFilter,
  setGameweekFilter,
  filterTeam,
  setFilterTeam,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
}) => {
  const { theme } = useContext(ThemeContext);

  // Extract unique values for filter options
  const availableGameweeks = [...new Set(predictions.map(p => p.gameweek))].sort((a, b) => b - a);
  const availableTeams = [...new Set(predictions.flatMap(p => [p.homeTeam, p.awayTeam]))].sort();

  // Filter options with counts
  const filterOptions = [
    { value: "all", label: "All Predictions", count: predictions.length },
    { value: "pending", label: "Pending", count: predictions.filter(p => p.status === "pending").length },
    { value: "completed", label: "Completed", count: predictions.filter(p => p.status === "completed").length },
  ];

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
    setGameweekFilter("all");
    setFilterTeam("all");
    setSortBy("date");
  };

  const hasActiveFilters = 
    activeFilter !== "all" || 
    searchQuery !== "" || 
    gameweekFilter !== "all" || 
    filterTeam !== "all" || 
    sortBy !== "date";

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${text.muted[theme]}`} />
            <input
              type="text"
              placeholder="Search predictions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                theme === "dark"
                  ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
              } focus:ring-2 focus:outline-none transition-colors`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${text.muted[theme]} hover:${text.primary[theme]} transition-colors`}
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeFilter === option.value
                    ? theme === "dark"
                      ? "bg-teal-600 text-white"
                      : "bg-teal-600 text-white"
                    : theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                } whitespace-nowrap`}
              >
                <span className="mr-1">{option.label}</span>
                <span
                  className={`inline-flex items-center justify-center w-5 h-4 text-xs rounded-full ${
                    activeFilter === option.value
                      ? "bg-white/20 text-white"
                      : theme === "dark"
                      ? "bg-slate-600 text-slate-300"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200"
            }`}
          >
            <MixerHorizontalIcon className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                  : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              }`}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t pt-4 pb-5 ${
              theme === "dark" ? "border-slate-700/50" : "border-slate-200"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gameweek Filter */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${text.secondary[theme]}`}>
                  Gameweek
                </label>
                <select
                  value={gameweekFilter}
                  onChange={(e) => setGameweekFilter(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-colors`}
                >
                  <option value="all">All Gameweeks</option>
                  {availableGameweeks.map((gw) => (
                    <option key={gw} value={gw}>
                      Gameweek {gw}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Filter */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${text.secondary[theme]}`}>
                  Team
                </label>
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-colors`}
                >
                  <option value="all">All Teams</option>
                  {availableTeams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${text.secondary[theme]}`}>
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-colors`}
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="team">Team (A-Z)</option>
                  <option value="points">Points (High to Low)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionFilters;