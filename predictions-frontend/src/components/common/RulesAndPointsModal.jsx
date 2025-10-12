import { motion } from "framer-motion";
import { InfoCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useContext, useMemo, memo } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { getThemeStyles, backgrounds, text } from "../../utils/themeUtils";

const RulesAndPointsModal = memo(({ isOpen, onClose }) => {
  const { theme } = useContext(ThemeContext);
  
  // Memoize all theme-related styles
  const themeStyles = useMemo(() => ({
    modalBg: getThemeStyles(theme, {
      dark: "bg-slate-900/95 border-slate-700/60",
      light: "bg-white border-slate-200",
    }),
    headerBg: getThemeStyles(theme, backgrounds.secondary),
    cardBg: getThemeStyles(theme, backgrounds.card),
    iconBg: getThemeStyles(theme, {
      dark: 'bg-blue-500/20',
      light: 'bg-blue-100'
    }),
    closeBtn: getThemeStyles(theme, {
      dark: 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300',
      light: 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-600 hover:text-slate-700'
    }),
    titleText: getThemeStyles(theme, text.primary),
    mutedText: getThemeStyles(theme, text.muted),
    secondaryText: getThemeStyles(theme, text.secondary),
  }), [theme]);

  // Memoized scoring data
  const scoringData = useMemo(() => ({
    basicPoints: [
      { points: 5, name: 'Correct winner', description: 'Predict the right match winner.' },
      { points: 7, name: 'Correct draw prediction', description: 'Successfully predict that the match will end in a draw.' },
      { points: 10, name: 'Exact scoreline', description: 'Predict the precise final score of the match.' },
      { points: 15, name: 'Exact scoreline with scorers', description: 'Predict both the correct score and all goalscorers correctly.' },
      { points: 2, name: 'Correct goalscorer', description: 'Each correctly predicted player who scores in the match.' },
      { points: 4, name: 'Correct own goal prediction', description: 'Successfully predict an own goal in the match.' },
      { points: -1, name: 'Incorrect prediction (2+ goal difference)', description: 'Penalty for predictions that are significantly wrong.' }
    ],
    bonusPoints: [
      { points: '1.5x', name: 'Derby match multiplier', description: 'All points are multiplied by 1.5 for predictions involving traditional rivalries.' },
      { points: '10', name: 'Clean sheet bonus', description: 'Additional points when you correctly predict a team will not concede.' }
    ],
    gameRules: [
      { rule: 'Six Matches Per Gameweek', description: 'Players predict results for 6 matches each gameweek (those involving the EPL\'s "Big Six" teams).' },
      { rule: 'Submission Deadline', description: 'Predictions must be submitted 45min before kickoff of each match.' },
      { rule: 'League Standings', description: 'League standings are updated based on total points accumulated.' },
      { rule: 'Private Leagues', description: 'Create or join private leagues to compete with friends and colleagues.' }
    ]
  }), []);
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${themeStyles.modalBg} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border backdrop-blur-lg`}
      >
        {/* Header */}
        <div className={`${themeStyles.headerBg} p-6 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeStyles.iconBg}`}>
                <InfoCircledIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className={`${themeStyles.titleText} text-2xl font-bold font-outfit`}>
                  Rules & Scoring System
                </h3>
                <p className={`${themeStyles.mutedText} text-sm font-outfit`}>
                  Complete guide to PredictionsLeague rules and points
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg ${themeStyles.closeBtn} flex items-center justify-center transition-all duration-200`}
            >
              <Cross2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            
            {/* Game Rules Section */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit mb-6`}>
                Game Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scoringData.gameRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-opacity-20">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className={`${themeStyles.titleText} font-semibold font-outfit mb-1`}>
                        {rule.rule}
                      </h5>
                      <p className={`${themeStyles.secondaryText} text-sm`}>
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Points Section */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit mb-6`}>
                Basic Points
              </h4>
              <div className="space-y-3">
                {scoringData.basicPoints.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        item.points < 0 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </div>
                      <div>
                        <h5 className={`${themeStyles.titleText} font-semibold font-outfit`}>
                          {item.name}
                        </h5>
                        <p className={`${themeStyles.secondaryText} text-sm`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus Points Section */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit mb-6`}>
                Bonus Points & Multipliers
              </h4>
              <div className="space-y-3">
                {scoringData.bonusPoints.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-amber-500/20 text-amber-400">
                        {item.points}
                      </div>
                      <div>
                        <h5 className={`${themeStyles.titleText} font-semibold font-outfit`}>
                          {item.name}
                        </h5>
                        <p className={`${themeStyles.secondaryText} text-sm`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Calculation */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit mb-4`}>
                Example Calculation
              </h4>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'} border`}>
                <p className={`${themeStyles.secondaryText} text-sm mb-3`}>
                  <strong>Scenario:</strong> Manchester United vs Liverpool (Derby Match)
                </p>
                <p className={`${themeStyles.secondaryText} text-sm mb-3`}>
                  <strong>Your Prediction:</strong> Man United 2-1 Liverpool, with Sancho scoring
                </p>
                <p className={`${themeStyles.secondaryText} text-sm mb-3`}>
                  <strong>Actual Result:</strong> Man United 2-1 Liverpool, Sancho scores
                </p>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className={themeStyles.secondaryText}>Exact scoreline:</span>
                    <span className={themeStyles.titleText}>+10 points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeStyles.secondaryText}>Correct goalscorer:</span>
                    <span className={themeStyles.titleText}>+2 points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeStyles.secondaryText}>Derby multiplier (1.5x):</span>
                    <span className={themeStyles.titleText}>12 × 1.5</span>
                  </div>
                  <div className={`flex justify-between text-sm font-bold pt-2 border-t ${
                    theme === 'dark' ? 'border-green-700/30' : 'border-green-200'
                  }`}>
                    <span className={themeStyles.titleText}>Total:</span>
                    <span className="text-green-400">18 points</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

RulesAndPointsModal.displayName = 'RulesAndPointsModal';

export default RulesAndPointsModal;