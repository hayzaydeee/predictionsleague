import { motion } from "framer-motion";
import { InfoCircledIcon, StarIcon, LightningBoltIcon, TargetIcon, RocketIcon } from "@radix-ui/react-icons";
import { useContext, useMemo, memo } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { backgrounds, text, getThemeStyles } from "../../utils/themeUtils";

const ChipStrategyModal = memo(({ isOpen, onClose }) => {
  const { theme } = useContext(ThemeContext);
  
  // Memoize all theme-related styles to prevent recalculation
  const themeStyles = useMemo(() => ({
    modalBg: getThemeStyles(theme, {
      dark: "bg-slate-900/95 border-slate-700/60",
      light: "bg-white border-slate-200",
    }),
    headerBg: getThemeStyles(theme, backgrounds.secondary),
    cardBg: getThemeStyles(theme, backgrounds.card),
    iconBg: getThemeStyles(theme, {
      dark: 'bg-emerald-500/20',
      light: 'bg-emerald-100'
    }),
    closeBtn: getThemeStyles(theme, {
      dark: 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300',
      light: 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-600 hover:text-slate-700'
    }),
    titleText: getThemeStyles(theme, text.primary),
    mutedText: getThemeStyles(theme, text.muted),
    secondaryText: getThemeStyles(theme, text.secondary),
    divider: getThemeStyles(theme, {
      dark: 'bg-slate-700/50',
      light: 'bg-slate-300/50'
    })
  }), [theme]);

  // Memoize chip data to prevent recreation on every render
  const chipData = useMemo(() => ({
    matchChips: [
      {
        id: 'doubleDown',
        icon: '2x',
        name: 'Double Down',
        cooldown: 'Available every gameweek',
        description: 'Double all points earned from one selected match.',
        bgColor: 'emerald',
        hoverColor: 'emerald-500/30',
        tipTitle: 'Strategy Tip:',
        tip: 'Best used on matches where you have high confidence in your prediction, especially if you\'ve predicted goalscorers correctly.'
      },
      {
        id: 'wildcard',
        icon: '3x', 
        name: 'Wildcard',
        cooldown: 'Cooldown: 7 gameweeks between uses',
        description: 'Triple all points earned from one selected match.',
        bgColor: 'purple',
        hoverColor: 'purple-500/30',
        tipTitle: 'Strategy Tip:',
        tip: 'Save this for matches where you\'re extremely confident, or for derby matches where the points multiplier is already in effect.'
      },
      {
        id: 'scorerFocus',
        icon: '⚽',
        name: 'Scorer Focus', 
        cooldown: 'Cooldown: 5 gameweeks between uses',
        description: 'Doubles all points from goalscorer predictions in one match.',
        bgColor: 'green',
        hoverColor: 'green-500/30',
        tipTitle: 'Strategy Tip:',
        tip: 'Best used in high-scoring matches where you\'re confident about multiple goalscorers.'
      },
      {
        id: 'opportunist',
        icon: '⏱️',
        name: 'Opportunist',
        cooldown: 'Limited use: Available twice per season', 
        description: 'Change all six predictions up to 30 minutes before the first kickoff.',
        bgColor: 'amber',
        hoverColor: 'amber-500/30',
        tipTitle: 'Strategy Tip:',
        tip: 'Use when late team news significantly impacts your predictions, such as key players being injured or rested.'
      }
    ],
    gameweekChips: [
      {
        id: 'defenseBoost',
        icon: '�️',
        name: 'Defense++',
        usage: 'Cooldown: 5 gameweeks between uses',
        description: 'Earn 10 bonus points if you correctly predict clean sheets across all matches where you predicted them.',
        bgColor: 'blue',
        tipTitle: 'Strategy Tip:',
        tip: 'Best used when several defensive teams are playing against weaker attacking sides.'
      },
      {
        id: 'allInWeek', 
        icon: '�',
        name: 'All-In Week',
        usage: 'Limited use: Available twice per season',
        description: 'Doubles the entire gameweek score (including deductions).',
        bgColor: 'red',
        tipTitle: 'Strategy Tip:',  
        tip: 'Use when you\'re confident across all matches in a gameweek, but be careful as negative points are also doubled.'
      }
    ]
  }), []);
  
  // Memoized chip card component to prevent unnecessary re-renders
  const ChipCard = memo(({ chip, type = 'match' }) => {
    const colorMap = {
      emerald: { bg: 'bg-emerald-900/40', border: 'border-emerald-700/30', text: 'text-emerald-400', tip: 'text-emerald-300' },
      purple: { bg: 'bg-purple-900/40', border: 'border-purple-700/30', text: 'text-purple-400', tip: 'text-purple-300' },
      sky: { bg: 'bg-sky-900/40', border: 'border-sky-700/30', text: 'text-sky-400', tip: 'text-sky-300' },
      green: { bg: 'bg-green-900/40', border: 'border-green-700/30', text: 'text-green-400', tip: 'text-green-300' },
      amber: { bg: 'bg-amber-900/40', border: 'border-amber-700/30', text: 'text-amber-400', tip: 'text-amber-300' },
      blue: { bg: 'bg-blue-900/40', border: 'border-blue-700/30', text: 'text-blue-400', tip: 'text-blue-300' },
      red: { bg: 'bg-red-900/40', border: 'border-red-700/30', text: 'text-red-400', tip: 'text-red-300' }
    };
    
    const colors = colorMap[chip.bgColor] || colorMap.emerald;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${themeStyles.cardBg} rounded-lg p-5 border transition-all duration-200 hover:border-${chip.hoverColor || 'emerald-500/30'}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
            <span className={`${colors.text} text-lg ${typeof chip.icon === 'string' && chip.icon.length > 2 ? '' : 'font-bold font-outfit'}`}>
              {chip.icon}
            </span>
          </div>
          <div>
            <h5 className={`${themeStyles.titleText} text-lg font-semibold font-outfit`}>
              {chip.name}
            </h5>
            <div className={`text-xs font-medium font-outfit ${colors.tip}/70`}>
              {chip.cooldown || chip.usage}
            </div>
          </div>
        </div>

        <p className={`${themeStyles.secondaryText} text-sm mb-4 leading-relaxed`}>
          {chip.description}
        </p>

        <div className={`${colors.bg.replace('900/40', '900/20')} rounded-md p-3 border ${colors.border.replace('700/30', '700/20')}`}>
          <div className="flex items-start gap-2">
            <StarIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <h6 className={`text-xs font-medium mb-1 font-outfit ${colors.tip}`}>
                {chip.tipTitle}
              </h6>
              <p className={`${themeStyles.secondaryText} text-xs leading-relaxed font-outfit`}>
                {chip.tip}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  });
  
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
        <div className={`${themeStyles.headerBg} p-6 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeStyles.iconBg}`}>
                <InfoCircledIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className={`${themeStyles.titleText} text-2xl font-bold font-outfit`}>
                  Chip Strategy Guide
                </h3>
                <p className={`${themeStyles.mutedText} text-sm font-outfit`}>
                  Master the art of strategic chip usage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg ${themeStyles.closeBtn} flex items-center justify-center transition-all duration-200`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Introduction */}
          <div className={`${themeStyles.cardBg} rounded-xl p-5 mb-6 border`}>
            <p className={`${themeStyles.secondaryText} text-sm leading-relaxed font-outfit`}>
              Strategic chip usage can dramatically improve your position in the
              league. Each chip has unique timing and application strategies that
              can maximize your points when used effectively.
            </p>
          </div>

          <div className="space-y-8">
            {/* Match-Specific Chips Section */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <div className="flex items-center gap-2 mb-6">
                <RocketIcon className="w-5 h-5 text-emerald-400" />
                <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit`}>
                  Match Chips
                </h4>
                <div className={`flex-1 h-px ${themeStyles.divider}`}></div>
                <span className={`${themeStyles.mutedText} text-sm font-outfit`}>
                  Apply during predictions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chipData.matchChips.map((chip) => (
                  <ChipCard key={chip.id} chip={chip} type="match" />
                ))}
              </div>
            </div>

            {/* Gameweek Chips Section */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <div className="flex items-center gap-2 mb-6">
                <TargetIcon className="w-5 h-5 text-blue-400" />
                <h4 className={`${themeStyles.titleText} text-xl font-bold font-outfit`}>
                  Gameweek Chips
                </h4>
                <div className={`flex-1 h-px ${themeStyles.divider}`}></div>
                <span className={`${themeStyles.mutedText} text-sm font-outfit`}>
                  Affects all predictions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chipData.gameweekChips.map((chip) => (
                  <ChipCard key={chip.id} chip={chip} type="gameweek" />
                ))}
              </div>
            </div>

            {/* Chip Management Guidelines */}
            <div className={`${themeStyles.cardBg} rounded-xl p-6 border`}>
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-8 h-8 rounded-lg ${themeStyles.iconBg} flex items-center justify-center mt-0.5`}>
                  <LightningBoltIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className={`${themeStyles.titleText} text-lg font-semibold font-outfit`}>
                  Chip Management Guidelines
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className={`space-y-3 text-sm font-outfit ${themeStyles.secondaryText}`}>
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
                <ul className={`space-y-3 text-sm font-outfit ${themeStyles.secondaryText}`}>
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
});

ChipStrategyModal.displayName = 'ChipStrategyModal';

export default ChipStrategyModal;