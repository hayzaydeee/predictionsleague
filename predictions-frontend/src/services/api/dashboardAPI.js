// src/services/api/dashboardAPI.js
import { apiCall } from './baseAPI';

const dashboardAPI = {
  // Critical data - loads first (includes user data for StatusBar)
  getEssentialData: async () => {
    try {
      const response = await apiCall({
        method: 'GET',
        url: '/dashboard/me',
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch essential data');
      }
    } catch (error) {
      console.error('Failed to fetch essential dashboard data:', error);
      throw error;
    }
  },

  // Secondary data - loads after essential data (updated to dashboard/ prefix)
  getRecentPredictions: async (limit = 5) => {
    try {
      const response = await apiCall({
        method: 'GET',
        url: `/dashboard/predictions/recent?limit=${limit}`,
      });
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Failed to fetch recent predictions:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch recent predictions:', error);
      return []; // Return empty array on error to not break UI
    }
  },
  getUserLeagues: async (limit = 5) => {
    try {
      const response = await apiCall({
        method: 'GET',
        url: `/dashboard/leagues/user?limit=${limit}`,
      });
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Failed to fetch user leagues:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch user leagues:', error);
      return [];
    }
  },

  getPerformanceInsights: async () => {
    try {
      const response = await apiCall({
        method: 'GET',
        url: '/dashboard/user/insights',
      });
      
      if (response.success) {
        return response.data;
      } else {
        console.error('Failed to fetch performance insights:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch performance insights:', error);
      return [];
    }
  }
};

export default dashboardAPI;