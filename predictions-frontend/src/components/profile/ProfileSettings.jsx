import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { 
  PersonIcon,
  EnvelopeClosedIcon,
  EyeOpenIcon,
  EyeNoneIcon,
  CheckIcon,
  Pencil1Icon
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { text } from "../../utils/themeUtils";

const ProfileSettings = () => {
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    username: "alexplayer23",
    email: "alex@example.com",
    favoriteTeam: "Arsenal",
  });

  const teams = [
    "Arsenal", "Chelsea", "Liverpool", 
    "Manchester City", "Manchester United", "Tottenham"
  ];

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to backend API
    console.log("Profile settings saved:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${theme === 'dark' ? 'text-teal-100' : 'text-teal-700'} text-2xl font-bold font-dmSerif mb-2`}>
            Profile Settings
          </h2>
          <p className={`${text.secondary[theme]} font-outfit`}>
            Manage your account preferences and settings
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isEditing
              ? theme === 'dark'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : theme === 'dark'
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isEditing ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Pencil1Icon className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </motion.button>
      </div>

      {/* Account Information */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-5 border`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-1.5 rounded-lg border ${
            theme === "dark"
              ? "bg-teal-500/10 border-teal-500/20"
              : "bg-teal-50 border-teal-200"
          }`}>
            <PersonIcon className={`w-4 h-4 ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`} />
          </div>
          <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-base`}>
            Account Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`${text.muted[theme]} text-sm font-outfit mb-2 block`}>
              Username
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 font-outfit ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-500"
              } ${!isEditing ? 'opacity-60' : ''}`}
            />
          </div>

          <div>
            <label className={`${text.muted[theme]} text-sm font-outfit mb-2 block`}>
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 font-outfit ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-500"
              } ${!isEditing ? 'opacity-60' : ''}`}
            />
          </div>

          <div>
            <label className={`${text.muted[theme]} text-sm font-outfit mb-2 block`}>
              Favorite Team
            </label>
            <select
              value={settings.favoriteTeam}
              onChange={(e) => setSettings(prev => ({ ...prev, favoriteTeam: e.target.value }))}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 font-outfit ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              } ${!isEditing ? 'opacity-60' : ''}`}
            >
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`${text.muted[theme]} text-sm font-outfit mb-2 block`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value="••••••••"
                disabled={!isEditing}
                className={`w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 font-outfit ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-500"
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {showPassword ? <EyeNoneIcon className="w-4 h-4" /> : <EyeOpenIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      } backdrop-blur-sm rounded-xl p-5 border`}>
        <p className={`${text.secondary[theme]} text-sm font-outfit text-center`}>
          For theme, notification, and interface preferences, visit the{' '}
          <span className={`${text.accent[theme]} font-medium`}>Settings</span> page.
        </p>
      </div>


    </div>
  );
};

export default ProfileSettings;
