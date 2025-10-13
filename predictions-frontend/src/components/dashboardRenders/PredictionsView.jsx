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

// Import data and utilities
import { predictions, teamLogos } from "../../data/sampleData";

const PredictionsView = ({ handleEditPrediction }) => {  // Get theme context and user preferences
  const { theme } = useContext(ThemeContext);
  const { preferences } = useUserPreferences();
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameweekFilter, setGameweekFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [filterTeam, setFilterTeam] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState(preferences.defaultPredictionsView);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
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
  return (
    <div className="space-y-6">
      {/* Content container with integrated header, filters and predictions */}
      <div
        className={`${
          theme === "dark"
            ? "bg-slate-800/30 border-slate-700/50"
            : "bg-white border-slate-200"
        } backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm`}
      >
        {/* Header with View Toggle Bar */}
        <div
          className={`p-6 border-b ${
            theme === "dark" ? "border-slate-700/50" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2
                className={`text-xl font-semibold ${text.primary[theme]} mb-1 font-outfit`}
              >
                My Predictions
              </h2>
              <p className={`${text.muted[theme]} text-sm font-outfit`}>
                {sortedPredictions && sortedPredictions.length > 0
                  ? `${sortedPredictions.length} predictions • ${pendingPredictions.length} pending`
                  : "No predictions yet"}
              </p>
            </div>

            {/* View Toggle Bar */}
            <div className="flex-shrink-0">
              <PredictionViewToggleBar viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>
        </div>

        {/* Filters and Content Container */}
        <div className="p-5 font-outfit">
        {/* Prediction filters component */}
        <PredictionFilters
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
          />
        )}
        </div>
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
