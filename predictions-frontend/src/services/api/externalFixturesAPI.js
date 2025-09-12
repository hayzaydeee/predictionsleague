/**
 * External Fixtures API Service
 * Handles direct calls to Football-Data.org API v4
 * 
 * API Documentation: https://docs.football-data.org/general/v4/resources.html
 * Base URL: https://api.football-data.org/v4
 * Authentication: X-Auth-Token header
 */

// Configuration
const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

// Competition codes for target leagues
const COMPETITION_CODES = {
  PREMIER_LEAGUE: 'PL',
  CHAMPIONS_LEAGUE: 'CL'
};

// Target teams - only fixtures involving these teams
const TARGET_TEAMS = {
  'Chelsea': ['Chelsea', 'Chelsea FC'],
  'Arsenal': ['Arsenal', 'Arsenal FC'], 
  'Liverpool': ['Liverpool', 'Liverpool FC'],
  'Tottenham': ['Tottenham', 'Tottenham Hotspur', 'Spurs'],
  'Manchester City': ['Manchester City', 'Man City', 'Man. City'],
  'Manchester United': ['Manchester United', 'Man United', 'Man Utd', 'Man. Utd']
};

// Flattened list of all team name variations for filtering
const ALL_TARGET_TEAM_NAMES = Object.values(TARGET_TEAMS).flat().map(name => name.toLowerCase());

// Match status types from API
const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
  AWARDED: 'AWARDED'
};

// Rate limiting configuration
const RATE_LIMIT = {
  FREE_TIER: 10, // requests per minute
  PAID_TIER: 3000 // requests per hour
};

/**
 * HTTP client with authentication and error handling
 */
class FootballDataAPIClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.apiKey = API_KEY;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimitWindow = 60000; // 1 minute in ms
  }

  /**
   * Rate limiting check for free tier (10 requests/minute)
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // Check if we've hit the limit
    if (this.requestCount >= RATE_LIMIT.FREE_TIER) {
      const waitTime = this.rateLimitWindow - (now - this.lastRequestTime);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    this.requestCount++;
  }

  /**
   * Make authenticated request to Football-Data.org API
   */
  async request(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('Football-Data.org API key not configured. Set VITE_FOOTBALL_API_KEY environment variable.');
    }

    await this.checkRateLimit();

    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const url = `${this.baseURL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Auth-Token': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Football-Data.org API Request Failed:', {
        endpoint,
        params,
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new FootballDataAPIClient();

/**
 * Data transformation utilities
 */
const transformers = {
  /**
   * Check if a fixture involves any of our target teams
   */
  isTargetTeamFixture(match) {
    const homeTeam = (match.homeTeam?.shortName || match.homeTeam?.name || '').toLowerCase();
    const awayTeam = (match.awayTeam?.shortName || match.awayTeam?.name || '').toLowerCase();
    
    return ALL_TARGET_TEAM_NAMES.some(targetTeam => 
      homeTeam.includes(targetTeam.toLowerCase()) || 
      awayTeam.includes(targetTeam.toLowerCase())
    );
  },

  /**
   * Transform external API match to our internal fixture format
   */
  transformMatch(match) {
    return {
      // External API data
      id: match.id,
      externalId: match.id,
      homeTeam: match.homeTeam?.shortName || match.homeTeam?.name || 'TBD',
      awayTeam: match.awayTeam?.shortName || match.awayTeam?.name || 'TBD',
      home: match.homeTeam?.shortName || match.homeTeam?.name || 'TBD', // Alias for compatibility
      away: match.awayTeam?.shortName || match.awayTeam?.name || 'TBD', // Alias for compatibility
      date: match.utcDate,
      venue: match.venue || 'TBD',
      competition: match.competition?.name || 'Unknown',
      gameweek: match.matchday || null,
      referee: match.referees?.find(ref => ref.type === 'REFEREE')?.name || 'TBD',
      status: match.status,
      
      // Score data (for live/finished matches)
      score: match.score ? {
        home: match.score.fullTime?.home || null,
        away: match.score.fullTime?.away || null,
        halfTime: {
          home: match.score.halfTime?.home || null,
          away: match.score.halfTime?.away || null
        },
        extraTime: match.score.extraTime ? {
          home: match.score.extraTime.home,
          away: match.score.extraTime.away
        } : null,
        penalties: match.score.penalties ? {
          home: match.score.penalties.home,
          away: match.score.penalties.away
        } : null
      } : null,
      
      // User data (to be merged client-side)
      predicted: false,
      userPrediction: null,
      
      // Metadata
      source: 'external-api',
      lastUpdated: new Date().toISOString(),
      
      // Team IDs for advanced matching
      homeTeamId: match.homeTeam?.id,
      awayTeamId: match.awayTeam?.id,
      
      // Additional metadata
      season: match.season ? {
        id: match.season.id,
        startDate: match.season.startDate,
        endDate: match.season.endDate,
        currentMatchday: match.season.currentMatchday
      } : null,
      
      // Competition details
      competitionCode: match.competition?.code,
      competitionId: match.competition?.id,
      competitionType: match.competition?.type,
      competitionEmblem: match.competition?.emblem
    };
  },

  /**
   * Transform competition data
   */
  transformCompetition(competition) {
    return {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
      currentSeason: competition.currentSeason ? {
        id: competition.currentSeason.id,
        startDate: competition.currentSeason.startDate,
        endDate: competition.currentSeason.endDate,
        currentMatchday: competition.currentSeason.currentMatchday,
        winner: competition.currentSeason.winner
      } : null,
      area: competition.area ? {
        id: competition.area.id,
        name: competition.area.name,
        code: competition.area.code,
        flag: competition.area.flag
      } : null
    };
  }
};

/**
 * External Fixtures API Service
 */
export const externalFixturesAPI = {
  // Competition codes for reference
  COMPETITIONS: COMPETITION_CODES,
  
  // Match status constants
  STATUS: MATCH_STATUS,

  /**
   * Get fixtures for a specific competition
   * @param {Object} options - Query options
   * @param {string} options.competition - Competition code (e.g., 'PL' for Premier League)
   * @param {string} options.status - Match status filter ('SCHEDULED', 'FINISHED', etc.)
   * @param {string} options.dateFrom - Start date filter (YYYY-MM-DD or 'TODAY', 'YESTERDAY')
   * @param {string} options.dateTo - End date filter (YYYY-MM-DD or 'TOMORROW')
   * @param {number} options.matchday - Specific matchday/gameweek filter
   * @param {number} options.season - Season year filter
   * @param {number} options.limit - Maximum number of matches (default: 100)
   * @returns {Promise<Object>} Transformed fixtures data
   */
  async getCompetitionFixtures(options = {}) {
    const {
      competition = COMPETITION_CODES.PREMIER_LEAGUE,
      status,
      dateFrom,
      dateTo,
      matchday,
      season,
      limit = 100,
      filterTargetTeams = true
    } = options;

    // Only allow PL and CL competitions
    if (![COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE].includes(competition)) {
      return {
        success: false,
        data: null,
        error: {
          message: `Only Premier League (PL) and Champions League (CL) are supported. Received: ${competition}`,
          type: 'UNSUPPORTED_COMPETITION',
          timestamp: new Date().toISOString()
        }
      };
    }

    const params = {
      status,
      dateFrom,
      dateTo,
      matchday,
      season,
      limit
    };

    try {
      const response = await apiClient.request(`/competitions/${competition}/matches`, params);
      
      // Filter for target teams only
      let filteredMatches = response.matches || [];
      if (filterTargetTeams) {
        filteredMatches = filteredMatches.filter(match => transformers.isTargetTeamFixture(match));
      }
      
      return {
        success: true,
        data: {
          fixtures: filteredMatches.map(transformers.transformMatch),
          competition: response.competition ? transformers.transformCompetition(response.competition) : null,
          filters: response.filters || {},
          resultSet: response.resultSet || {},
          count: filteredMatches.length,
          originalCount: response.matches?.length || 0,
          filtered: filterTargetTeams
        },
        meta: {
          source: 'football-data.org',
          endpoint: `/competitions/${competition}/matches`,
          timestamp: new Date().toISOString(),
          rateLimitRemaining: RATE_LIMIT.FREE_TIER - apiClient.requestCount,
          targetTeamsOnly: filterTargetTeams
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'EXTERNAL_API_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get all fixtures across multiple competitions
   * @param {Object} options - Query options
   * @param {string[]} options.competitions - Array of competition codes
   * @param {string} options.status - Match status filter
   * @param {string} options.dateFrom - Start date filter
   * @param {string} options.dateTo - End date filter
   * @param {number} options.limit - Maximum number of matches per competition
   * @returns {Promise<Object>} Combined fixtures data
   */
  async getAllFixtures(options = {}) {
    const {
      competitions = [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE],
      status = MATCH_STATUS.SCHEDULED,
      dateFrom,
      dateTo,
      limit = 50,
      filterTargetTeams = true
    } = options;

    // Validate competitions - only allow PL and CL
    const validCompetitions = competitions.filter(comp => 
      [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE].includes(comp)
    );

    if (validCompetitions.length === 0) {
      return {
        success: false,
        data: null,
        error: {
          message: 'No valid competitions specified. Only Premier League (PL) and Champions League (CL) are supported.',
          type: 'INVALID_COMPETITIONS',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      // Fetch fixtures from valid competitions only
      const fixturePromises = validCompetitions.map(competition =>
        this.getCompetitionFixtures({
          competition,
          status,
          dateFrom,
          dateTo,
          limit,
          filterTargetTeams
        })
      );

      const results = await Promise.allSettled(fixturePromises);
      
      // Combine successful results
      const fixtures = [];
      const errors = [];
      const metadata = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          fixtures.push(...result.value.data.fixtures);
          metadata.push({
            competition: validCompetitions[index],
            count: result.value.data.count,
            originalCount: result.value.data.originalCount,
            filtered: result.value.data.filtered,
            filters: result.value.data.filters
          });
        } else {
          errors.push({
            competition: validCompetitions[index],
            error: result.reason?.message || result.value?.error?.message || 'Unknown error'
          });
        }
      });

      // Sort fixtures by date
      fixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        success: errors.length < results.length, // Success if at least one competition worked
        data: {
          fixtures,
          metadata,
          totalCount: fixtures.length,
          competitions: validCompetitions.length,
          successfulCompetitions: results.length - errors.length,
          targetTeamsOnly: filterTargetTeams,
          targetTeams: Object.keys(TARGET_TEAMS)
        },
        errors: errors.length > 0 ? errors : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'MULTIPLE_COMPETITIONS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get today's fixtures for target teams only
   * @returns {Promise<Object>} Today's fixtures
   */
  async getTodaysFixtures() {
    return this.getAllFixtures({
      competitions: [
        COMPETITION_CODES.PREMIER_LEAGUE,
        COMPETITION_CODES.CHAMPIONS_LEAGUE
      ],
      dateFrom: 'TODAY',
      dateTo: 'TODAY',
      status: MATCH_STATUS.SCHEDULED,
      limit: 50,
      filterTargetTeams: true
    });
  },

  /**
   * Get upcoming fixtures for target teams in the next 7 days
   * @returns {Promise<Object>} Upcoming fixtures
   */
  async getUpcomingFixtures() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.getAllFixtures({
      competitions: [COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE],
      dateFrom: today.toISOString().split('T')[0],
      dateTo: nextWeek.toISOString().split('T')[0],
      status: MATCH_STATUS.SCHEDULED,
      limit: 100,
      filterTargetTeams: true
    });
  },

  /**
   * Get live fixtures for target teams that are currently in progress
   * @returns {Promise<Object>} Live fixtures
   */
  async getLiveFixtures() {
    return this.getAllFixtures({
      competitions: [
        COMPETITION_CODES.PREMIER_LEAGUE,
        COMPETITION_CODES.CHAMPIONS_LEAGUE
      ],
      status: MATCH_STATUS.LIVE,
      limit: 50,
      filterTargetTeams: true
    });
  },

  /**
   * Get specific competition information (PL or CL only)
   * @param {string} competitionCode - Competition code ('PL' or 'CL')
   * @returns {Promise<Object>} Competition details
   */
  async getCompetition(competitionCode) {
    // Only allow PL and CL
    if (![COMPETITION_CODES.PREMIER_LEAGUE, COMPETITION_CODES.CHAMPIONS_LEAGUE].includes(competitionCode)) {
      return {
        success: false,
        data: null,
        error: {
          message: `Only Premier League (PL) and Champions League (CL) are supported. Received: ${competitionCode}`,
          type: 'UNSUPPORTED_COMPETITION',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      const response = await apiClient.request(`/competitions/${competitionCode}`);
      
      return {
        success: true,
        data: transformers.transformCompetition(response),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'COMPETITION_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Search fixtures by team names (limited to target teams)
   * @param {string} teamName - Team name to search for
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Filtered fixtures
   */
  async getFixturesByTeam(teamName, options = {}) {
    // Check if the team is in our target teams list
    const normalizedSearchTeam = teamName.toLowerCase();
    const isTargetTeam = ALL_TARGET_TEAM_NAMES.some(targetTeam => 
      targetTeam.toLowerCase().includes(normalizedSearchTeam) ||
      normalizedSearchTeam.includes(targetTeam.toLowerCase())
    );

    if (!isTargetTeam) {
      return {
        success: false,
        data: null,
        error: {
          message: `Team "${teamName}" is not in our target teams list. Supported teams: ${Object.keys(TARGET_TEAMS).join(', ')}`,
          type: 'UNSUPPORTED_TEAM',
          timestamp: new Date().toISOString()
        }
      };
    }

    const fixtures = await this.getUpcomingFixtures();
    
    if (!fixtures.success) {
      return fixtures;
    }

    const filteredFixtures = fixtures.data.fixtures.filter(fixture =>
      fixture.homeTeam.toLowerCase().includes(normalizedSearchTeam) ||
      fixture.awayTeam.toLowerCase().includes(normalizedSearchTeam)
    );

    return {
      ...fixtures,
      data: {
        ...fixtures.data,
        fixtures: filteredFixtures,
        totalCount: filteredFixtures.length,
        searchTerm: teamName,
        targetTeamSearch: true
      }
    };
  },

  /**
   * Get API status and rate limit information
   * @returns {Object} API status
   */
  getAPIStatus() {
    return {
      configured: !!API_KEY,
      baseURL: BASE_URL,
      supportedCompetitions: Object.keys(COMPETITION_CODES),
      targetTeams: Object.keys(TARGET_TEAMS),
      targetTeamVariations: TARGET_TEAMS,
      rateLimit: {
        limit: RATE_LIMIT.FREE_TIER,
        used: apiClient.requestCount,
        remaining: RATE_LIMIT.FREE_TIER - apiClient.requestCount,
        resetTime: new Date(apiClient.lastRequestTime + apiClient.rateLimitWindow).toISOString()
      },
      lastRequestTime: apiClient.lastRequestTime ? new Date(apiClient.lastRequestTime).toISOString() : null
    };
  }
};

export default externalFixturesAPI;
