import { useState, useEffect } from 'react';
import leagueAPI from '../services/api/leagueAPI.js';
import { showToast } from '../services/notificationService.js';

const useLeagues = () => {
  const [myLeagues, setMyLeagues] = useState([]);
  const [featuredLeagues, setFeaturedLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user leagues using the API (with fallback to mock data)
  const fetchMyLeagues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const leagues = await leagueAPI.getUserLeagues();
      setMyLeagues(leagues);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leagues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch featured leagues (with fallback to mock data)
  const fetchFeaturedLeagues = async () => {
    try {
      const leagues = await leagueAPI.getFeaturedLeagues();
      setFeaturedLeagues(leagues);
    } catch (err) {
      console.error('Error fetching featured leagues:', err);
      // The leagueAPI already handles fallback to mock data
    }
  };

  // Join a league by code
  const joinLeague = async (joinCode) => {
    try {
      const league = await leagueAPI.joinLeague(joinCode);
      showToast('Successfully joined league!', 'success');
      // Refresh user leagues to include the newly joined league
      await fetchMyLeagues();
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Failed to join league', 'error');
      console.error('Error joining league:', err);
      return { success: false, error: err.message };
    }
  };

  // Join a featured league
  const joinFeaturedLeague = async (leagueId) => {
    try {
      // For featured leagues, we use a special code format
      const league = await leagueAPI.joinLeague(`FEATURED_${leagueId}`);
      showToast('Successfully joined featured league!', 'success');
      await fetchMyLeagues();
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Failed to join featured league', 'error');
      console.error('Error joining featured league:', err);
      return { success: false, error: err.message };
    }
  };

  // Create a new league
  const createLeague = async (leagueData) => {
    try {
      const league = await leagueAPI.createLeague(leagueData);
      showToast('League created successfully!', 'success');
      // Refresh user leagues to include the newly created league
      await fetchMyLeagues();
      return { success: true, league: league };
    } catch (err) {
      showToast(err.message || 'Failed to create league', 'error');
      console.error('Error creating league:', err);
      return { success: false, error: err.message };
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMyLeagues();
    fetchFeaturedLeagues();
  }, []);

  return { 
    myLeagues, 
    featuredLeagues, 
    isLoading, 
    error, 
    joinLeague,
    joinFeaturedLeague,
    createLeague,
    refreshMyLeagues: fetchMyLeagues,
    refreshFeaturedLeagues: fetchFeaturedLeagues
  };
};

export default useLeagues;