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
const FIXTURES_ENDPOINT = '/api/fixtures';

// Match status constants
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
 * Backend API client for fixtures
 * Simplified to use only /fixtures and /fixtures/live endpoints
 */
class BackendFixturesAPIClient {
  constructor() {
    this.baseURL = BACKEND_BASE_URL;
    this.endpoint = FIXTURES_ENDPOINT;
  }

  /**
   * Get user authentication token (if needed for backend)
   */
  getAuthToken() {
    // Get from localStorage, context, or wherever your app stores auth tokens
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Make authenticated request to backend
   */
  async request(path = '') {
    const url = `${this.baseURL}${this.endpoint}${path}`;

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

      console.log('Backend Fixtures API Request:', { url });

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
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new BackendFixturesAPIClient();

/**
 * Data transformation utilities
 */
const transformers = {
  /**
   * Transform backend response to standard format
   */
  transformFixture(fixture) {
    return {
      id: fixture.id,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      date: fixture.date,
      status: fixture.status,
      venue: fixture.venue,
      gameweek: fixture.gameweek,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      competition: 'Premier League', // All fixtures are Premier League
      predicted: fixture.predicted || false // Will be merged with user predictions
    };
  }
};

/**
 * Main Fixtures API - Simplified for current gameweek Premier League only
 */
export const externalFixturesAPI = {
  // Expose configuration
  MATCH_STATUS,

  /**
   * Get current gameweek fixtures (Premier League only)
   */
  async getFixtures() {
    try {
      const response = await apiClient.request('');

      // Transform fixtures
      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          gameweek: response.gameweek,
          source: 'backend-api',
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
   * Get live fixtures (Premier League only)
   */
  async getLiveFixtures() {
    try {
      const response = await apiClient.request('/live');

      const transformedFixtures = response.fixtures?.map(transformers.transformFixture) || [];

      return {
        success: true,
        data: {
          fixtures: transformedFixtures,
          totalCount: response.totalCount || transformedFixtures.length,
          gameweek: response.gameweek,
          source: 'backend-api',
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
   * Get API status (for monitoring)
   */
  getAPIStatus() {
    return {
      configured: true,
      baseURL: BACKEND_BASE_URL,
      endpoint: FIXTURES_ENDPOINT,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Client-side filtering utilities for fixtures
 */
export const fixtureFilters = {
  /**
   * Filter fixtures for today's matches
   */
  getTodaysFixtures(fixtures) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return fixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.date);
      return fixtureDate >= today && fixtureDate < tomorrow;
    });
  },

  /**
   * Filter fixtures by prediction status
   */
  filterByPredictionStatus(fixtures, status) {
    if (status === 'all') return fixtures;
    if (status === 'predicted') return fixtures.filter(f => f.predicted);
    if (status === 'unpredicted') return fixtures.filter(f => !f.predicted);
    return fixtures;
  },

  /**
   * Filter fixtures by search query (team names)
   */
  filterBySearch(fixtures, query) {
    if (!query) return fixtures;
    
    const searchTerm = query.toLowerCase();
    return fixtures.filter(fixture => 
      fixture.homeTeam.toLowerCase().includes(searchTerm) ||
      fixture.awayTeam.toLowerCase().includes(searchTerm)
    );
  },

  /**
   * Combined filtering function
   */
  applyFilters(fixtures, filters = {}) {
    let result = fixtures;

    // Apply date filter
    if (filters.date === 'today') {
      result = this.getTodaysFixtures(result);
    }

    // Apply prediction status filter
    if (filters.status && filters.status !== 'all') {
      result = this.filterByPredictionStatus(result, filters.status);
    }

    // Apply search filter
    if (filters.search) {
      result = this.filterBySearch(result, filters.search);
    }

    return result;
  }
};

export default externalFixturesAPI;
