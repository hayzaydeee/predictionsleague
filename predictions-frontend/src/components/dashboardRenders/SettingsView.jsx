import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { getThemeStyles, backgrounds, text } from "../../utils/themeUtils";
import {
  PrimaryButton,
  SecondaryButton,
  ToggleButton,
  FormButton,
  ActionButton,
  IconButton,
} from "../ui/buttons";
import {
  BellIcon,
  GearIcon,
  DownloadIcon,
  QuestionMarkCircledIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  AccessibilityIcon,
  ChevronDownIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import LogoManager from "../common/LogoManager";
import RulesAndPointsModal from "../common/RulesAndPointsModal";

const SettingsView = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { preferences, updatePreference, updateNestedPreference } =
    useUserPreferences();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Handlers for different settings
  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual data export API
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate export

      const exportData = {
        notifications: preferences.notifications,
        preferences,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `predictions-league-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowSuccess("Data exported successfully!");
      setTimeout(() => setShowSuccess(""), 3000);
    } catch (error) {
      console.error("Data export failed:", error);
      setErrors({ general: "Failed to export data. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const SettingCard = ({ children, title, description, icon: Icon }) => (
    <motion.div
      className={`${backgrounds.card[theme]} rounded-lg p-6 border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className={`w-5 h-5 ${text.accent[theme]}`} />}
        <div>
          <h3
            className={`${text.primary[theme]} font-outfit font-semibold text-lg`}
          >
            {title}
          </h3>
          {description && (
            <p className={`${text.secondary[theme]} text-sm mt-1 font-outfit`}>
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );

  const InputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required = false,
  }) => (
    <div className="space-y-2">
      <label
        className={`${text.primary[theme]} text-sm font-medium font-outfit block`}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-md font-outfit text-sm transition-colors ${
          theme === "dark"
            ? "bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
            : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
        } ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-400 text-xs font-outfit">{error}</p>}
    </div>
  );

  const SelectField = ({ label, value, onChange, options, error }) => (
    <div className="space-y-2">
      <label
        className={`${text.primary[theme]} text-sm font-medium font-outfit block`}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded-md font-outfit text-sm transition-colors ${
          theme === "dark"
            ? "bg-slate-800/60 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
            : "bg-white border-slate-200 text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
        } ${error ? "border-red-500" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs font-outfit">{error}</p>}
    </div>
  );

  const ToggleRow = ({ label, description, checked, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`w-4 h-4 ${text.secondary[theme]}`} />}
        <div>
          <p className={`${text.primary[theme]} font-outfit font-medium`}>
            {label}
          </p>
          {description && (
            <p className={`${text.secondary[theme]} text-sm font-outfit`}>
              {description}
            </p>
          )}
        </div>
      </div>
      <ToggleButton
        active={checked}
        onClick={() => onChange(!checked)}
        variant="chip"
        size="sm"
      />
    </div>
  );
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1
          className={`${
            theme === "dark" ? "text-teal-100" : "text-teal-700"
          } text-3xl font-bold font-dmSerif`}
        >
          Settings
        </h1>
        <p className={`${text.secondary[theme]} font-outfit mt-2`}>
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3"
          >
            <CheckIcon className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 font-outfit">{showSuccess}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Error Message */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          <p className="text-red-400 font-outfit">{errors.general}</p>
        </motion.div>
      )}

      <div className="space-y-8">
        {/* Notification Preferences */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Notification Preferences
          </h2>
          <SettingCard
            title="Notifications"
            description="Choose what notifications you want to receive"
            icon={BellIcon}
          >
            {" "}
            <div className="space-y-1 divide-y divide-slate-600/20">
              <ToggleRow
                label="Email Alerts"
                description="Receive important updates via email"
                checked={preferences.notifications.emailAlerts}
                onChange={(value) =>
                  updateNestedPreference("notifications", "emailAlerts", value)
                }
              />
              <ToggleRow
                label="Fixture Updates"
                description="Get notified when fixtures are updated"
                checked={preferences.notifications.fixtureUpdates}
                onChange={(value) =>
                  updateNestedPreference(
                    "notifications",
                    "fixtureUpdates",
                    value
                  )
                }
              />
              <ToggleRow
                label="Prediction Reminders"
                description="Reminders before prediction deadlines"
                checked={preferences.notifications.predictionReminders}
                onChange={(value) =>
                  updateNestedPreference(
                    "notifications",
                    "predictionReminders",
                    value
                  )
                }
              />
              <ToggleRow
                label="League Invitations"
                description="Notifications for league invitations"
                checked={preferences.notifications.leagueInvitations}
                onChange={(value) =>
                  updateNestedPreference(
                    "notifications",
                    "leagueInvitations",
                    value
                  )
                }
              />
              <ToggleRow
                label="Live Score Updates"
                description="Real-time score notifications"
                checked={preferences.notifications.liveScoreUpdates}
                onChange={(value) =>
                  updateNestedPreference(
                    "notifications",
                    "liveScoreUpdates",
                    value
                  )
                }
              />
              <ToggleRow
                label="Weekly Digest"
                description="Weekly summary of your activity"
                checked={preferences.notifications.weeklyDigest}
                onChange={(value) =>
                  updateNestedPreference("notifications", "weeklyDigest", value)
                }
              />
              <ToggleRow
                label="Marketing Emails"
                description="Updates about new features and promotions"
                checked={preferences.notifications.marketingEmails}
                onChange={(value) =>
                  updateNestedPreference(
                    "notifications",
                    "marketingEmails",
                    value
                  )
                }
              />
            </div>
          </SettingCard>
        </section>

        {/* Appearance */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Appearance
          </h2>
          <SettingCard
            title="Theme"
            description="Customize the look and feel of the application"
            icon={theme === "dark" ? MoonIcon : SunIcon}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${text.primary[theme]} font-outfit font-medium`}>
                  Current Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </p>
                <p className={`${text.secondary[theme]} text-sm font-outfit`}>
                  Switch between dark and light appearance
                </p>
              </div>
              <ToggleButton
                active={theme === "dark"}
                onClick={toggleTheme}
                variant="theme"
                icon={theme === "dark" ? <SunIcon /> : <MoonIcon />}
              />
            </div>
          </SettingCard>
        </section>

        {/* Application Preferences */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Application Preferences
          </h2>
          <SettingCard
            title="Interface Preferences"
            description="Customize your application experience"
            icon={GearIcon}
          >
            <div className="space-y-4 mb-6">
              {" "}
              <SelectField
                label="Language"
                value={preferences.language}
                onChange={(e) => updatePreference("language", e.target.value)}
                options={[
                  { value: "english", label: "English" },
                  { value: "spanish", label: "Spanish" },
                  { value: "french", label: "French" },
                  { value: "german", label: "German" },
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {" "}
                <SelectField
                  label="Default Dashboard View"
                  value={preferences.defaultDashboardView}
                  onChange={(e) =>
                    updatePreference("defaultDashboardView", e.target.value)
                  }
                  options={[
                    { value: "dashboard", label: "Dashboard" },
                    { value: "fixtures", label: "Fixtures" },
                    { value: "predictions", label: "Predictions" },
                    { value: "leagues", label: "Leagues" },
                    { value: "profile", label: "Profile" },
                  ]}
                />
                <SelectField
                  label="Default Fixtures View"
                  value={preferences.defaultFixturesView}
                  onChange={(e) =>
                    updatePreference("defaultFixturesView", e.target.value)
                  }
                  options={[
                    { value: "teams", label: "By Teams" },
                    { value: "list", label: "Grid View" },
                    { value: "stack", label: "Stack View" },
                    { value: "calendar", label: "Calendar View" },
                    { value: "table", label: "Table View" },
                    { value: "carousel", label: "Carousel View" },
                  ]}
                />
                <SelectField
                  label="Default Predictions View"
                  value={preferences.defaultPredictionsView}
                  onChange={(e) =>
                    updatePreference("defaultPredictionsView", e.target.value)
                  }
                  options={[
                    { value: "teams", label: "By Teams" },
                    { value: "list", label: "Grid View" },
                    { value: "table", label: "Table View" },
                    { value: "stack", label: "Stack View" },
                    { value: "calendar", label: "Calendar View" },
                    { value: "carousel", label: "Carousel View" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-1 divide-y divide-slate-600/20">
              <ToggleRow
                label="Show Button Titles"
                description="Display text labels on navigation buttons"
                checked={preferences.showButtonTitles}
                onChange={(value) =>
                  updatePreference("showButtonTitles", value)
                }
              />
            </div>
          </SettingCard>
        </section>

        {/* Accessibility Options */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Accessibility
          </h2>
          <SettingCard
            title="Accessibility Options"
            description="Improve the accessibility of the application"
            icon={AccessibilityIcon}
          >
            {" "}
            <div className="space-y-4 mb-6">
              <SelectField
                label="Text Size"
                value={preferences.textSize}
                onChange={(e) => updatePreference("textSize", e.target.value)}
                options={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                  { value: "extra-large", label: "Extra Large" },
                ]}
              />
            </div>
            <div className="space-y-1 divide-y divide-slate-600/20">
              <ToggleRow
                label="High Contrast Mode"
                description="Increase contrast for better visibility"
                checked={preferences.highContrast}
                onChange={(value) => updatePreference("highContrast", value)}
              />
              <ToggleRow
                label="Reduce Motion"
                description="Minimize animations and transitions"
                checked={preferences.reduceMotion}
                onChange={(value) => updatePreference("reduceMotion", value)}
              />
            </div>
          </SettingCard>
        </section>

        {/* Team Logo Management */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Team Logos
          </h2>
          <LogoManager />
        </section>

        {/* Data Management */}
        <section>
          <h2
            className={`${
              theme === "dark" ? "text-teal-100" : "text-teal-700"
            } text-xl font-bold mb-4 font-dmSerif`}
          >
            Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingCard
              title="Export Data"
              description="Download your account data"
              icon={DownloadIcon}
            >
              <p
                className={`${text.secondary[theme]} text-sm mb-4 font-outfit`}
              >
                Export your predictions, leagues, and settings data in JSON
                format.
              </p>
              <ActionButton
                color="indigo"
                variant="primary"
                onClick={handleExportData}
                loading={isLoading}
                icon={<DownloadIcon />}
              >
                Export Data
              </ActionButton>
            </SettingCard>

            <SettingCard
              title="Help & Support"
              description="Get help and contact support"
              icon={QuestionMarkCircledIcon}
            >
              <div className="space-y-3">
                <SecondaryButton
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setShowRulesModal(true)}
                >
                  <InfoCircledIcon className="mr-2 h-4 w-4" />
                  Rules & Points
                </SecondaryButton>
                <SecondaryButton
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => window.open("/help", "_blank")}
                >
                  View Documentation
                </SecondaryButton>
                <SecondaryButton
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() =>
                    window.open("mailto:support@predictionsleague.com")
                  }
                >
                  Contact Support
                </SecondaryButton>
              </div>
            </SettingCard>
          </div>
        </section>
      </div>
      
      <RulesAndPointsModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
};

export default SettingsView;
