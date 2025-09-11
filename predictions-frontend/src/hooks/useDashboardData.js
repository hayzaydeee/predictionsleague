import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api/dashboardApi';
import { leagueAPI } from '../services/api/leagueAPI';

// This hook implements progressive loading with real API calls
// It uses the hybrid API approach with dashboard/ endpoints for secondary data

const useDashboardData = () => {
  // Essential data state (loads first)
  const [essentialData, setEssentialData] = useState(null);
  const [essentialLoading, setEssentialLoading] = useState(true);
  
  // StatusBar data state (loads with essential data)
  const [statusBarData, setStatusBarData] = useState({
    user: null,
    nextMatchData: null,
  });
  const [statusBarLoading, setStatusBarLoading] = useState(true);
  
  // Secondary data state (loads progressively)
  const [secondaryData, setSecondaryData] = useState({
    upcomingMatches: null,
    recentPredictions: null,
    leagues: null,
    insights: null,
  });
  
  const [secondaryLoading, setSecondaryLoading] = useState({
    matches: true,
    predictions: true,
    leagues: true,
    insights: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch essential data first
  useEffect(() => {
    const fetchEssentialData = async () => {
      try {
        setEssentialLoading(true);
        setStatusBarLoading(true);
        
        console.log('🚀 Fetching essential dashboard data...');
        // Call real API for essential data
        const essentialResponse = await dashboardAPI.getEssentialData();
        console.log('✅ Essential data received:', essentialResponse);
        
        setEssentialData(essentialResponse);
        setStatusBarData({
          user: essentialResponse.user,
          nextMatchData: essentialResponse.nextMatch,
        });
      } catch (error) {
        console.error('❌ Failed to fetch essential data:', error);
        setErrors(prev => ({ ...prev, essential: error }));
      } finally {
        setEssentialLoading(false);
        setStatusBarLoading(false);
      }
    };

    fetchEssentialData();
  }, []);

  // Fetch secondary data after essential data is loaded
  useEffect(() => {
    if (!essentialData) return;

    const fetchSecondaryData = async () => {
      // Fetch upcoming matches
      try {
        console.log('🚀 Fetching upcoming matches...');
        const upcomingMatches = await dashboardAPI.getUpcomingMatches(5);
        console.log('✅ Upcoming matches received:', upcomingMatches);
        setSecondaryData(prev => ({ ...prev, upcomingMatches }));
        setSecondaryLoading(prev => ({ ...prev, matches: false }));
      } catch (error) {
        console.error('❌ Failed to fetch upcoming matches:', error);
        setErrors(prev => ({ ...prev, matches: error }));
        setSecondaryLoading(prev => ({ ...prev, matches: false }));
      }

      // Fetch recent predictions
      try {
        console.log('🚀 Fetching recent predictions...');
        const recentPredictions = await dashboardAPI.getRecentPredictions(5);
        console.log('✅ Recent predictions received:', recentPredictions);
        setSecondaryData(prev => ({ ...prev, recentPredictions }));
        setSecondaryLoading(prev => ({ ...prev, predictions: false }));
      } catch (error) {
        console.error('❌ Failed to fetch recent predictions:', error);
        setErrors(prev => ({ ...prev, predictions: error }));
        setSecondaryLoading(prev => ({ ...prev, predictions: false }));
      }

      // Fetch user leagues
      try {
        console.log('🚀 Fetching user leagues...');
        const leagues = await leagueAPI.getUserLeagues(); // Use proper leagueAPI instead of dashboardAPI
        console.log('✅ User leagues received:', leagues);
        setSecondaryData(prev => ({ ...prev, leagues }));
        setSecondaryLoading(prev => ({ ...prev, leagues: false }));
      } catch (error) {
        console.error('❌ Failed to fetch user leagues:', error);
        setErrors(prev => ({ ...prev, leagues: error }));
        setSecondaryLoading(prev => ({ ...prev, leagues: false }));
      }

      // Performance insights - commented out for later implementation
      /*
      try {
        console.log('🚀 Fetching performance insights...');
        const insights = await dashboardAPI.getPerformanceInsights();
        console.log('✅ Performance insights received:', insights);
        setSecondaryData(prev => ({ ...prev, insights }));
        setSecondaryLoading(prev => ({ ...prev, insights: false }));
      } catch (error) {
        console.error('❌ Failed to fetch performance insights:', error);
        setErrors(prev => ({ ...prev, insights: error }));
        setSecondaryLoading(prev => ({ ...prev, insights: false }));
      }
      */
      
      // Set insights loading to false since we're not fetching it
      setSecondaryLoading(prev => ({ ...prev, insights: false }));
    };

    fetchSecondaryData();
  }, [essentialData]);

  return {
    // Essential data
    essentialData,
    essentialLoading,
    
    // Status bar data
    statusBarData,
    statusBarLoading,
    
    // Secondary data
    upcomingMatches: secondaryData.upcomingMatches || [],
    recentPredictions: secondaryData.recentPredictions || [],
    leagues: secondaryData.leagues || [],
    
    // Loading states
    secondaryLoading,
    
    // Error states
    errors,
    
    // Helper to check if any secondary data is still loading
    isSecondaryLoading: Object.values(secondaryLoading).some(loading => loading),
  };
};

export default useDashboardData;
