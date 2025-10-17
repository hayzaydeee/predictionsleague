import { useState, useContext } from "react";
import PredictionFilters from "../predictions/PredictionFilters";
import PotentialPointsSummary from "../panels/PotentialPointsSummary";
import PredictionContentView from "../predictions/PredictionContentView";
import PredictionBreakdownModal from "../predictions/PredictionBreakdownModal";
import PredictionViewToggleBar from "../predictions/PredictionViewToggleBar";
import EmptyState from "../common/EmptyState";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { text } from "../../utils/themeUtils";
import { useUserPredictions } from "../../hooks/useClientSideFixtures";

const PredictionsView = ({ handleEditPrediction }) => {
  // Get theme context and user preferences
  const { theme } = useContext(ThemeContext);
  const { preferences, updatePreference } = useUserPreferences();
  
  // Fetch user predictions from backend
  const { data: predictions = [], isLoading, error } = useUserPredictions({
    status: 'all'
  });
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameweekFilter, setGameweekFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [filterTeam, setFilterTeam] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState(preferences.defaultPredictionsView);
  const [cardStyle, setCardStyle] = useState(preferences.cardStyle);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Wrapper function to update both state and preferences
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    updatePreference("defaultPredictionsView", newViewMode);
  };
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  // Filter predictions based on active filter
  const filteredPredictions = predictions.filter((prediction) => {
    // Filter by status
    if (activeFilter === "pending" && prediction.status !== "pending")
      return false;
    if (activeFilter === "completed" && prediction.status !== "completed")
      return false;

    // Filter by gameweek
    if (
      gameweekFilter !== "all" &&
      prediction.gameweek !== Number(gameweekFilter)
    )
      return false;

    // Filter by team
    if (
      filterTeam !== "all" &&
      prediction.homeTeam !== filterTeam &&
      prediction.awayTeam !== filterTeam
    )
      return false;

    // Filter by search query
    if (
      searchQuery &&
      !`${prediction.homeTeam} vs ${prediction.awayTeam}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });
  // For PotentialPointsSummary: show pending predictions from the filtered set
  // This ensures consistency - if user filters by pending, both components show the same data
  // If user filters by something else, PotentialPointsSummary still only shows pending predictions
  const pendingPredictions = activeFilter === "pending" 
    ? filteredPredictions  // When filtering by pending, use the already filtered data
    : predictions.filter((prediction) => prediction.status === "pending"); // Otherwise, show all pending predictions

  // Sort predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "team") {
      return a.homeTeam?.name?.localeCompare(b.homeTeam?.name) || 0;
    } else if (sortBy === "points") {
      // Handle null points (pending predictions)
      if (a.points === null && b.points !== null) return 1;
      if (a.points !== null && b.points === null) return -1;
      if (a.points === null && b.points === null) return 0;
      return b.points - a.points;
    }
    return 0;
  });
  // The edit button handler passes the prediction to the parent
  const onEditClick = (prediction) => {
    handleEditPrediction(prediction);
  };

  // Handle prediction card click to open breakdown modal
  const handlePredictionSelect = (prediction) => {
    setSelectedPrediction(prediction);
    setShowBreakdownModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowBreakdownModal(false);
    setSelectedPrediction(null);
  };

  // Handle edit from modal
  const handleEditFromModal = (prediction) => {
    handleCloseModal();
    handleEditPrediction(prediction);
  };
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className={`${theme === 'dark' ? 'text-teal-100' : 'text-teal-700'} text-3xl font-bold font-dmSerif`}>
          My Predictions
        </h1>
        <div className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-xl p-8 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className={`${text.secondary[theme]} font-outfit`}>Loading predictions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className={`${theme === 'dark' ? 'text-teal-100' : 'text-teal-700'} text-3xl font-bold font-dmSerif`}>
          My Predictions
        </h1>
        <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} rounded-xl p-8 text-center border`}>
          <p className={`${theme === 'dark' ? 'text-red-300' : 'text-red-700'} font-outfit`}>
            Failed to load predictions: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`${theme === 'dark' ? 'text-teal-100' : 'text-teal-700'} text-3xl font-bold font-dmSerif`}>
            My Predictions
          </h1>
          <p className={`${text.secondary[theme]} font-outfit`}>
            View and manage your predictions for past and upcoming matches
          </p>
        </div>

        {/* View toggle controls */}
        <PredictionViewToggleBar viewMode={viewMode} setViewMode={handleViewModeChange} />
      </div>
      
      {/* Potential Points Summary - Always visible but only shows pending predictions */}
      {pendingPredictions.length > 0 && (
        <PotentialPointsSummary
          predictions={pendingPredictions}
        />
      )}

      {/* Content container with filters and predictions */}
      <div
        className={`${
          theme === "dark"
            ? "backdrop-blur-xl border-slate-700/50 bg-slate-900/60"
            : "border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
        } rounded-xl border mb-5 overflow-hidden font-outfit p-5`}
      >
        {/* Prediction filters component */}
        <PredictionFilters
          predictions={predictions}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          gameweekFilter={gameweekFilter}
          setGameweekFilter={setGameweekFilter}
          filterTeam={filterTeam}
          setFilterTeam={setFilterTeam}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          cardStyle={cardStyle}
          setCardStyle={setCardStyle}
        />

        {/* Prediction Content */}
        {sortedPredictions.length === 0 ? (
          <EmptyState />
        ) : (
          <PredictionContentView
            viewMode={viewMode}
            predictions={sortedPredictions}
            onPredictionSelect={handlePredictionSelect}
            onEditClick={onEditClick}
            searchQuery={searchQuery}
            cardStyle={cardStyle}
          />
        )}
      </div>

      {/* Prediction Breakdown Modal */}
      <PredictionBreakdownModal
        isOpen={showBreakdownModal}
        prediction={selectedPrediction}
        onClose={handleCloseModal}
        onEdit={handleEditFromModal}
      />
    </div>
  );
};

export default PredictionsView;
