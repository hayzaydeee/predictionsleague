import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  Cross2Icon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { teams } from "../../data/sampleData";
import { ThemeContext } from "../../context/ThemeContext";
import { text, backgrounds } from "../../utils/themeUtils";
import { spacing, gaps, padding } from "../../utils/mobileScaleUtils";

const FixtureFilters = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  fixtures = [], // Add fixtures prop to calculate counts
}) => {
  const { theme } = useContext(ThemeContext);

  // Calculate filter counts based on fixtures
  const filterOptions = [
    { value: "all", label: "All Fixtures", count: fixtures.length },
    { value: "predicted", label: "Predicted", count: fixtures.filter(f => f.hasPrediction).length },
    { value: "unpredicted", label: "Unpredicted", count: fixtures.filter(f => !f.hasPrediction).length },
  ];

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
    setDateFilter("all");
    setSortBy("date");
  };

  const hasActiveFilters = 
    activeFilter !== "all" || 
    searchQuery !== "" || 
    dateFilter !== "all" || 
    sortBy !== "date";

  return (
    <div>
      {/* Main Filter Bar */}
      <div className="flex flex-col gap-2 sm:gap-3 items-stretch mb-3 sm:mb-4">
        {/* Search Input - Full width on mobile */}
        <div className="relative w-full">
          <MagnifyingGlassIcon className={`absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 ${text.muted[theme]}`} />
          <input
            type="text"
            placeholder="Search fixtures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border ${
              theme === "dark"
                ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            } focus:ring-2 focus:outline-none transition-colors`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 ${text.muted[theme]} hover:${text.primary[theme]} transition-colors p-1`}
            >
              <Cross2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons + Advanced Filters Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Filter Buttons */}
          <div className={`flex ${gaps.tight} flex-wrap flex-1`}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeFilter === option.value
                    ? theme === "dark"
                      ? "bg-teal-600 text-white"
                      : "bg-teal-600 text-white"
                    : theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                } whitespace-nowrap`}
              >
                <span className="hidden sm:inline mr-1.5">{option.label}</span>
                <span className="sm:hidden mr-1">{option.label === "Unpredicted" ? "ToDo" : option.label}</span>
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-2xs sm:text-xs rounded-full font-bold ${
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

          {/* Filter Toggle & Clear Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg text-md sm:text-sm md:text-base font-medium transition-colors ${
                theme === "dark"
                  ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200"
              }`}
            >
              <MixerHorizontalIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className={`px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg text-2xs sm:text-xs md:text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                    : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
            className={`border-t pt-3 sm:pt-4 pb-3 sm:pb-4 overflow-hidden ${
              theme === "dark" ? "border-slate-700/50" : "border-slate-200"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Date Filter */}
              <div>
                <label className={`block text-2xs sm:text-xs font-medium mb-1 sm:mb-2 ${text.secondary[theme]}`}>
                  Date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-colors`}
                >
                  <option value="all">All Matches</option>
                  <option value="today">Today's Matches</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className={`block text-2xs sm:text-xs font-medium mb-1 sm:mb-2 ${text.secondary[theme]}`}>
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-colors`}
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="gameweek">Gameweek</option>
                  <option value="team">Home Team (A-Z)</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FixtureFilters;
