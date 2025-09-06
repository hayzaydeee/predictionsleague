import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { PersonIcon, BadgeIcon, GearIcon, ActivityLogIcon, BarChartIcon } from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { text } from "../../utils/themeUtils";
import ProfileOverview from "./ProfileOverview";
import ProfileAchievements from "./ProfileAchievements";
import ProfileSettings from "./ProfileSettings";
import PredictionHistory from "./PredictionHistory";
import ProfileStatistics from "./ProfileStatistics";

const ProfileTabs = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: <PersonIcon className="w-4 h-4" /> },
    { id: "achievements", label: "Achievements", icon: <BadgeIcon className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <ActivityLogIcon className="w-4 h-4" /> },
    { id: "statistics", label: "Statistics", icon: <BarChartIcon className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <GearIcon className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileOverview />;
      case "achievements":
        return <ProfileAchievements />;
      case "history":
        return <PredictionHistory />;
      case "statistics":
        return <ProfileStatistics />;
      case "settings":
        return <ProfileSettings />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-1 border`}>
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                activeTab === tab.id
                  ? theme === 'dark'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-teal-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default ProfileTabs;
