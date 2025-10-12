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
const FIXTURES_ENDPOINT = '/fixtures';

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
    // Try multiple token storage locations
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken') || 
           '';
  }

  /**
   * Make request to backend (no auth for now - testing)
   */
  async request(path = '') {
    const url = `${this.baseURL}${this.endpoint}${path}`;

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // For now, don't use authentication to test if fixtures are public
      console.log('Backend Fixtures API Request (no auth):', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData = {};
        const responseText = await response.text();
        console.log('Error response body:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { rawResponse: responseText };
        }
        
        throw new Error(`Backend API Error ${response.status}: ${errorData.error || errorData.message || responseText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('Success response body:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid JSON response from backend');
      }
      
      console.log('Parsed response:', result);
      
      // Handle different response formats
      if (result.success === false) {
        throw new Error(result.error || 'Backend API request failed');
      }

      // Return data directly if success field exists, otherwise assume raw data
      return result.success ? result.data : result;
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
    if (!fixture) {
      console.warn('Received undefined fixture in transformer');
      return null;
    }

    return {
      id: fixture.id || Date.now(),
      homeTeam: fixture.homeTeam || 'TBD',
      awayTeam: fixture.awayTeam || 'TBD',
      date: fixture.date || new Date().toISOString(),
      status: fixture.status || 'SCHEDULED',
      venue: fixture.venue || '',
      gameweek: fixture.gameweek || 1,
      homeScore: fixture.homeScore || null,
      awayScore: fixture.awayScore || null,
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
      console.log('Attempting to fetch fixtures from backend...');
      const response = await apiClient.request('');

      console.log('Raw backend response:', response);

      // Transform fixtures (filter out nulls from failed transforms)
      const transformedFixtures = (response.fixtures || [])
        .map(transformers.transformFixture)
        .filter(fixture => fixture !== null);

      console.log('Transformed fixtures:', transformedFixtures);

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
      console.error('Backend fixtures request failed:', error);
      
      // If it's a 404, the endpoint might not be implemented yet
      if (error.message.includes('404')) {
        console.warn('Fixtures endpoint not found (404) - backend might not have implemented /fixtures yet');
      }
      
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR',
          status: error.message.includes('404') ? 404 : null
        }
      };
    }
  },

  /**
   * Get live fixtures (Premier League only)
   */
  async getLiveFixtures() {
    try {
      console.log('Attempting to fetch live fixtures from backend...');
      const response = await apiClient.request('/live');

      const transformedFixtures = (response.fixtures || [])
        .map(transformers.transformFixture)
        .filter(fixture => fixture !== null);

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
      console.error('Backend live fixtures request failed:', error);
      
      return {
        success: false,
        error: {
          message: error.message,
          type: 'BACKEND_API_ERROR',
          status: error.message.includes('404') ? 404 : null
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
