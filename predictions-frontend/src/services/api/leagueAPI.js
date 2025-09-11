import api from './baseAPI.js';

// League API endpoints
const leagueAPI = {
  // Get all leagues for current user
  getUserLeagues: async () => {
    try {
      console.log('Fetching user leagues...');
      const response = await api.get('/leagues/user');
      console.log('User leagues fetched successfully:', response.data.leagues?.length || 0, 'leagues');
      return response.data.leagues || mockUserLeagues;
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error.message);
      return mockUserLeagues;
    }
  },

  // Get league details by ID
  getLeagueDetails: async (leagueId) => {
    try {
      console.log('API: Fetching league details...', { leagueId });
      const response = await api.get(`/leagues/${leagueId}`);
      console.log('API: League details fetched successfully', { leagueId });
      return response.data.league;
    } catch (error) {
      console.warn('API: Backend unavailable for league details, using mock data:', error.message, { leagueId });
      const mockLeague = mockUserLeagues.find(l => l.id === leagueId) || mockUserLeagues[0];
      console.log('API: Returning mock league', { leagueId, mockLeagueId: mockLeague.id });
      return {
        ...mockLeague,
        standings: mockLeagueStandings,
        recentActivity: mockRecentActivity
      };
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
      console.warn('Backend unavailable for league creation, using mock data:', error.message);
      const newLeague = {
        id: `league-${Date.now()}`,
        name: leagueData.name,
        description: leagueData.description,
        publicity: leagueData.isPrivate ? 'PRIVATE' : 'PUBLIC',
        memberCount: 1,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdBy: 'temp-user-123',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      return newLeague;
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
      console.warn('Backend unavailable for league join, using mock data:', error.message);
      if (joinCode === 'DEMO123') {
        const mockLeague = {
          id: 'league-demo',
          name: 'Demo League',
          description: 'A demo league for testing',
          memberCount: 25,
          joinCode: 'DEMO123',
          status: 'active'
        };
        return mockLeague;
      } else {
        throw new Error('Invalid join code');
      }
    }
  },

  // Leave league
  leaveLeague: async (leagueId) => {
    try {
      const response = await api.delete(`/leagues/${leagueId}/leave`);
      return response.data.message;
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error.message);
      return 'Successfully left the league';
    }
  },

  // Get league standings
  getLeagueStandings: async (leagueId) => {
    try {
      const response = await api.get(`/leagues/${leagueId}/standings`);
      return response.data.standings;
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error.message);
      return mockLeagueStandings;
    }
  },

  // Update league settings (admin only)
  updateLeague: async (leagueId, updates) => {
    try {
      const response = await api.put(`/leagues/${leagueId}`, updates);
      return response.data.league;
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error.message);
      return { id: leagueId, ...updates };
    }
  }
};

// Mock data for development
const mockUserLeagues = [
  {
    id: 'league-1',
    name: 'Premier League Predictions',
    description: 'Predict Premier League matches with friends',
    members: 42,
    position: 3,
    points: 284,
    joinCode: 'PL2024',
    isAdmin: true,
    status: 'active',
    createdAt: '2024-08-01T00:00:00Z',
    gameweek: 15,
    nextDeadline: '2024-12-14T11:30:00Z'
  },
  {
    id: 'league-2',
    name: 'Office Fantasy League',
    description: 'Workplace predictions competition',
    members: 18,
    position: 7,
    points: 156,
    joinCode: 'OFFICE24',
    isAdmin: false,
    status: 'active',
    createdAt: '2024-09-15T00:00:00Z',
    gameweek: 15,
    nextDeadline: '2024-12-14T11:30:00Z'
  },
  {
    id: 'league-3',
    name: 'Champions League Elite',
    description: 'European competition predictions',
    members: 156,
    position: 23,
    points: 198,
    joinCode: 'UCL2024',
    isAdmin: false,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
    gameweek: 6,
    nextDeadline: '2024-12-10T17:45:00Z'
  }
];

const mockFeaturedLeagues = [
  {
    id: 'featured-1',
    name: "Global Premier League Predictions",
    type: "public",
    members: 10843,
    description: "Official global league for all Premier League prediction enthusiasts.",
    sponsor: null,
    hasAwards: true,
    difficulty: "Beginner",
    category: "Premier League"
  },
  {
    id: 'featured-2',
    name: "Champions League Elite",
    type: "public",
    members: 3421,
    description: "Test your European football knowledge in this elite league.",
    sponsor: null,
    hasAwards: true,
    difficulty: "Advanced",
    category: "Champions League"
  },
  {
    id: 'featured-3',
    name: "Weekend Warriors",
    type: "public",
    members: 892,
    description: "For those who live for match day predictions.",
    sponsor: null,
    hasAwards: false,
    difficulty: "Intermediate",
    category: "Mixed"
  },
  {
    id: 'featured-4',
    name: "Official NBC Sports League",
    type: "public",
    members: 24567,
    description: "NBC Sports official prediction challenge with weekly prizes!",
    sponsor: "NBC Sports",
    hasAwards: true,
    difficulty: "Beginner",
    category: "Premier League"
  },
  {
    id: 'featured-5',
    name: "Sky Sports Super 6",
    type: "public",
    members: 31245,
    description: "Predict six matches each week with a chance to win £250,000.",
    sponsor: "Sky Sports",
    hasAwards: true,
    difficulty: "Expert",
    category: "Premier League"
  }
];

const mockLeagueStandings = [
  {
    rank: 1,
    user: { id: '1', username: 'TacticalGenius', avatar: null },
    points: 324,
    predictions: 45,
    accuracy: 71.1,
    change: 'up'
  },
  {
    rank: 2,
    user: { id: '2', username: 'ScorePredictor', avatar: null },
    points: 298,
    predictions: 44,
    accuracy: 65.9,
    change: 'down'
  },
  {
    rank: 3,
    user: { id: 'temp-user-123', username: 'DemoUser', avatar: null },
    points: 284,
    predictions: 43,
    accuracy: 62.8,
    change: 'up'
  },
  {
    rank: 4,
    user: { id: '4', username: 'FootballFan92', avatar: null },
    points: 271,
    predictions: 42,
    accuracy: 64.3,
    change: 'same'
  },
  {
    rank: 5,
    user: { id: '5', username: 'PredictionMaster', avatar: null },
    points: 265,
    predictions: 41,
    accuracy: 63.4,
    change: 'down'
  }
];

const mockRecentActivity = [
  {
    user: 'TacticalGenius',
    action: 'Perfect prediction for Arsenal vs Chelsea',
    points: 25,
    time: '2 hours ago'
  },
  {
    user: 'ScorePredictor',
    action: 'Joined the league',
    points: null,
    time: '1 day ago'
  },
  {
    user: 'DemoUser',
    action: 'Correct result for Liverpool vs City',
    points: 15,
    time: '2 days ago'
  },
  {
    user: 'FootballFan92',
    action: 'Made predictions for GW16',
    points: null,
    time: '3 days ago'
  }
];

export default leagueAPI;
