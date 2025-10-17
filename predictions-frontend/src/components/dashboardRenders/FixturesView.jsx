import React, { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameweekChipsPanel from "../panels/GameweekChipsPanel";
import ViewToggleBar from "../ui/ViewToggleBar";
import ViewToggleBarOption1 from "../ui/ViewToggleBarOption1";
import ViewToggleBarOption2 from "../ui/ViewToggleBarOption2";
import ViewToggleBarOption3 from "../ui/ViewToggleBarOption3";
import ViewToggleBarHybrid from "../ui/ViewToggleBarHybrid";
import ActiveChipsBanner from "../ui/ActiveChipsBanner";
import ContentView from "../fixtures/ContentView";
import FixtureFilters from "../fixtures/FixtureFilters";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { useChipManagement } from "../../context/ChipManagementContext";
import { backgrounds, text } from "../../utils/themeUtils";
import { useFixtures } from "../../hooks/useFixtures";
import { fixtureFilters } from "../../services/api/externalFixturesAPI";
import { usePredictionTracker } from "../../utils/predictionTracker";
import { spacing, padding, textScale } from "../../utils/mobileScaleUtils";

const FixturesView = ({ handleFixtureSelect, toggleChipInfoModal }) => {
  // Get theme context and user preferences
  const { theme } = useContext(ThemeContext);
  const { preferences, updatePreference } = useUserPreferences();
  
  // Get chip management context
  const { useChip, undoChipUsage } = useChipManagement();

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

  // Use prediction tracker
  const predictionStatus = usePredictionTracker(liveFixtures);

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
  const [showFilters, setShowFilters] = useState(false);

  // Handle applying gameweek chips
  const handleApplyGameweekChip = (chipId, gameweek, isRemoval = false) => {
    if (isRemoval) {
      // Remove from local state
      setActiveGameweekChips((prev) => prev.filter((id) => id !== chipId));
      
      // Undo chip usage in chip management context
      undoChipUsage(chipId, gameweek);
      
      console.log(`✅ Removed gameweek chip ${chipId} for gameweek ${gameweek}`);
    } else {
      // Use chip through chip management context
      const result = useChip(chipId, gameweek);
      
      if (result.success) {
        // Add to local state only if successful
        setActiveGameweekChips((prev) => [...prev, chipId]);
        console.log(`✅ Applied gameweek chip ${chipId} for gameweek ${gameweek}`);
      } else {
        console.error(`❌ Failed to apply chip ${chipId}:`, result.reason);
        // Optionally show an error message to the user
      }
    }
  };
  // First, enhance ALL fixtures with prediction status (before filtering)
  const enhancedFixtures = useMemo(() => {
    if (!liveFixtures) return [];
    
    return liveFixtures.map(fixture => ({
      ...fixture,
      userPrediction: predictionStatus.getPrediction(
        fixture.id, 
        fixture.homeTeam?.name || fixture.homeTeam, 
        fixture.awayTeam?.name || fixture.awayTeam
      ),
      hasPrediction: predictionStatus.hasPrediction(
        fixture.id, 
        fixture.homeTeam?.name || fixture.homeTeam, 
        fixture.awayTeam?.name || fixture.awayTeam
      )
    }));
  }, [liveFixtures, predictionStatus]);

  // Then filter the enhanced fixtures
  const filteredFixtures = useMemo(() => {
    if (!enhancedFixtures) return [];
    
    return fixtureFilters.applyFilters(enhancedFixtures, {
      date: dateFilter,
      status: activeFilter,
      search: searchQuery
    });
  }, [enhancedFixtures, dateFilter, activeFilter, searchQuery]);

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
    <div className={spacing.normal}>
      {/* HERO SECTION - Prominent header with clear hierarchy */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-2xl sm:text-3xl font-bold font-dmSerif mb-0.5`}
          >
            Fixtures
          </h1>
          <p className={`${text.secondary[theme]} font-outfit text-xs sm:text-sm opacity-70`}>
            View and predict upcoming fixtures
          </p>
        </div>

        {/* View toggle controls - HYBRID: Bottom Sheet (mobile) + Dropdown (desktop) */}
        <ViewToggleBarHybrid viewMode={viewMode} setViewMode={handleViewModeChange} />
        
        {/* TESTING OTHER OPTIONS (uncomment to test individually): */}
        {/* <ViewToggleBarOption1 viewMode={viewMode} setViewMode={handleViewModeChange} /> */}
        {/* <ViewToggleBarOption2 viewMode={viewMode} setViewMode={handleViewModeChange} /> */}
        {/* <ViewToggleBarOption3 viewMode={viewMode} setViewMode={handleViewModeChange} /> */}
      </div>
      {/* CHIP STRATEGY SECTION - Elevated card with shadow */}
      <motion.div
        initial={{ height: "auto" }}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3 }}
        className="mb-4 sm:mb-5"
      >
        <GameweekChipsPanel
          currentGameweek={currentGameweek}
          onApplyChip={handleApplyGameweekChip}
          toggleChipInfoModal={toggleChipInfoModal}
          activeMatchChips={[]}
          upcomingFixtures={liveFixtures || []}
        />
      </motion.div>

      {/* API STATUS BANNER - Attention-grabbing warning */}
      {(hasApiError || !predictionsAvailable) && (
        <div
          className={`${
            theme === "dark"
              ? "backdrop-blur-xl border-amber-700/50 bg-amber-900/20 shadow-lg shadow-amber-900/20"
              : "border-amber-200 bg-amber-50/80 backdrop-blur-sm shadow-md shadow-amber-500/10"
          } rounded-xl border mb-4 sm:mb-5 overflow-hidden font-outfit p-3 sm:p-4`}
        >
          <div className="flex items-center gap-3">
            <div className="text-amber-500 text-lg">
              {hasApiError ? "⚠️" : "ℹ️"}
            </div>
            <div className="flex-1">
              <div className={`${text.primary[theme]} font-semibold text-sm`}>
                {hasApiError && "External Fixtures API Unavailable"}
                {!predictionsAvailable && !hasApiError && "Predictions Service Unavailable"}
              </div>
              <div className={`${text.secondary[theme]} text-xs mt-1 opacity-80`}>
                {hasApiError && "Unable to connect to external fixtures API. Please check your connection or try again later."}
                {!predictionsAvailable && "User predictions will be available when backend is connected."}
              </div>
            </div>
            {dataQuality?.totalFixtures > 0 && (
              <div className={`${text.secondary[theme]} text-xs text-right`}>
                <div>{dataQuality.totalFixtures} fixtures</div>
                {stats && (
                  <div className="text-green-600 font-medium">
                    {Math.round(dataQuality.predictionRate * 100)}% predicted
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN FIXTURES CONTAINER - Primary content card with elevation */}
      <div
        className={`${
          theme === "dark"
            ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60 shadow-xl shadow-slate-950/50"
            : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-900/5"
        } rounded-xl border mb-5 overflow-hidden font-outfit`}
      >
        {/* Active gameweek chips banner */}
        <AnimatePresence>
          {activeGameweekChips.length > 0 && (
            <div className="border-b border-slate-700/30">
              <ActiveChipsBanner
                activeGameweekChips={activeGameweekChips}
                currentGameweek={currentGameweek}
              />
            </div>
          )}
        </AnimatePresence>

        {/* FILTERS SECTION - Separated and de-emphasized */}
        <div className={`${
          theme === "dark" 
            ? "bg-slate-800/30 border-b border-slate-700/30" 
            : "bg-slate-50/50 border-b border-slate-200/50"
        } ${padding.cardCompact}`}>
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
            fixtures={enhancedFixtures || []}
          />
        </div>

        {/* FIXTURES CONTENT - Main focus area with breathing room */}
        <div className={padding.cardCompact}>
          <ContentView
            viewMode={viewMode}
            fixtures={filteredFixtures}
            onFixtureSelect={onFixtureSelect}
            activeGameweekChips={activeGameweekChips}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default FixturesView;
