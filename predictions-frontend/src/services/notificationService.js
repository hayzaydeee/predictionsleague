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
    this.displayToast(notification);
    
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

  // Enhanced toast with beautiful card styling
  displayToast(notification) {
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 w-80 pointer-events-none';
      container.style.cssText = 'position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 9999 !important; width: 320px !important;';
      document.body.appendChild(container);
    }

    // Clear existing toasts if we have too many
    if (this.activeToasts.size >= 4) {
      const oldestToast = Array.from(this.activeToasts)[0];
      this.removeToast(oldestToast);
    }

    const toast = document.createElement('div');
    const iconSymbol = ICON_MAP[notification.icon] || ICON_MAP['info'];
    const isDarkTheme = document.documentElement.classList.contains('dark') || 
                       localStorage.getItem('theme') === 'dark';
    
    // Beautiful card-style notification with inline styles for reliability
    toast.className = `backdrop-blur-sm border shadow-xl rounded-xl p-4 pointer-events-auto transition-all duration-500 ease-out ${this.getToastStyles(notification.type, isDarkTheme)}`;
    
    // Set initial position with inline styles to ensure they work
    toast.style.cssText = `
      transform: translateX(100%) !important;
      opacity: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    `;
    
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${this.getIconBg(notification.type, isDarkTheme)}">
          <span class="text-lg">${iconSymbol}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold font-outfit text-sm mb-1 ${this.getTextColor(notification.type, isDarkTheme)}">
            ${this.getNotificationTitle(notification.type)}
          </div>
          <div class="font-outfit text-sm leading-relaxed ${this.getSecondaryTextColor(notification.type, isDarkTheme)}">
            ${notification.message}
          </div>
        </div>
        <button class="close-btn flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${this.getCloseButtonStyle(notification.type, isDarkTheme)} transition-colors">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    container.appendChild(toast);
    this.activeToasts.add(toast);
    
    // Add close button event listener
    const closeBtn = toast.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removeToast(toast);
      });
    }
    
    // Animate in with staggered effect
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0) !important';
        toast.style.opacity = '1 !important';
      });
    });
    
    // Auto remove
    setTimeout(() => {
      this.removeToast(toast);
    }, notification.duration || 4000);
  }

  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.transform = 'translateX(100%) !important';
      toast.style.opacity = '0 !important';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.activeToasts.delete(toast);
      }, 300);
    }
  }

  getToastStyles(type, isDark) {
    const styles = {
      success: isDark 
        ? 'bg-slate-800/90 border-emerald-500/30' 
        : 'bg-white/90 border-emerald-200/50',
      error: isDark 
        ? 'bg-slate-800/90 border-red-500/30' 
        : 'bg-white/90 border-red-200/50',
      warning: isDark 
        ? 'bg-slate-800/90 border-amber-500/30' 
        : 'bg-white/90 border-amber-200/50',
      info: isDark 
        ? 'bg-slate-800/90 border-slate-600/30' 
        : 'bg-white/90 border-slate-200/50'
    };
    return styles[type] || styles.info;
  }

  getIconBg(type, isDark) {
    const styles = {
      success: isDark 
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'bg-emerald-50 text-emerald-600',
      error: isDark 
        ? 'bg-red-500/20 text-red-400' 
        : 'bg-red-50 text-red-600',
      warning: isDark 
        ? 'bg-amber-500/20 text-amber-400' 
        : 'bg-amber-50 text-amber-600',
      info: isDark 
        ? 'bg-slate-600/20 text-slate-400' 
        : 'bg-slate-100 text-slate-600'
    };
    return styles[type] || styles.info;
  }

  getTextColor(type, isDark) {
    const styles = {
      success: isDark ? 'text-emerald-300' : 'text-emerald-800',
      error: isDark ? 'text-red-300' : 'text-red-800',
      warning: isDark ? 'text-amber-300' : 'text-amber-800',
      info: isDark ? 'text-slate-200' : 'text-slate-800'
    };
    return styles[type] || styles.info;
  }

  getSecondaryTextColor(type, isDark) {
    const styles = {
      success: isDark ? 'text-emerald-200/80' : 'text-emerald-700/80',
      error: isDark ? 'text-red-200/80' : 'text-red-700/80',
      warning: isDark ? 'text-amber-200/80' : 'text-amber-700/80',
      info: isDark ? 'text-slate-300/80' : 'text-slate-600/80'
    };
    return styles[type] || styles.info;
  }

  getCloseButtonStyle(type, isDark) {
    const styles = {
      success: isDark 
        ? 'text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10' 
        : 'text-emerald-600/60 hover:text-emerald-800 hover:bg-emerald-100',
      error: isDark 
        ? 'text-red-400/60 hover:text-red-300 hover:bg-red-500/10' 
        : 'text-red-600/60 hover:text-red-800 hover:bg-red-100',
      warning: isDark 
        ? 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10' 
        : 'text-amber-600/60 hover:text-amber-800 hover:bg-amber-100',
      info: isDark 
        ? 'text-slate-400/60 hover:text-slate-300 hover:bg-slate-600/10' 
        : 'text-slate-600/60 hover:text-slate-800 hover:bg-slate-100'
    };
    return styles[type] || styles.info;
  }

  getNotificationTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || titles.info;
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
      this.displayToast(notification);
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