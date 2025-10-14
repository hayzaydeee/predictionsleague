// Centralized notification service with activity tracking

// Notification Types
export const NOTIFICATION_TYPES = {
  // System
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info',
  
  // Action Categories for Activity Tracking
  PREDICTION: 'prediction',
  LEAGUE: 'league', 
  PROFILE: 'profile',
  AUTH: 'auth',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system'
};

export const NOTIFICATION_ACTIONS = {
  // Auth Actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  EMAIL_VERIFY: 'email_verify',
  
  // Profile Actions
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  ACCOUNT_DELETE: 'account_delete',
  AVATAR_UPDATE: 'avatar_update',
  
  // Prediction Actions
  PREDICTION_SUBMIT: 'prediction_submit',
  PREDICTION_UPDATE: 'prediction_update',
  CHIP_USE: 'chip_use',
  
  // League Actions
  LEAGUE_CREATE: 'league_create',
  LEAGUE_JOIN: 'league_join',
  LEAGUE_LEAVE: 'league_leave',
  LEAGUE_INVITE: 'league_invite',
  
  // Settings Actions
  THEME_CHANGE: 'theme_change',
  PREFERENCES_UPDATE: 'preferences_update',
  
  // Achievement Actions
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  MILESTONE_REACH: 'milestone_reach',
  
  // System Actions
  DATA_SYNC: 'data_sync',
  OFFLINE_MODE: 'offline_mode'
};

// Icon mapping for notifications
const ICON_MAP = {
  'user': '👤',
  'user-check': '✅',
  'user-plus': '👥',
  'user-minus': '👤',
  'log-out': '🚪',
  'target': '🎯',
  'edit': '✏️',
  'zap': '⚡',
  'users': '👥',
  'mail': '✉️',
  'shield': '🛡️',
  'trash': '🗑️',
  'settings': '⚙️',
  'sun': '☀️',
  'moon': '🌙',
  'award': '🏆',
  'trophy': '🏆',
  'refresh-cw': '🔄',
  'wifi': '📶',
  'wifi-off': '📵',
  'info': 'ℹ️'
};

// Unified Notification Manager
class NotificationManager {
  constructor() {
    this.listeners = new Set();
    this.recentActivities = this.loadRecentActivities();
    this.activeToasts = new Set();
  }

  // Core notification method
  notify(config) {
    const notification = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      ...config
    };

    // Show toast
    this.showToast(notification);
    
    // Track as activity if it's an action type
    if (config.trackAsActivity !== false) {
      this.addToRecentActivity(notification);
    }
    
    // Notify listeners (for real-time UI updates)
    this.notifyListeners(notification);
    
    return notification;
  }

  // Predefined notification methods for common actions
  auth = {
    loginSuccess: (user) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.AUTH,
      action: NOTIFICATION_ACTIONS.LOGIN,
      message: `Welcome back, ${user.firstName || user.name || 'User'}!`,
      icon: 'user-check'
    }),

    logoutSuccess: () => this.notify({
      type: NOTIFICATION_TYPES.INFO,
      category: NOTIFICATION_TYPES.AUTH, 
      action: NOTIFICATION_ACTIONS.LOGOUT,
      message: 'You have been logged out successfully',
      icon: 'log-out'
    }),

    registerSuccess: (user) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.AUTH,
      action: NOTIFICATION_ACTIONS.REGISTER, 
      message: `Welcome to Predictions League, ${user.firstName || user.name || 'User'}!`,
      icon: 'user-plus'
    })
  };

  profile = {
    updateSuccess: () => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.PROFILE,
      action: NOTIFICATION_ACTIONS.PROFILE_UPDATE,
      message: 'Profile updated successfully',
      icon: 'user'
    }),

    passwordChanged: () => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS, 
      category: NOTIFICATION_TYPES.PROFILE,
      action: NOTIFICATION_ACTIONS.PASSWORD_CHANGE,
      message: 'Password changed successfully',
      icon: 'shield'
    }),

    accountDeleted: () => this.notify({
      type: NOTIFICATION_TYPES.INFO,
      category: NOTIFICATION_TYPES.PROFILE,
      action: NOTIFICATION_ACTIONS.ACCOUNT_DELETE,
      message: 'Your account has been deleted',
      icon: 'trash',
      trackAsActivity: false // Don't track deletion
    })
  };

  predictions = {
    submitSuccess: (homeTeam, awayTeam) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.PREDICTION,
      action: NOTIFICATION_ACTIONS.PREDICTION_SUBMIT,
      message: `Prediction submitted for ${homeTeam} vs ${awayTeam}`,
      icon: 'target',
      metadata: { homeTeam, awayTeam }
    }),

    updateSuccess: (homeTeam, awayTeam) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.PREDICTION, 
      action: NOTIFICATION_ACTIONS.PREDICTION_UPDATE,
      message: `Prediction updated for ${homeTeam} vs ${awayTeam}`,
      icon: 'edit',
      metadata: { homeTeam, awayTeam }
    }),

    chipUsed: (chipType, homeTeam, awayTeam) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.PREDICTION,
      action: NOTIFICATION_ACTIONS.CHIP_USE, 
      message: `${chipType} chip used on ${homeTeam} vs ${awayTeam}`,
      icon: 'zap',
      metadata: { chipType, homeTeam, awayTeam }
    })
  };

  leagues = {
    createSuccess: (leagueName) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.LEAGUE,
      action: NOTIFICATION_ACTIONS.LEAGUE_CREATE,
      message: `League "${leagueName}" created successfully`,
      icon: 'users',
      metadata: { leagueName }
    }),

    joinSuccess: (leagueName) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.LEAGUE,
      action: NOTIFICATION_ACTIONS.LEAGUE_JOIN, 
      message: `Successfully joined "${leagueName}"`,
      icon: 'user-plus',
      metadata: { leagueName }
    }),

    leaveSuccess: (leagueName) => this.notify({
      type: NOTIFICATION_TYPES.INFO,
      category: NOTIFICATION_TYPES.LEAGUE,
      action: NOTIFICATION_ACTIONS.LEAGUE_LEAVE,
      message: `Left "${leagueName}"`,
      icon: 'user-minus', 
      metadata: { leagueName }
    }),

    inviteSent: (leagueName, inviteCount) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.LEAGUE,
      action: NOTIFICATION_ACTIONS.LEAGUE_INVITE,
      message: `Invited ${inviteCount} ${inviteCount === 1 ? 'person' : 'people'} to "${leagueName}"`,
      icon: 'mail',
      metadata: { leagueName, inviteCount }
    })
  };

  settings = {
    themeChanged: (theme) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.SYSTEM,
      action: NOTIFICATION_ACTIONS.THEME_CHANGE,
      message: `Switched to ${theme} theme`,
      icon: theme === 'dark' ? 'moon' : 'sun',
      metadata: { theme }
    }),

    preferencesUpdated: () => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.SYSTEM, 
      action: NOTIFICATION_ACTIONS.PREFERENCES_UPDATE,
      message: 'Preferences updated successfully',
      icon: 'settings'
    })
  };

  achievements = {
    unlocked: (achievementName, description) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.ACHIEVEMENT,
      action: NOTIFICATION_ACTIONS.ACHIEVEMENT_UNLOCK,
      message: `Achievement unlocked: ${achievementName}`,
      icon: 'award',
      metadata: { achievementName, description },
      duration: 5000 // Show longer for achievements
    }),

    milestoneReached: (milestone, value) => this.notify({
      type: NOTIFICATION_TYPES.SUCCESS, 
      category: NOTIFICATION_TYPES.ACHIEVEMENT,
      action: NOTIFICATION_ACTIONS.MILESTONE_REACH,
      message: `Milestone reached: ${milestone}`,
      icon: 'trophy',
      metadata: { milestone, value },
      duration: 4000
    })
  };

  system = {
    dataSync: () => this.notify({
      type: NOTIFICATION_TYPES.INFO,
      category: NOTIFICATION_TYPES.SYSTEM,
      action: NOTIFICATION_ACTIONS.DATA_SYNC, 
      message: 'Data synchronized successfully',
      icon: 'refresh-cw',
      trackAsActivity: false
    }),

    offlineMode: (isOffline) => this.notify({
      type: isOffline ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_TYPES.SYSTEM,
      action: NOTIFICATION_ACTIONS.OFFLINE_MODE,
      message: isOffline ? 'You are now offline' : 'Back online',
      icon: isOffline ? 'wifi-off' : 'wifi',
      trackAsActivity: false
    })
  };

  // Recent Activity Management
  addToRecentActivity(notification) {
    const activity = {
      id: notification.id,
      type: notification.category,
      action: notification.action, 
      message: notification.message,
      icon: notification.icon,
      timestamp: notification.timestamp,
      metadata: notification.metadata
    };

    this.recentActivities.unshift(activity);
    this.recentActivities = this.recentActivities.slice(0, 4); // Keep 4 most recent
    
    localStorage.setItem('recentActivities', JSON.stringify(this.recentActivities));
    
    // Notify activity listeners
    this.listeners.forEach(listener => {
      if (listener.type === 'activity') {
        listener.callback(this.recentActivities);
      }
    });
  }

  // Enhanced toast with better styling and icons
  showToast(notification) {
    // Clear existing toasts if we have too many
    if (this.activeToasts.size >= 3) {
      const oldestToast = Array.from(this.activeToasts)[0];
      this.removeToast(oldestToast);
    }

    const toast = document.createElement('div');
    const iconSymbol = ICON_MAP[notification.icon] || ICON_MAP['info'];
    
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 py-3 px-5 rounded-lg shadow-lg z-50 flex items-center gap-3 transition-all duration-300 opacity-0 translate-y-2 ${this.getToastStyles(notification.type)}`;
    
    toast.innerHTML = `
      <span class="text-lg">${iconSymbol}</span>
      <span class="font-medium font-outfit">${notification.message}</span>
    `;
    
    document.body.appendChild(toast);
    this.activeToasts.add(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });
    
    // Auto remove
    setTimeout(() => {
      this.removeToast(toast);
    }, notification.duration || 3000);
  }

  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 20px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.activeToasts.delete(toast);
      }, 300);
    }
  }

  getToastStyles(type) {
    const styles = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-red-600 text-white', 
      warning: 'bg-amber-600 text-white',
      info: 'bg-slate-700 text-white'
    };
    return styles[type] || styles.info;
  }

  // Subscription methods for React components
  subscribe(callback, type = 'notification') {
    const listener = { callback, type };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(notification) {
    this.listeners.forEach(listener => {
      if (listener.type === 'notification') {
        listener.callback(notification);
      }
    });
  }

  loadRecentActivities() {
    try {
      return JSON.parse(localStorage.getItem('recentActivities') || '[]');
    } catch {
      return [];
    }
  }

  getRecentActivities() {
    return this.recentActivities;
  }

  // Legacy support for existing showToast calls
  showToast(message, type = 'info', duration = 3000) {
    if (typeof message === 'string') {
      // Legacy call - convert to new format
      return this.notify({
        type,
        message,
        duration,
        icon: 'info',
        trackAsActivity: false
      });
    } else {
      // New format - message is the notification object
      const notification = message;
      this.showToast(notification);
    }
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Legacy export for backward compatibility
export const showToast = (message, type = 'info', duration = 3000) => {
  return notificationManager.showToast(message, type, duration);
};

export default notificationManager;