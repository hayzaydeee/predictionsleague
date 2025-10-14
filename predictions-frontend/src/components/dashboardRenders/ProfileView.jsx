import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { backgrounds, text } from "../../utils/themeUtils";
import { SecondaryButton } from "../ui/buttons";
import userAPI from "../../services/api/userAPI";
import {
  PersonIcon,
  BadgeIcon,
  BarChartIcon,
  GearIcon,
  Pencil1Icon,
  CheckIcon,
  Cross2Icon,
  CalendarIcon,
  TargetIcon,
  StarIcon,
  ActivityLogIcon,
  RocketIcon,
  LightningBoltIcon,
  TrophyIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

const ProfileView = () => {
  const { theme } = useContext(ThemeContext);
  const { user, updateUser } = useAuth();
  const { preferences } = useUserPreferences();

  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    favoriteTeam: '',
    bio: '',
  });

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userAPI.getProfile();
      if (response.success) {
        setUserProfile(response.user);
        setEditFormData({
          username: response.user.username || '',
          email: response.user.email || '',
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          favoriteTeam: response.user.favoriteTeam || '',
          bio: response.user.bio || '',
        });
      } else {
        throw new Error(response.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError(err.message);
      // Fallback to auth context user data
      if (user) {
        setUserProfile(user);
        setEditFormData({
          username: user.username || '',
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          favoriteTeam: user.favoriteTeam || '',
          bio: user.bio || '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.updateProfile(editFormData);
      if (response.success) {
        setUserProfile(response.user);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample stats data - replace with real API calls
  const userStats = {
    totalPredictions: 156,
    correctPredictions: 89,
    accuracy: 57,
    currentStreak: 3,
    bestStreak: 8,
    pointsThisSeason: 245,
    rank: 42,
    totalMembers: 1200
  };

  const achievements = [
    { id: 1, title: "First Prediction", description: "Made your first prediction", earned: true, icon: TargetIcon },
    { id: 2, title: "Hat Trick", description: "3 correct predictions in a row", earned: true, icon: StarIcon },
    { id: 3, title: "Century Club", description: "Made 100 predictions", earned: true, icon: TrophyIcon },
    { id: 4, title: "Perfect Week", description: "Got all predictions correct in one gameweek", earned: false, icon: RocketIcon },
  ];

  // Component helpers
  const SettingCard = ({ title, description, icon: Icon, children }) => (
    <motion.div
      className={`backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 ${
        theme === "dark"
          ? "border-slate-700/50 bg-slate-800/40"
          : "border-slate-200 bg-white shadow-sm"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className={`p-2 rounded-lg ${
            theme === "dark" 
              ? "bg-teal-500/10 text-teal-400" 
              : "bg-teal-50 text-teal-600"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className={`${text.primary[theme]} font-outfit font-semibold text-lg`}>
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

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <div className={`rounded-lg p-4 border ${
      theme === "dark"
        ? "bg-slate-700/30 border-slate-600/50"
        : "bg-slate-50 border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${text.secondary[theme]}`} />}
          <span className={`${text.secondary[theme]} text-sm font-medium font-outfit`}>
            {title}
          </span>
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend > 0
              ? theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
              : theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
          }`}>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
      <div className={`${text.primary[theme]} text-2xl font-bold font-outfit mb-1`}>
        {value}
      </div>
      {subtitle && (
        <div className={`${text.muted[theme]} text-xs font-outfit`}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="space-y-2">
      <label className={`${text.primary[theme]} text-sm font-medium font-outfit block`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border font-outfit text-sm transition-colors ${
          theme === "dark"
            ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
            : "bg-white border-slate-200 text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
        }`}
      />
    </div>
  );

  if (isLoading && !userProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`${text.secondary[theme]} font-outfit`}>Loading profile...</div>
      </div>
    );
  }

  const displayUser = userProfile || user || {};

  return (
    <div className={`min-h-screen ${backgrounds.primary[theme]} transition-colors duration-200`}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className={`${text.primary[theme]} text-3xl font-bold font-dmSerif`}>
            My Profile
          </h1>
          <p className={`${text.secondary[theme]} font-outfit`}>
            Manage your account, view your performance, and track achievements
          </p>
        </div>

        {/* Profile Header Card */}
        <SettingCard
          title={displayUser.username || 'User'}
          description={`Member since ${displayUser.memberSince || 'Recently'}`}
          icon={PersonIcon}
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-teal-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold font-dmSerif shadow-lg">
                {displayUser.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${
                theme === 'dark' ? 'bg-emerald-500 border-slate-800' : 'bg-emerald-500 border-white'
              } flex items-center justify-center`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`${text.primary[theme]} text-lg font-semibold font-outfit`}>
                  {displayUser.username || 'User'}
                </span>
                {!isEditing && (
                  <SecondaryButton
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil1Icon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </SecondaryButton>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <SecondaryButton
                      variant="outline"
                      size="sm"
                      onClick={handleSaveProfile}
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Save
                    </SecondaryButton>
                    <SecondaryButton
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <Cross2Icon className="w-4 h-4 mr-2" />
                      Cancel
                    </SecondaryButton>
                  </div>
                )}
              </div>
              <div className={`${text.secondary[theme]} text-sm font-outfit`}>
                {displayUser.email || 'No email set'}
              </div>
            </div>
          </div>
        </SettingCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Account Information */}
          <SettingCard
            title="Account Information"
            description="Manage your personal information"
            icon={GearIcon}
          >
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <InputField
                    label="Username"
                    value={editFormData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email"
                  />
                  <InputField
                    label="First Name"
                    value={editFormData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                  <InputField
                    label="Last Name"
                    value={editFormData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                  <InputField
                    label="Favorite Team"
                    value={editFormData.favoriteTeam}
                    onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                    placeholder="Enter favorite team"
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className={`${text.secondary[theme]} text-sm font-outfit`}>Email</span>
                    <span className={`${text.primary[theme]} text-sm font-medium font-outfit`}>
                      {displayUser.email || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className={`${text.secondary[theme]} text-sm font-outfit`}>Name</span>
                    <span className={`${text.primary[theme]} text-sm font-medium font-outfit`}>
                      {[displayUser.firstName, displayUser.lastName].filter(Boolean).join(' ') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className={`${text.secondary[theme]} text-sm font-outfit`}>Favorite Team</span>
                    <span className={`${text.primary[theme]} text-sm font-medium font-outfit`}>
                      {displayUser.favoriteTeam || 'Not set'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SettingCard>

          {/* Performance Stats */}
          <SettingCard
            title="Performance Statistics"
            description="Your prediction performance this season"
            icon={BarChartIcon}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Predictions"
                value={userStats.totalPredictions}
                icon={TargetIcon}
              />
              <StatCard
                title="Accuracy"
                value={`${userStats.accuracy}%`}
                subtitle={`${userStats.correctPredictions}/${userStats.totalPredictions} correct`}
                icon={BarChartIcon}
                trend={5}
              />
              <StatCard
                title="Current Streak"
                value={userStats.currentStreak}
                subtitle={`Best: ${userStats.bestStreak}`}
                icon={RocketIcon}
              />
              <StatCard
                title="Season Points"
                value={userStats.pointsThisSeason}
                subtitle={`Rank: ${userStats.rank}/${userStats.totalMembers}`}
                icon={StarIcon}
                trend={12}
              />
            </div>
          </SettingCard>

          {/* Recent Activity */}
          <SettingCard
            title="Recent Activity"
            description="Your latest predictions and achievements"
            icon={ActivityLogIcon}
          >
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-slate-700/30 border-slate-600/50" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <TargetIcon className={`w-4 h-4 ${text.secondary[theme]}`} />
                  <span className={`${text.primary[theme]} text-sm font-medium font-outfit`}>
                    Gameweek 15 Predictions
                  </span>
                </div>
                <p className={`${text.secondary[theme]} text-xs font-outfit`}>
                  Submitted 10 predictions • 2 hours ago
                </p>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-slate-700/30 border-slate-600/50" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <BadgeIcon className={`w-4 h-4 ${text.secondary[theme]}`} />
                  <span className={`${text.primary[theme]} text-sm font-medium font-outfit`}>
                    Achievement Unlocked: Century Club
                  </span>
                </div>
                <p className={`${text.secondary[theme]} text-xs font-outfit`}>
                  Made 100 predictions • 1 day ago
                </p>
              </div>
            </div>
          </SettingCard>

          {/* Achievements */}
          <SettingCard
            title="Achievements"
            description="Your prediction milestones and badges"
            icon={TrophyIcon}
          >
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    achievement.earned
                      ? theme === "dark"
                        ? "bg-teal-500/10 border-teal-500/30"
                        : "bg-teal-50 border-teal-200"
                      : theme === "dark"
                        ? "bg-slate-700/30 border-slate-600/50 opacity-60"
                        : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <achievement.icon className={`w-6 h-6 mx-auto mb-2 ${
                    achievement.earned
                      ? theme === "dark" ? "text-teal-400" : "text-teal-600"
                      : text.secondary[theme]
                  }`} />
                  <h4 className={`${text.primary[theme]} text-sm font-medium font-outfit mb-1`}>
                    {achievement.title}
                  </h4>
                  <p className={`${text.secondary[theme]} text-xs font-outfit`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
