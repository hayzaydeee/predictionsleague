import { motion } from "framer-motion";
import { InfoCircledIcon, StarIcon, LightningBoltIcon, TargetIcon, RocketIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { backgrounds, text, getThemeStyles } from "../../utils/themeUtils";

const ChipStrategyModal = ({ isOpen, onClose }) => {
  const { theme } = useContext(ThemeContext);
  
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
        className={`${getThemeStyles(theme, {
          dark: "bg-slate-900/95 border-slate-700/60",
          light: "bg-white border-slate-200",
        })} rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border backdrop-blur-lg`}
      >
        {/* Header */}
        <div className={`${getThemeStyles(theme, backgrounds.secondary)} p-6 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <InfoCircledIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className={`${getThemeStyles(theme, text.primary)} text-2xl font-bold font-outfit`}>
                  Chip Strategy Guide
                </h3>
                <p className={`${getThemeStyles(theme, text.muted)} text-sm font-outfit`}>
                  Master the art of strategic chip usage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg ${getThemeStyles(theme, {
                dark: 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300',
                light: 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-600 hover:text-slate-700'
              })} flex items-center justify-center transition-all duration-200`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Introduction */}
          <div className={`${getThemeStyles(theme, backgrounds.card)} rounded-xl p-5 mb-6 border`}>
            <p className={`${getThemeStyles(theme, text.secondary)} text-sm leading-relaxed font-outfit`}>
              Strategic chip usage can dramatically improve your position in the
              league. Each chip has unique timing and application strategies that
              can maximize your points when used effectively.
            </p>
          </div>

          <div className="space-y-8">
            {/* Match-Specific Chips Section */}
            <div className={`${getThemeStyles(theme, backgrounds.card)} rounded-xl p-6 border`}>
              <div className="flex items-center gap-2 mb-6">
                <RocketIcon className="w-5 h-5 text-emerald-400" />
                <h4 className={`${getThemeStyles(theme, text.primary)} text-xl font-bold font-outfit`}>
                  Match Chips
                </h4>
                <div className={`flex-1 h-px ${getThemeStyles(theme, {
                  dark: 'bg-slate-700/50',
                  light: 'bg-slate-300/50'
                })}`}></div>
                <span className={`${getThemeStyles(theme, text.muted)} text-sm font-outfit`}>
                  Apply during predictions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Double Down Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-emerald-500/30',
                    light: 'bg-white border-slate-200 hover:border-emerald-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-900/40 rounded-lg flex items-center justify-center border border-emerald-700/30">
                      <span className="text-emerald-400 text-lg font-bold font-outfit">
                        2x
                      </span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        Double Down
                      </h5>
                      <div className="text-emerald-300/70 text-xs font-medium font-outfit">
                        2 gameweek cooldown
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed`}>
                    Double all points earned from one selected match prediction.
                  </p>

                  <div className="bg-emerald-900/20 rounded-md p-3 border border-emerald-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-emerald-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Best used on matches where you have high confidence,
                          especially if you've predicted goalscorers correctly.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Wildcard Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-purple-500/30',
                    light: 'bg-white border-slate-200 hover:border-purple-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-900/40 rounded-lg flex items-center justify-center border border-purple-700/30">
                      <span className="text-purple-400 text-lg font-bold font-outfit">
                        3x
                      </span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        Wildcard
                      </h5>
                      <div className="text-purple-300/70 text-xs font-medium font-outfit">
                        7 gameweek cooldown
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed`}>
                    Triple all points earned from one selected match prediction.
                  </p>

                  <div className="bg-purple-900/20 rounded-md p-3 border border-purple-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-purple-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Save for matches where you're extremely confident, or
                          derby matches with existing point multipliers.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Scorer Focus Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-sky-500/30',
                    light: 'bg-white border-slate-200 hover:border-sky-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-sky-900/40 rounded-lg flex items-center justify-center border border-sky-700/30">
                      <span className="text-sky-400 text-lg font-outfit">⚽</span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        Scorer Focus
                      </h5>
                      <div className="text-sky-300/70 text-xs font-medium font-outfit">
                        3 gameweek cooldown
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed`}>
                    Double all points from goalscorer predictions in one match.
                  </p>

                  <div className="bg-sky-900/20 rounded-md p-3 border border-sky-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-sky-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Best used in high-scoring matches where you're confident
                          about multiple goalscorers.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Opportunist Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-yellow-500/30',
                    light: 'bg-white border-slate-200 hover:border-yellow-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-900/40 rounded-lg flex items-center justify-center border border-yellow-700/30">
                      <span className="text-yellow-400 text-lg font-outfit">🎭</span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        Opportunist
                      </h5>
                      <div className="text-yellow-300/70 text-xs font-medium font-outfit">
                        2 gameweek cooldown
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed`}>
                    Score points even if goalscorer prediction is partially
                    correct.
                  </p>

                  <div className="bg-yellow-900/20 rounded-md p-3 border border-yellow-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-yellow-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Use when late team news impacts your predictions, such
                          as key players being injured or rested.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Gameweek Chips Section */}
            <div className={`${getThemeStyles(theme, backgrounds.card)} rounded-xl p-6 border`}>
              <div className="flex items-center gap-2 mb-6">
                <TargetIcon className="w-5 h-5 text-blue-400" />
                <h4 className={`${getThemeStyles(theme, text.primary)} text-xl font-bold font-outfit`}>
                  Gameweek Chips
                </h4>
                <div className={`flex-1 h-px ${getThemeStyles(theme, {
                  dark: 'bg-slate-700/50',
                  light: 'bg-slate-300/50'
                })}`}></div>
                <span className={`${getThemeStyles(theme, text.muted)} text-sm font-outfit`}>
                  Affects all predictions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Defense++ Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-blue-500/30',
                    light: 'bg-white border-slate-200 hover:border-blue-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-900/40 rounded-lg flex items-center justify-center border border-blue-700/30">
                      <span className="text-blue-400 text-lg font-outfit">🛡️</span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        Defense++
                      </h5>
                      <div className="text-blue-300/70 text-xs font-medium font-outfit">
                        5 gameweek cooldown
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed`}>
                    Earn +10 bonus points for each match where you correctly
                    predict a clean sheet.
                  </p>

                  <div className="bg-blue-900/20 rounded-md p-3 border border-blue-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-blue-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Best used when several defensive teams are playing
                          against weaker attacking sides.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* All-In Week Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`${getThemeStyles(theme, {
                    dark: 'bg-slate-800/50 border-slate-700/60 hover:border-red-500/30',
                    light: 'bg-white border-slate-200 hover:border-red-500/30'
                  })} rounded-lg p-5 border transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-900/40 rounded-lg flex items-center justify-center border border-red-700/30">
                      <span className="text-red-400 text-lg">🎯</span>
                    </div>
                    <div>
                      <h5 className={`${getThemeStyles(theme, text.primary)} text-lg font-semibold font-outfit`}>
                        All-In Week
                      </h5>
                      <div className="text-red-300/70 text-xs font-medium">
                        2 uses per season
                      </div>
                    </div>
                  </div>

                  <p className={`${getThemeStyles(theme, text.secondary)} text-sm mb-4 leading-relaxed font-outfit`}>
                    Doubles all points earned this gameweek (including
                    deductions).
                  </p>

                  <div className="bg-red-900/20 rounded-md p-3 border border-red-700/20">
                    <div className="flex items-start gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <h6 className="text-red-300 text-xs font-medium mb-1 font-outfit">
                          Strategy Tip:
                        </h6>
                        <p className={`${getThemeStyles(theme, text.secondary)} text-xs leading-relaxed font-outfit`}>
                          Use when confident across all matches, but be careful as
                          negative points are also doubled.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Chip Management Guidelines */}
            <div className={`${getThemeStyles(theme, backgrounds.card)} rounded-xl p-6 border`}>
              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <LightningBoltIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className={`text-emerald-300 text-lg font-semibold font-outfit ${getThemeStyles(theme, text.primary)}`}>
                  Chip Management Guidelines
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className={`space-y-3 text-sm font-outfit ${getThemeStyles(theme, text.secondary)}`}>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      You can use multiple chips every gameweek based on
                      availability and cooldowns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      Each chip has unique cooldown periods or season usage limits
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      Gameweek chips apply to all your predictions in that gameweek
                    </span>
                  </li>
                </ul>
                <ul className={`space-y-3 text-sm font-outfit ${getThemeStyles(theme, text.secondary)}`}>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      Match chips must be selected during individual match
                      predictions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      Strategic timing and fixture analysis are key to maximizing
                      chip effectiveness
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span>
                      Monitor community trends but trust your own analysis for
                      optimal results
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChipStrategyModal;