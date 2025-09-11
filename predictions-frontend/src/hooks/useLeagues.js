import { useState, useEffect } from 'react';
import leagueAPI from '../services/api/leagueAPI.js';
import { showToast } from '../services/notificationService.js';

const useLeagues = () => {
  const [myLeagues, setMyLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user leagues using the API (with fallback to mock data)
  const fetchMyLeagues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching user leagues...');
      const leagues = await leagueAPI.getUserLeagues();
      console.log('User leagues fetched:', leagues?.length || 0, 'leagues');
      setMyLeagues(leagues);
    } catch (err) {
      console.error('Error fetching leagues:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Join a league by code
  const joinLeague = async (joinCode) => {
    try {
      console.log('Attempting to join league:', joinCode);
      const league = await leagueAPI.joinLeague(joinCode);
      console.log('League joined successfully:', league?.name);
      showToast('Successfully joined league!', 'success');
      await fetchMyLeagues(); // This should update the state
      return league; // Return the league directly
    } catch (err) {
      console.error('Error joining league:', err.message);
      showToast(err.message || 'Failed to join league', 'error');
      throw err; // Let component handle the error
    }
  };

  // Create a new league
  const createLeague = async (leagueData) => {
    try {
      console.log('Creating league:', leagueData.name);
      const league = await leagueAPI.createLeague(leagueData);
      console.log('League created successfully:', league?.name);
      showToast('League created successfully!', 'success');
      await fetchMyLeagues(); // This should update the state
      return league; // Return the league directly
    } catch (err) {
      console.error('Error creating league:', err.message);
      showToast(err.message || 'Failed to create league', 'error');
      throw err; // Let component handle the error
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMyLeagues();
  }, []);

  return { 
    myLeagues, 
    isLoading, 
    error, 
    joinLeague,
    createLeague,
    refreshMyLeagues: fetchMyLeagues
  };
};

export default useLeagues;