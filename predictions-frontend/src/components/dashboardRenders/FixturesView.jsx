import React, { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameweekChipsPanel from "../panels/GameweekChipsPanel";
import ViewToggleBar from "../ui/ViewToggleBar";
import ActiveChipsBanner from "../ui/ActiveChipsBanner";
import ContentView from "../fixtures/ContentView";
import FixtureFilters from "../fixtures/FixtureFilters";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { backgrounds, text } from "../../utils/themeUtils";
import { useFixtures } from "../../hooks/useFixtures";
import { fixtureFilters } from "../../services/api/externalFixturesAPI";

const FixturesView = ({ handleFixtureSelect, toggleChipInfoModal }) => {
  // Get theme context and user preferences
  const { theme } = useContext(ThemeContext);
  const { preferences, updatePreference } = useUserPreferences();

  // Fetch fixtures using the external API only
  const {
    fixtures: liveFixtures,
    isLoading: fixturesLoading,
    isError: fixturesError,
    error: fixturesErrorDetails,
    dataQuality,
    stats
  } = useFixtures({
    fallbackToSample: false // Use only external API data
  });

  // API Status and Error Handling  
  const hasApiError = fixturesError;
  const predictionsAvailable = dataQuality?.predictionsAPIAvailable ?? false;

  // Calculate current gameweek from fixtures data or use default
  const currentGameweekFromData = useMemo(() => {
    if (!liveFixtures || liveFixtures.length === 0) return 38;
    
    // Get the earliest upcoming gameweek from fixtures
    const upcomingGameweeks = liveFixtures
      .map(fixture => fixture.gameweek)
      .filter(Boolean)
      .sort((a, b) => a - b);
    
    return upcomingGameweeks[0] || 38;
  }, [liveFixtures]);

  const [currentGameweek, setCurrentGameweek] = useState(currentGameweekFromData);

  // Update current gameweek when data changes
  React.useEffect(() => {
    setCurrentGameweek(currentGameweekFromData);
  }, [currentGameweekFromData]);
  const [activeGameweekChips, setActiveGameweekChips] = useState([]);
  const [viewMode, setViewMode] = useState(preferences.defaultFixturesView);
  const [searchQuery, setSearchQuery] = useState("");

  // Wrapper function to update both state and preferences
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    updatePreference("defaultFixturesView", newViewMode);
  };
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // New: all or today
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(true);

  // Handle applying gameweek chips
  const handleApplyGameweekChip = (chipId, gameweek, isRemoval = false) => {
    if (isRemoval) {
      setActiveGameweekChips((prev) => prev.filter((id) => id !== chipId));
    } else {
      setActiveGameweekChips((prev) => [...prev, chipId]);
    }

    console.log(
      `${
        isRemoval ? "Removed" : "Applied"
      } gameweek chip ${chipId} for gameweek ${gameweek}`
    );
  };
  // Filter fixtures based on selected filters using client-side filtering
  const filteredFixtures = useMemo(() => {
    if (!liveFixtures) return [];
    
    return fixtureFilters.applyFilters(liveFixtures, {
      date: dateFilter,
      status: activeFilter,
      search: searchQuery
    });
  }, [liveFixtures, dateFilter, activeFilter, searchQuery]);

  // Handle fixture selection
  const onFixtureSelect = (fixture) => {
    handleFixtureSelect(fixture, activeGameweekChips);
  };

  // Loading state
  if (fixturesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className={`${
                theme === "dark" ? "text-teal-100" : "text-teal-700"
              } text-3xl font-bold font-dmSerif`}
            >
              Fixtures
            </h1>
            <p className={`${text.secondary[theme]} font-outfit`}>
              Loading fixtures...
            </p>
          </div>
        </div>
        <div
          className={`${
            theme === "dark"
              ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60"
              : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
          } rounded-xl border mb-5 overflow-hidden font-outfit p-8`}
        >
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className={`${text.secondary[theme]} ml-3`}>
              Loading fixtures from external API...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state - now always show if there's an error since we're not using fallback
  if (fixturesError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className={`${
                theme === "dark" ? "text-teal-100" : "text-teal-700"
              } text-3xl font-bold font-dmSerif`}
            >
              Fixtures
            </h1>
            <p className={`${text.secondary[theme]} font-outfit`}>
              Error loading fixtures
            </p>
          </div>
        </div>
        <div
          className={`${
            theme === "dark"
              ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60"
              : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
          } rounded-xl border mb-5 overflow-hidden font-outfit p-8`}
        >
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error Loading Fixtures</div>
            <p className={`${text.secondary[theme]} text-sm`}>
              {fixturesErrorDetails?.message || 'Unable to load fixtures data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-3xl font-bold font-dmSerif`}
          >
            Fixtures
          </h1>
          <p className={`${text.secondary[theme]} font-outfit`}>
            View and predict upcoming fixtures
            {dataQuality && (
              <span className="ml-2 text-xs">
                <span className="text-green-500">• Live API data</span>
                {stats && (
                  <span className="ml-2">
                    ({stats.predicted}/{stats.total} predicted)
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* View toggle controls */}
        <ViewToggleBar viewMode={viewMode} setViewMode={handleViewModeChange} />
      </div>
      {/* Collapsible Gameweek Chips Panel */}
      <motion.div
        initial={{ height: "auto" }}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3 }}
      >
        <GameweekChipsPanel
          currentGameweek={currentGameweek}
          onApplyChip={handleApplyGameweekChip}
          toggleChipInfoModal={toggleChipInfoModal}
          activeMatchChips={[]}
          upcomingFixtures={liveFixtures || []}
        />
      </motion.div>

      {/* API Status Banner */}
      {(hasApiError || !predictionsAvailable) && (
        <div
          className={`${
            theme === "dark"
              ? "backdrop-blur-xl border-amber-700/50 bg-amber-900/20"
              : "border-amber-200 bg-amber-50/80 backdrop-blur-sm shadow-sm"
          } rounded-xl border mb-3 overflow-hidden font-outfit p-4`}
        >
          <div className="flex items-center gap-3">
            <div className="text-amber-500">
              {hasApiError ? "⚠️" : ""}
            </div>
            <div className="flex-1">
              <div className={`${text.primary[theme]} font-medium text-sm`}>
                {hasApiError && "External Fixtures API Unavailable"}
                {!predictionsAvailable && !hasApiError && "Predictions Service Unavailable"}
              </div>
              <div className={`${text.secondary[theme]} text-xs mt-1`}>
                {hasApiError && "Unable to connect to external fixtures API. Please check your connection or try again later."}
                {!predictionsAvailable && "User predictions will be available when backend is connected."}
              </div>
            </div>
            {dataQuality?.totalFixtures > 0 && (
              <div className={`${text.secondary[theme]} text-xs text-right`}>
                <div>{dataQuality.totalFixtures} fixtures</div>
                {stats && (
                  <div className="text-green-600">
                    {Math.round(dataQuality.predictionRate * 100)}% predicted
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content container with active chips banner */}
      <div
        className={`${
          theme === "dark"
            ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60"
            : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
        } rounded-xl border mb-5 overflow-hidden font-outfit p-5`}
      >
        {/* Active gameweek chips banner */}
        <AnimatePresence>
          {activeGameweekChips.length > 0 && (
            <ActiveChipsBanner
              activeGameweekChips={activeGameweekChips}
              currentGameweek={currentGameweek}
            />
          )}
        </AnimatePresence>

        {/* Fixtures filter component */}
        <FixtureFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          fixtures={liveFixtures || []}
        />

        {/* Content view with filtered fixtures */}
        <ContentView
          viewMode={viewMode}
          fixtures={filteredFixtures}
          onFixtureSelect={onFixtureSelect}
          activeGameweekChips={activeGameweekChips}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default FixturesView;
