import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PersonIcon,
  ActivityLogIcon,
  DoubleArrowUpIcon,
  Pencil1Icon,
  CheckIcon,
  Cross2Icon,
  LockClosedIcon,
  EyeOpenIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import userAPI from "../../services/api/userAPI";
import { backgrounds, text, status } from "../../utils/themeUtils";
import StatCard from "../common/StatCard";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";

const ProfileOverview = () => {
  const { theme } = useContext(ThemeContext);
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const { preferences, updateNestedPreference } = useUserPreferences();
  
  // State for user profile data and editing
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

  // Password management state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteErrors, setDeleteErrors] = useState({});

  // Success/error messages
  const [showSuccess, setShowSuccess] = useState("");
  const [generalErrors, setGeneralErrors] = useState({});

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 ProfileOverview: Fetching user profile...");
      
      const response = await userAPI.getProfile();
      if (response.success) {
        console.log("✅ ProfileOverview: User profile fetched:", response.user);
        setUserProfile(response.user);
      } else {
        throw new Error(response.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error("❌ ProfileOverview: Error fetching profile:", err);
      setError(err.message);
      // Fallback to auth context user data if available
      if (user) {
        console.log("🔄 ProfileOverview: Using auth context user as fallback");
        setUserProfile(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Initialize form data when user profile data is available
  useEffect(() => {
    if (userProfile) {
      // Map API response fields to expected field names
      const mappedUser = {
        username: userProfile.username || '',
        email: userProfile.email || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        favoriteTeam: formatTeamName(userProfile.favouriteTeam || userProfile.favoriteTeam) || '',
        bio: userProfile.bio || '',
      };
      
      setEditFormData(mappedUser);
    }
  }, [userProfile]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      // Map API response fields to expected field names
      const mappedUser = {
        username: userProfile.username || '',
        email: userProfile.email || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        favoriteTeam: formatTeamName(userProfile.favouriteTeam || userProfile.favoriteTeam) || '',
        bio: userProfile.bio || '',
      };
      
      setEditFormData(mappedUser);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await updateProfile(editFormData);
      if (response.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Password management handlers
  const handlePasswordChange = async () => {
    setIsLoading(true);
    setPasswordErrors({});
    setGeneralErrors({});

    try {
      // Basic validation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordErrors({ newPassword: "Password must be at least 8 characters" });
        return;
      }

      const response = await userAPI.changePassword(passwordData);
      if (response.success) {
        setShowSuccess("Password changed successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        setTimeout(() => setShowSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Password change failed:", error);
      setGeneralErrors({ password: "Failed to change password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Account deletion handlers
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      setDeleteErrors({ deleteConfirm: 'Please type "delete my account" to confirm' });
      return;
    }

    setIsLoading(true);
    setDeleteErrors({});

    try {
      const response = await userAPI.deleteAccount(passwordData.currentPassword);
      if (response.success) {
        console.log("Account deletion processed...");
        // Redirect to login or landing page after deletion
      }
    } catch (error) {
      console.error("Account deletion failed:", error);
      setDeleteErrors({ general: "Failed to delete account. Please try again." });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  // Privacy toggle handlers
  const handlePrivacyToggle = (setting, value) => {
    updateNestedPreference("privacy", setting, value);
  };

  // Utility function to format team names from ALL CAPS to sentence case
  const formatTeamName = (teamName) => {
    if (!teamName) return 'Not set';
    
    // Convert to lowercase then capitalize first letter of each word
    return teamName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Show loading state while updating
  if (isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  // Show error state if there's an error and no fallback data
  if (error && !userProfile) {
    return <ErrorState message={`Failed to load profile: ${error}`} />;
  }

  // Use user data from API response, with proper field mapping
  const displayUser = userProfile || {};
  const displayStats = user?.statistics || {};

  // Map API fields to display fields for consistency
  const mappedDisplayUser = {
    ...displayUser,
    favoriteTeam: formatTeamName(displayUser.favouriteTeam || displayUser.favoriteTeam), // Handle both spellings and format
    email: displayUser.email || 'Not provided', // Handle null email
  };

  // Sample activity (would come from API in real app)
  const recentActivity = [
    { action: "Predicted Arsenal 2-1 Man City", time: "2 hours ago", points: 12 },
    { action: "Joined Office Rivalry league", time: "1 day ago", points: null },
    { action: "Used Double Down chip", time: "3 days ago", points: 24 },
    { action: "Achieved 3-week streak", time: "1 week ago", points: null }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Profile Header Card */}
      <motion.div
        variants={itemVariants}
        className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 relative overflow-hidden`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          theme === "dark"
            ? "from-teal-500/5 to-indigo-500/5"
            : "from-teal-50 to-indigo-50"
        }`} />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 bg-gradient-to-br from-teal-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold font-dmSerif shadow-lg">
              {mappedDisplayUser.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 ${
              theme === 'dark' ? 'bg-emerald-500 border-slate-800' : 'bg-emerald-500 border-white'
            } flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className={`${theme === 'dark' ? 'text-teal-100' : 'text-teal-700'} text-2xl font-dmSerif`}>
                {mappedDisplayUser.username || 'User'}
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-300'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
                  title="Edit profile"
                >
                  <Pencil1Icon className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className={`${text.secondary[theme]} font-outfit mb-4`}>
              Member since {mappedDisplayUser.memberSince || 'Recently'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-5 border transition-all duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } disabled:opacity-50`}
                  title="Save changes"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 hover:bg-slate-700 text-white'
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                  }`}
                  title="Cancel"
                >
                  <Cross2Icon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Username Field */}
            <div className="flex justify-between items-center">
              <span className={`${text.muted[theme]} text-sm font-outfit`}>Username</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`px-2 py-1 rounded text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } font-outfit font-medium`}
                />
              ) : (
                <span className={`${text.primary[theme]} font-outfit font-medium`}>
                  {mappedDisplayUser.username || 'Not set'}
                </span>
              )}
            </div>
            
            {/* Email Field */}
            <div className="flex justify-between items-center">
              <span className={`${text.muted[theme]} text-sm font-outfit`}>Email</span>
              {isEditing ? (
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`px-2 py-1 rounded text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } font-outfit font-medium`}
                />
              ) : (
                <span className={`${text.primary[theme]} font-outfit font-medium`}>
                  {mappedDisplayUser.email || 'Not set'}
                </span>
              )}
            </div>
            
            {/* First Name Field */}
            <div className="flex justify-between items-center">
              <span className={`${text.muted[theme]} text-sm font-outfit`}>First Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`px-2 py-1 rounded text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } font-outfit font-medium`}
                />
              ) : (
                <span className={`${text.primary[theme]} font-outfit font-medium`}>
                  {mappedDisplayUser.firstName || 'Not set'}
                </span>
              )}
            </div>
            
            {/* Last Name Field */}
            <div className="flex justify-between items-center">
              <span className={`${text.muted[theme]} text-sm font-outfit`}>Last Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`px-2 py-1 rounded text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } font-outfit font-medium`}
                />
              ) : (
                <span className={`${text.primary[theme]} font-outfit font-medium`}>
                  {mappedDisplayUser.lastName || 'Not set'}
                </span>
              )}
            </div>
            
            {/* Favorite Team Field */}
            <div className="flex justify-between items-center">
              <span className={`${text.muted[theme]} text-sm font-outfit`}>Favorite Team</span>
              {isEditing ? (
                <select
                  value={editFormData.favoriteTeam}
                  onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                  className={`px-2 py-1 rounded text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } font-outfit font-medium`}
                >
                  <option value="">Select a team</option>
                  <option value="Arsenal">Arsenal</option>
                  <option value="Chelsea">Chelsea</option>
                  <option value="Liverpool">Liverpool</option>
                  <option value="Manchester City">Manchester City</option>
                  <option value="Manchester United">Manchester United</option>
                  <option value="Tottenham">Tottenham</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`${text.primary[theme]} font-outfit font-medium`}>
                    {mappedDisplayUser.favoriteTeam !== 'Not set' ? mappedDisplayUser.favoriteTeam : 'Not set'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-5 border transition-all duration-200`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-1.5 rounded-lg border ${
              theme === "dark"
                ? "bg-teal-500/10 border-teal-500/20"
                : "bg-teal-50 border-teal-200"
            }`}>
              <ActivityLogIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-teal-400" : "text-teal-600"
              }`} />
            </div>
            <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-base`}>
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {(mappedDisplayUser.recentActivity || []).map((activity, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                theme === "dark"
                  ? "bg-slate-700/20 border-slate-600/20"
                  : "bg-slate-50/50 border-slate-200/50"
              } border`}>
                <div className="flex-1">
                  <p className={`${text.primary[theme]} font-outfit text-sm font-medium`}>
                    {activity.action}
                  </p>
                  <p className={`${text.muted[theme]} font-outfit text-xs`}>
                    {activity.time}
                  </p>
                </div>
                {activity.points && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    theme === "dark"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600"
                  }`}>
                    <DoubleArrowUpIcon className="w-3 h-3" />
                    +{activity.points}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

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

      {/* Password Management Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-6 border transition-all duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${
                theme === "dark"
                  ? "bg-teal-500/10 border-teal-500/20"
                  : "bg-teal-50 border-teal-200"
              }`}>
                <LockClosedIcon className={`w-4 h-4 ${
                  theme === "dark" ? "text-teal-400" : "text-teal-600"
                }`} />
              </div>
              <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-base`}>
                Password & Security
              </h3>
            </div>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {showPasswordSection ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    } ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-400 text-xs font-outfit mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    } ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-400 text-xs font-outfit mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
              {generalErrors.password && (
                <p className="text-red-400 text-sm font-outfit">{generalErrors.password}</p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Privacy Settings Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-6 border transition-all duration-200`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-1.5 rounded-lg border ${
              theme === "dark"
                ? "bg-teal-500/10 border-teal-500/20"
                : "bg-teal-50 border-teal-200"
            }`}>
              <EyeOpenIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-teal-400" : "text-teal-600"
              }`} />
            </div>
            <h3 className={`${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'} font-outfit font-semibold text-base`}>
              Privacy Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                  Profile Visibility
                </label>
                <select
                  value={preferences.privacy?.profileVisibility || 'public'}
                  onChange={(e) => handlePrivacyToggle('profileVisibility', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private - Only me</option>
                </select>
              </div>
              <div>
                <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                  Activity Visibility
                </label>
                <select
                  value={preferences.privacy?.activityVisibility || 'public'}
                  onChange={(e) => handlePrivacyToggle('activityVisibility', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 divide-y divide-slate-600/20">
              {[
                { key: 'allowDirectMessages', label: 'Allow Direct Messages', description: 'Let other users send you messages' },
                { key: 'showInLeaderboard', label: 'Show in Leaderboard', description: 'Display your ranking in public leaderboards' },
                { key: 'shareStats', label: 'Share Statistics', description: 'Allow sharing of your prediction statistics' },
                { key: 'allowFriendRequests', label: 'Accept Friend Requests', description: 'Allow others to send you friend requests' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-3">
                  <div>
                    <p className={`${text.primary[theme]} font-outfit font-medium`}>
                      {setting.label}
                    </p>
                    <p className={`${text.secondary[theme]} text-sm font-outfit`}>
                      {setting.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle(setting.key, !preferences.privacy?.[setting.key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.privacy?.[setting.key]
                        ? 'bg-teal-600'
                        : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.privacy?.[setting.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Deletion Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className={`${
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white border-slate-200 shadow-sm"
        } backdrop-blur-sm rounded-xl p-6 border transition-all duration-200`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-1.5 rounded-lg border ${
              theme === "dark"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-red-50 border-red-200"
            }`}>
              <TrashIcon className={`w-4 h-4 ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`} />
            </div>
            <h3 className={`${theme === 'dark' ? 'text-red-200' : 'text-red-700'} font-outfit font-semibold text-base`}>
              Delete Account
            </h3>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-outfit font-semibold mb-2">
                  Warning: This action cannot be undone
                </h4>
                <p className="text-red-300 text-sm font-outfit">
                  Deleting your account will permanently remove all your predictions, leagues, 
                  statistics, and personal data. This action is irreversible.
                </p>
              </div>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Delete Account
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className={`${text.primary[theme]} text-sm font-medium font-outfit block mb-2`}>
                  Type 'delete my account' to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md font-outfit text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } ${deleteErrors.deleteConfirm ? 'border-red-500' : ''}`}
                  placeholder="delete my account"
                />
                {deleteErrors.deleteConfirm && (
                  <p className="text-red-400 text-xs font-outfit mt-1">{deleteErrors.deleteConfirm}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || deleteConfirmText.toLowerCase() !== "delete my account"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Deleting...' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteErrors({});
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 hover:bg-slate-700 text-white'
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                  }`}
                >
                  Cancel
                </button>
              </div>
              {deleteErrors.general && (
                <p className="text-red-400 text-sm font-outfit">{deleteErrors.general}</p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileOverview;
