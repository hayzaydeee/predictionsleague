/**
 * External Fixtures API Service - Backend Proxy Version
 * Calls backend proxy instead of Football-Data.org directly to avoid CORS issues
 * 
 * Backend API Documentation: See predictions-backend/docs/EXTERNAL_FIXTURES_API_IMPLEMENTATION.md
 * Backend Base URL: Configured via VITE_API_BASE_URL
 * Authentication: Uses existing app authentication
 */

// Configuration
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const EXTERNAL_FIXTURES_ENDPOINT = '/api/external-fixtures';

// Competition codes for target leagues (kept for frontend reference)
const COMPETITION_CODES = {
  PREMIER_LEAGUE: 'PL',
  CHAMPIONS_LEAGUE: 'CL'
};

// Target teams - handled by backend but kept for frontend validation
const TARGET_TEAMS = {
  'Chelsea': ['Chelsea', 'Chelsea FC'],
  'Arsenal': ['Arsenal', 'Arsenal FC'], 
  'Liverpool': ['Liverpool', 'Liverpool FC'],
  'Tottenham': ['Tottenham', 'Tottenham Hotspur', 'Spurs'],
  'Manchester City': ['Manchester City', 'Man City', 'Man. City'],
  'Manchester United': ['Manchester United', 'Man United', 'Man Utd', 'Man. Utd']
};

// Flattened list of all team name variations for filtering
const ALL_TARGET_TEAM_NAMES = Object.values(TARGET_TEAMS).flat();

// Match status constants (kept for compatibility)
const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE', 
  IN_PLAY: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
  AWARDED: 'AWARDED'
};

/**
 * Backend API client for external fixtures
 * Calls backend proxy instead of external API directly
 */
class BackendFixturesAPIClient {
  constructor() {
    this.baseURL = BACKEND_BASE_URL;
    this.endpoint = EXTERNAL_FIXTURES_ENDPOINT;
  }

  /**
   * Get user authentication token (if needed for backend)
   */
  getAuthToken() {
    // Get from localStorage, context, or wherever your app stores auth tokens
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Make authenticated request to backend proxy
   */
  async request(path, params = {}) {
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const url = `${this.baseURL}${this.endpoint}${path}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // Add auth token if available
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Backend API Request:', { url, params });

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend API Error ${response.status}: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      // Backend returns { success: true, data: {...} } format
      if (!result.success) {
        throw new Error(result.error || 'Backend API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('Backend Fixtures API Request Failed:', {
        url,
        params,
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new BackendFixturesAPIClient();

/**
 * Data transformation utilities (simplified since backend handles most filtering)
 */
const transformers = {
  /**
   * Check if a fixture involves any of our target teams (frontend validation)
   */
  isTargetTeamFixture(fixture) {
    const homeTeam = (fixture.homeTeam || '').toLowerCase();
    const awayTeam = (fixture.awayTeam || '').toLowerCase();
    
    return ALL_TARGET_TEAM_NAMES.some(targetTeam => 
      homeTeam.includes(targetTeam.toLowerCase()) || 
      awayTeam.includes(targetTeam.toLowerCase())
    );
  },

  /**
   * Transform backend response to standard format
   */
  transformFixture(fixture) {
    return {
      id: fixture.id,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      date: fixture.date,
      competition: fixture.competition,
      competitionCode: fixture.competitionCode,
      status: fixture.status,
      venue: fixture.venue,
      gameweek: fixture.gameweek,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
    };
  }
};

/**
 * Main External Fixtures API
 */
export const externalFixturesAPI = {
  // Expose configuration
  TARGET_TEAMS,
  TARGET_COMPETITIONS: [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE],
  MATCH_STATUS,

  /**
   * Get all fixtures with filtering options
   */
  async getFixtures(options = {}) {
    const {
      competitions = [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE],
      dateFrom,
      dateTo,
      status,
      teams,
      limit = 100
    } = options;

    try {
      const params = {
        competitions,
        dateFrom,
        dateTo,
        status,
        teams,
        limit
      };

      const response = await apiClient.request('/fixtures', params);

      // Transform fixtures if needed
      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          source: response.source || 'backend-proxy',
          timestamp: response.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get today's fixtures
   */
  async getTodaysFixtures(options = {}) {
    const {
      competitions = [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE]
    } = options;

    try {
      const params = { competitions };
      const response = await apiClient.request('/fixtures/today', params);

      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          source: response.source || 'backend-proxy',
          timestamp: response.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get live fixtures
   */
  async getLiveFixtures() {
    try {
      const response = await apiClient.request('/fixtures/live');

      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          source: response.source || 'backend-proxy',
          timestamp: response.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get upcoming fixtures
   */
  async getUpcomingFixtures(options = {}) {
    const {
      days = 7,
      competitions = [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE]
    } = options;

    try {
      const params = { days, competitions };
      const response = await apiClient.request('/fixtures/upcoming', params);

      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          source: response.source || 'backend-proxy',
          timestamp: response.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get fixtures for specific competition
   */
  async getCompetitionFixtures(competition, options = {}) {
    const {
      dateFrom,
      dateTo,
      status,
      limit = 100
    } = options;

    try {
      const params = {
        competitions: [competition],
        dateFrom,
        dateTo,
        status,
        limit
      };

      const response = await apiClient.request('/fixtures', params);

      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          source: response.source || 'backend-proxy',
          timestamp: response.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get supported competitions
   */
  async getCompetitions() {
    try {
      const response = await apiClient.request('/competitions');

      return {
        success: true,
        data: response || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Get target teams
   */
  async getTargetTeams() {
    try {
      const response = await apiClient.request('/teams');

      return {
        success: true,
        data: response || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  },

  /**
   * Health check for backend API
   */
  async healthCheck() {
    try {
      const response = await apiClient.request('/health');

      return {
        success: true,
        data: {
          status: 'healthy',
          message: response,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR'
        }
      };
    }
  }
};

export default externalFixturesAPI;
