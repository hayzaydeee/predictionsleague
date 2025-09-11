import api from './baseAPI.js';

// League API endpoints
const leagueAPI = {
  // Get all leagues for current user
  getUserLeagues: async () => {
    try {
      console.log('Fetching user leagues...');
      const response = await api.get('/leagues/user');
      console.log('User leagues fetched:', response.data?.length || 0, 'leagues');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch user leagues:', error.message);
      return [];
    }
  },

  // Get league details by ID
  getLeagueDetails: async (leagueId) => {
    try {
      console.log('Fetching league details...', { leagueId });
      const response = await api.get(`/leagues/${leagueId}`);
      console.log('League details fetched successfully', { leagueId });
      return response.data.league;
    } catch (error) {
      console.error('Failed to fetch league details:', error.message, { leagueId });
      throw new Error(`Failed to load league details: ${error.message}`);
    }
  },

  // Create new league
  createLeague: async (leagueData) => {
    try {
      const requestBody = {
        name: leagueData.name,
        description: leagueData.description,
        publicity: leagueData.isPrivate ? 'PRIVATE' : 'PUBLIC'
      };
      
      console.log('Creating league:', requestBody);
      const response = await api.post('/leagues/create', requestBody);
      console.log('League created successfully:', response.data.league?.id);
      return response.data.league;
    } catch (error) {
      console.error('Failed to create league:', error.message);
      throw new Error(`Failed to create league: ${error.message}`);
    }
  },

  // Join league by code
  joinLeague: async (joinCode) => {
    try {
      console.log('Joining league with code:', joinCode);
      const response = await api.post('/leagues/join', { joinCode });
      console.log('League joined successfully:', response.data.league?.id);
      return response.data.league;
    } catch (error) {
      console.error('Failed to join league:', error.message);
      throw new Error(`Failed to join league: ${error.message}`);
    }
  },

  // Leave league
  leaveLeague: async (leagueId) => {
    try {
      const response = await api.delete(`/leagues/${leagueId}/leave`);
      return response.data.message;
    } catch (error) {
      console.error('Failed to leave league:', error.message);
      throw new Error(`Failed to leave league: ${error.message}`);
    }
  },

  // Get league standings
  getLeagueStandings: async (leagueId) => {
    try {
      const response = await api.get(`/leagues/${leagueId}/standings`);
      return response.data.standings;
    } catch (error) {
      console.error('Failed to fetch league standings:', error.message);
      throw new Error(`Failed to load league standings: ${error.message}`);
    }
  },

  // Update league settings (admin only)
  updateLeague: async (leagueId, updates) => {
    try {
      const response = await api.put(`/leagues/${leagueId}`, updates);
      return response.data.league;
    } catch (error) {
      console.error('Failed to update league:', error.message);
      throw new Error(`Failed to update league: ${error.message}`);
    }
  },

  // Get league predictions (all member predictions for league fixtures)
  getLeaguePredictions: async (leagueId) => {
    try {
      console.log('Fetching league predictions...', { leagueId });
      const response = await api.get(`/leagues/${leagueId}/predictions`);
      console.log('League predictions fetched:', response.data?.length || 0, 'predictions');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch league predictions:', error.message, { leagueId });
      throw new Error(`Failed to load league predictions: ${error.message}`);
    }
  }
};

export default leagueAPI;

