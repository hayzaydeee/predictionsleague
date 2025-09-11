import api from './baseAPI.js';

// League API endpoints
const leagueAPI = {
  // Get all leagues for current user
  getUserLeagues: async () => {
    try {
      console.log('Fetching user leagues...');
      const response = await api.get('/leagues/user');
      console.log('Raw API response:', response.data);
      
      // Map LeagueOverview response to frontend-compatible format
      const leagues = (response.data || []).map(league => ({
        id: league.id, // Already correct from LeagueOverview
        name: league.name,
        description: league.description,
        members: league.members,
        position: league.position, // User's position in this league
        points: league.points, // User's points in this league
        joinCode: league.joinCode,
        isAdmin: league.isAdmin,
        type: league.type, // Publicity enum
        createdAt: league.createdAt,
        // Backward compatibility aliases
        userPosition: league.position,
        numberOfMembers: league.members
      }));
      
      console.log('User leagues fetched:', leagues.length, 'leagues');
      console.log('Mapped leagues with IDs:', leagues.map(l => ({ id: l.id, name: l.name })));
      return leagues;
    } catch (error) {
      console.error('Failed to fetch user leagues:', error.message);
      return [];
    }
  },

  // Note: getLeagueDetails removed - league header data now included in getUserLeagues response
  // This eliminates redundant API calls for league detail views

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
      console.log('Fetching league standings...', { leagueId });
      const response = await api.get(`/leagues/${leagueId}/standings`);
      console.log('League standings fetched:', response.data?.standings?.length || 0, 'members');
      // Return the direct format: { leagueId, standings }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch league standings:', error.message, { leagueId });
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
  },

  // Get league members (for management view - admin only)
  getLeagueMembers: async (leagueId) => {
    try {
      console.log('Fetching league members...', { leagueId });
      const response = await api.get(`/leagues/${leagueId}/members`);
      console.log('League members fetched:', response.data?.length || 0, 'members');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch league members:', error.message, { leagueId });
      throw new Error(`Failed to load league members: ${error.message}`);
    }
  },

  // Remove member from league (admin only)
  removeMember: async (leagueId, memberId) => {
    try {
      console.log('Removing member from league...', { leagueId, memberId });
      const response = await api.delete(`/leagues/${leagueId}/members/${memberId}`);
      console.log('Member removed successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to remove member:', error.message, { leagueId, memberId });
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  },

  // Promote member to admin (admin only)
  promoteMember: async (leagueId, memberId) => {
    try {
      console.log('Promoting member to admin...', { leagueId, memberId });
      const response = await api.put(`/leagues/${leagueId}/members/${memberId}/promote`);
      console.log('Member promoted successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to promote member:', error.message, { leagueId, memberId });
      throw new Error(`Failed to promote member: ${error.message}`);
    }
  }
};

export default leagueAPI;

