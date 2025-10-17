import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, addMinutes } from "date-fns";
import { ThemeContext } from "../../context/ThemeContext";
import { backgrounds, text, getThemeStyles } from "../../utils/themeUtils";
import { InfoCircledIcon, ClockIcon, ExclamationTriangleIcon, CheckIcon } from "@radix-ui/react-icons";
import { userPredictionsAPI } from "../../services/api/userPredictionsAPI";
import { showToast } from "../../services/notificationService";
import { useChipManagement } from "../../context/ChipManagementContext";

// Import modular components
import ModalHeader from "./modal/ModalHeader";
import StepIndicator from "./modal/StepIndicator";
import ScorePredictionStep from "./modal/ScorePredictionStep";
import GoalscorersStep from "./modal/GoalscorersStep";
import ReviewStep from "./modal/ReviewStep";
import ModalFooter from "./modal/ModalFooter";

export default function PredictionsModal({
  fixture,
  onClose,
  onSave,
  activeGameweekChips = [],
  initialValues = null,
  isEditing = false,
  toggleChipInfoModal,
}) {
  const { theme } = useContext(ThemeContext);
  
  // Chip management with backend integration
  const { 
    validateChips, 
    recordChipUsage, 
    isValidating, 
    isRecording 
  } = useChipManagement();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [homeScore, setHomeScore] = useState(initialValues?.homeScore || 0);
  const [awayScore, setAwayScore] = useState(initialValues?.awayScore || 0);
  const [homeScorers, setHomeScorers] = useState(initialValues?.homeScorers || []);
  const [awayScorers, setAwayScorers] = useState(initialValues?.awayScorers || []);
  const [selectedChips, setSelectedChips] = useState(initialValues?.chips || []);
  
  // UI state
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation on step change
  useEffect(() => {
    const newErrors = {};

    if (currentStep === 2) {
      // Validate scorers are selected if there are scores
      if (homeScore > 0) {
        const missingHomeScorers = homeScorers.some((scorer) => !scorer);
        if (missingHomeScorers) {
          newErrors.homeScorers = "Please select all goalscorers";
        }
      }
      if (awayScore > 0) {
        const missingAwayScorers = awayScorers.some((scorer) => !scorer);
        if (missingAwayScorers) {
          newErrors.awayScorers = "Please select all goalscorers";
        }
      }
    }

    setErrors(newErrors);
  }, [currentStep, homeScore, awayScore, homeScorers, awayScorers]);

  // Calculate deadline status
  const deadlineStatus = () => {
    if (!fixture?.date) return { isPast: false, timeLeft: null };
    
    const now = new Date();
    const matchDate = parseISO(fixture.date);
    const deadline = addMinutes(matchDate, -30); // 30 minutes before kickoff
    
    return {
      isPast: now > deadline,
      timeLeft: deadline.getTime() - now.getTime(),
    };
  };

  // Update scorer arrays when scores change
  useEffect(() => {
    setHomeScorers(Array(homeScore).fill(""));
    setAwayScorers(Array(awayScore).fill(""));
  }, [homeScore, awayScore]);

  // Step navigation
  const nextStep = () => {
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(1, prevStep - 1));
  };

  // Form submission with 3-step chip integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Merge match chips (selectedChips) with gameweek chips (activeGameweekChips)
    const allChips = [...new Set([...selectedChips, ...activeGameweekChips])];

    const frontendPrediction = {
      homeScore,
      awayScore,
      homeScorers,
      awayScorers,
      // DON'T include chips in prediction payload - will be recorded separately
    };

    try {
      console.log('🎯 Submitting prediction:', {
        fixture: fixture.id,
        prediction: frontendPrediction,
        matchChips: selectedChips,
        gameweekChips: activeGameweekChips,
        allChips: allChips,
        teams: `${fixture.homeTeam} vs ${fixture.awayTeam}`
      });

      // STEP 1: Validate chips with backend (if any selected)
      if (allChips.length > 0) {
        console.log('🔍 Validating chips with backend...');
        
        try {
          const validation = await validateChips({
            chipIds: allChips,
            gameweek: fixture.gameweek,
            matchId: fixture.id
          });

          if (!validation.data.valid) {
            const errorMsg = validation.data.conflicts[0]?.reason || 'Chip validation failed';
            throw new Error(errorMsg);
          }

          console.log('✅ Chips validated successfully');
        } catch (validationError) {
          throw new Error(`Chip validation failed: ${validationError.message}`);
        }
      }

      // STEP 2: Submit prediction to backend
      const result = await userPredictionsAPI.makePrediction(frontendPrediction, fixture);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit prediction');
      }

      console.log('✅ Prediction submitted successfully');
      const predictionId = result.data?.id;

      // STEP 3: Record chip usage (if any selected)
      if (allChips.length > 0 && predictionId) {
        console.log('💾 Recording chip usage...');
        
        try {
          await recordChipUsage({
            predictionId,
            chipIds: allChips,
            gameweek: fixture.gameweek,
            matchId: fixture.id
          });

          console.log('✅ Chips recorded successfully');
        } catch (chipError) {
          // Chip recording failed, but prediction was saved
          // Don't fail the whole operation
          console.error('⚠️ Chip recording failed:', chipError.message);
          showToast(
            'Prediction saved, but chip tracking failed. Contact support.', 
            'warning'
          );
        }
      }

      // Success!
      showToast(
        isEditing ? 'Prediction updated successfully!' : 'Prediction submitted successfully!', 
        'success'
      );
      
      // Call onSave if provided (for parent component updates)
      if (onSave) {
        onSave(frontendPrediction);
      }
      
      setShowConfirmation(true);

      // Close modal after showing confirmation
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Prediction submission failed:', error.message);
      showToast(
        `Failed to ${isEditing ? 'update' : 'submit'} prediction: ${error.message}`, 
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle no fixture case
  if (!fixture) {
    return (
      <div
        className={`${getThemeStyles(
          theme,
          backgrounds.card
        )} backdrop-blur-lg rounded-xl border p-6`}
      >
        <div className="text-center p-8">
          <InfoCircledIcon
            className={`mx-auto mb-4 w-8 h-8 ${getThemeStyles(
              theme,
              text.muted
            )}`}
          />
          <p className={`${getThemeStyles(theme, text.primary)} font-outfit`}>
            No fixture selected
          </p>
        </div>
      </div>
    );
  }

  const deadline = deadlineStatus();
  const modalTitle = isEditing ? "Edit Prediction" : "Make Prediction";

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 ${getThemeStyles(theme, {
        dark: 'bg-slate-950/90',
        light: 'bg-slate-200/80'
      })} backdrop-blur-lg`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col relative rounded-2xl overflow-hidden shadow-2xl ${getThemeStyles(theme, {
          dark: "bg-slate-900 border border-slate-700/60",
          light: "bg-white border border-slate-200",
        })}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deadline warning */}
        {deadline.isPast && (
          <div className={`p-4 border-b ${getThemeStyles(theme, {
            dark: 'bg-red-900/20 border-red-700/30',
            light: 'bg-red-50 border-red-200'
          })}`}>
            <div className={`flex items-center text-sm font-outfit ${getThemeStyles(theme, {
              dark: 'text-red-300',
              light: 'text-red-700'
            })}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getThemeStyles(theme, {
                dark: 'bg-red-500/20',
                light: 'bg-red-100'
              })}`}>
                <ExclamationTriangleIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium mb-1">Deadline Passed</div>
                <div className={`text-xs ${getThemeStyles(theme, {
                  dark: 'text-red-400',
                  light: 'text-red-600'
                })}`}>
                  The prediction deadline for this match has passed. You can no longer make or edit predictions.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <ModalHeader 
          title={modalTitle}
          fixture={fixture}
          onClose={onClose}
          deadline={deadline}
        />

        {/* Step indicator */}
        <div className={`p-6 pb-4 border-b ${getThemeStyles(theme, {
          dark: 'border-slate-700/60',
          light: 'border-slate-200'
        })}`}>
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Content area */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Score Prediction */}
              {currentStep === 1 && (
                <ScorePredictionStep
                  fixture={fixture}
                  homeScore={homeScore}
                  awayScore={awayScore}
                  onHomeScoreChange={setHomeScore}
                  onAwayScoreChange={setAwayScore}
                />
              )}              {/* Step 2: Goalscorers & Chips */}
              {currentStep === 2 && (
                <GoalscorersStep
                  fixture={fixture}
                  homeScore={homeScore}
                  awayScore={awayScore}
                  homeScorers={homeScorers}
                  awayScorers={awayScorers}
                  selectedChips={selectedChips}
                  onHomeScorerChange={(index, value) => {
                    const newScorers = [...homeScorers];
                    newScorers[index] = value;
                    setHomeScorers(newScorers);
                  }}
                  onAwayScorerChange={(index, value) => {
                    const newScorers = [...awayScorers];
                    newScorers[index] = value;
                    setAwayScorers(newScorers);
                  }}
                  onToggleChip={(chipId) => {
                    setSelectedChips(prev => 
                      prev.includes(chipId) 
                        ? prev.filter(id => id !== chipId)
                        : [...prev, chipId]
                    );
                  }}
                  toggleChipInfoModal={toggleChipInfoModal}
                  errors={errors}
                />
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <ReviewStep
                  fixture={fixture}
                  homeScore={homeScore}
                  awayScore={awayScore}
                  homeScorers={homeScorers}
                  awayScorers={awayScorers}
                  selectedChips={selectedChips}
                  activeGameweekChips={activeGameweekChips}
                />
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer */}
        <ModalFooter
          currentStep={currentStep}
          totalSteps={3}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
          submitting={submitting}
          isValidating={isValidating}
          isRecording={isRecording}
        />

        {/* Success confirmation overlay */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 ${getThemeStyles(theme, {
                dark: 'bg-slate-900/95',
                light: 'bg-white/95'
              })}`}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center p-8"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${getThemeStyles(theme, {
                  dark: 'bg-emerald-500/20 border border-emerald-500/30',
                  light: 'bg-emerald-100 border border-emerald-200'
                })}`}>
                  <CheckIcon className={`w-10 h-10 ${getThemeStyles(theme, {
                    dark: 'text-emerald-400',
                    light: 'text-emerald-600'
                  })}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-3 font-outfit ${getThemeStyles(theme, text.primary)}`}>
                  {isEditing ? "Prediction Updated!" : "Prediction Submitted!"}
                </h3>
                <p className={`font-outfit ${getThemeStyles(theme, text.secondary)}`}>
                  {isEditing 
                    ? "Your prediction has been successfully updated."
                    : "Your prediction has been successfully submitted."
                  }
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
