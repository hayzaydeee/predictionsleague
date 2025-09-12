import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameweekChipsPanel from "../panels/GameweekChipsPanel";
import ViewToggleBar from "../ui/ViewToggleBar";
import ActiveChipsBanner from "../ui/ActiveChipsBanner";
import ContentView from "../fixtures/ContentView";
import FixtureFilters from "../fixtures/FixtureFilters";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { backgrounds, text } from "../../utils/themeUtils";
import { gameweeks, upcomingMatches } from "../../data/sampleData";
import { useClientSideFixtures } from "../../hooks/useClientSideFixtures";

const FixturesView = ({ handleFixtureSelect, toggleChipInfoModal }) => {
  // Get theme context and user preferences
  const { theme } = useContext(ThemeContext);
  const { preferences } = useUserPreferences();

  // Fetch fixtures using the new hybrid hook
  const {
    fixtures: liveFixtures,
    isLoading: fixturesLoading,
    isError: fixturesError,
    error: fixturesErrorDetails,
    dataQuality,
    stats
  } = useClientSideFixtures({
    competitions: ['PL', 'CL'], // Premier League and Champions League
    status: 'SCHEDULED',
    fallbackToSample: true, // Use sample data if external API fails
    includeUnpredicted: true
  });

  const [currentGameweek, setCurrentGameweek] = useState(
    gameweeks?.[0]?.id || 36
  );
  const [activeGameweekChips, setActiveGameweekChips] = useState([]);
  const [viewMode, setViewMode] = useState(preferences.defaultFixturesView);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [gameweekFilter, setGameweekFilter] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

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
  // Filter fixtures based on selected filters
  const filteredFixtures = (liveFixtures || []).filter((fixture) => {
    // Filter by status
    if (activeFilter === "unpredicted" && fixture.predicted) return false;
    if (activeFilter === "predicted" && !fixture.predicted) return false;

    // Filter by gameweek
    if (
      gameweekFilter !== "all" &&
      fixture.gameweek !== parseInt(gameweekFilter)
    )
      return false;

    // Filter by team
    if (
      filterTeam !== "all" &&
      fixture.homeTeam !== filterTeam &&
      fixture.awayTeam !== filterTeam
    )
      return false;

    // Filter by competition
    if (
      competitionFilter !== "all" &&
      fixture.competition !== competitionFilter
    )
      return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        fixture.homeTeam.toLowerCase().includes(query) ||
        fixture.awayTeam.toLowerCase().includes(query) ||
        fixture.venue?.toLowerCase().includes(query) ||
        fixture.competition?.toLowerCase().includes(query)
      );
    }

    return true;
  });

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
              Loading fixtures from {dataQuality?.usingFallback ? 'sample data' : 'live API'}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only show if not using fallback)
  if (fixturesError && !dataQuality?.usingFallback) {
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
                {dataQuality.usingFallback ? (
                  <span className="text-amber-500">• Using sample data</span>
                ) : (
                  <span className="text-green-500">• Live data</span>
                )}
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
        <ViewToggleBar viewMode={viewMode} setViewMode={setViewMode} />
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
          upcomingFixtures={upcomingMatches || []}
        />
      </motion.div>
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
          gameweekFilter={gameweekFilter}
          setGameweekFilter={setGameweekFilter}
          filterTeam={filterTeam}
          setFilterTeam={setFilterTeam}
          competitionFilter={competitionFilter}
          setCompetitionFilter={setCompetitionFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
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
