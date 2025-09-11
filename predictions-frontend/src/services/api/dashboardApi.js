// src/services/api/dashboardAPI.js
import baseAPI from './baseAPI';

export const dashboardAPI = {
  // Critical data - loads first (includes user data for StatusBar)
  getEssentialData: async () => {
    try {
      const response = await baseAPI.get('/dashboard/essential');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch essential dashboard data:', error);
      throw error;
    }
  },

  // Secondary data - loads after essential data (updated to dashboard/ prefix)
  getUpcomingMatches: async (limit = 5) => {
    try {
      const response = await baseAPI.get(`/dashboard/matches/upcoming?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch upcoming matches:', error);
      return []; // Return empty array on error to not break UI
    }
  },

  getRecentPredictions: async (limit = 5) => {
    try {
      const response = await baseAPI.get(`/dashboard/predictions/recent?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recent predictions:', error);
      return []; // Return empty array on error to not break UI
    }
  },

  getUserLeagues: async (limit = 5) => {
    try {
      const response = await baseAPI.get(`/dashboard/leagues/user?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user leagues:', error);
      return [];
    }
  },

  getPerformanceInsights: async () => {
    try {
      const response = await baseAPI.get('/dashboard/user/insights');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch performance insights:', error);
      return [];
    }
  },

  getExtendedMatches: async (limit = 10) => {
    try {
      const response = await baseAPI.get(`/dashboard/matches/upcoming?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch extended matches:', error);
      return [];
    }
  }
};
