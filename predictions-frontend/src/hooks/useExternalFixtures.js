/**
 * Custom hook for external fixtures data
 * Integrates external Football-Data.org API with React Query
 */

import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { externalFixturesAPI } from '../services/api/externalFixturesAPI';

// Query keys for React Query
const QUERY_KEYS = {
  EXTERNAL_FIXTURES: 'external-fixtures',
  COMPETITION_FIXTURES: 'competition-fixtures',
  LIVE_FIXTURES: 'live-fixtures',
  TODAY_FIXTURES: 'today-fixtures',
  UPCOMING_FIXTURES: 'upcoming-fixtures',
  COMPETITION_INFO: 'competition-info'
};

/**
 * Hook for fetching fixtures from external API with caching
 */
export const useExternalFixtures = (options = {}) => {
  const {
    competitions = ['PL', 'CL'], // Default to Premier League and Champions League
    status = 'SCHEDULED',
    dateFrom,
    dateTo,
    enabled = true,
    fallbackToSample = true,
    refetchInterval = 30 * 60 * 1000, // 30 minutes
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 60 * 60 * 1000 // 1 hour
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.EXTERNAL_FIXTURES, { competitions, status, dateFrom, dateTo }],
    queryFn: async () => {
      try {
        const result = await externalFixturesAPI.getAllFixtures({
          competitions,
          status,
          dateFrom,
          dateTo,
          limit: 100
        });

        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch external fixtures');
        }

        console.log('External fixtures fetched successfully', {
          count: result.data.fixtures.length,
          competitions: result.data.competitions,
          source: 'external-api'
        });

        return result.data;
      } catch (error) {
        console.error('External fixtures fetch failed', { error: error.message });
        
        // Return empty state on error instead of fallback
        if (fallbackToSample) {
          console.warn('API failed, returning empty state');
          return {
            fixtures: [],
            source: 'empty-state',
            error: error.message,
            totalCount: 0
          };
        }
        
        throw error;
      }
    },
    enabled,
    staleTime,
    cacheTime,
    refetchInterval,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry rate limit errors
      if (error.message.includes('Rate limit')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};

/**
 * Hook for fetching Premier League and Champions League fixtures for target teams
 */
export const usePremierLeagueAndChampionsLeagueFixtures = (options = {}) => {
  return useExternalFixtures({
    competitions: ['PL', 'CL'],
    ...options
  });
};

/**
 * Hook for fetching today's fixtures across multiple competitions
 */
export const useTodaysFixtures = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000 // 5 minutes for live updates
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.TODAY_FIXTURES],
    queryFn: async () => {
      const result = await externalFixturesAPI.getTodaysFixtures();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch today\'s fixtures');
      }

      return result.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval,
    refetchOnWindowFocus: true
  });
};

/**
 * Hook for fetching live fixtures with real-time updates
 */
export const useLiveFixtures = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = 30 * 1000 // 30 seconds for live matches
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.LIVE_FIXTURES],
    queryFn: async () => {
      const result = await externalFixturesAPI.getLiveFixtures();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch live fixtures');
      }

      return result.data;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval,
    refetchOnWindowFocus: true
  });
};

/**
 * Hook for fetching upcoming fixtures for the next week
 */
export const useUpcomingFixtures = (options = {}) => {
  const {
    enabled = true,
    competitions = ['PL']
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.UPCOMING_FIXTURES, { competitions }],
    queryFn: async () => {
      const result = await externalFixturesAPI.getUpcomingFixtures();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch upcoming fixtures');
      }

      return result.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for fetching multiple competitions in parallel (limited to PL and CL)
 */
export const useMultipleCompetitions = (competitions = ['PL', 'CL'], options = {}) => {
  const {
    status = 'SCHEDULED',
    enabled = true
  } = options;

  // Filter to only allow PL and CL
  const validCompetitions = competitions.filter(comp => ['PL', 'CL'].includes(comp));

  const queries = validCompetitions.map(competition => ({
    queryKey: [QUERY_KEYS.COMPETITION_FIXTURES, competition, status],
    queryFn: async () => {
      const result = await externalFixturesAPI.getCompetitionFixtures({
        competition,
        status,
        limit: 50,
        filterTargetTeams: true
      });
      
      if (!result.success) {
        throw new Error(`Failed to fetch ${competition} fixtures`);
      }

      return {
        competition,
        ...result.data
      };
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000
  }));

  return useQueries({ queries });
};

/**
 * Hook for fetching competition information
 */
export const useCompetitionInfo = (competitionCode, options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.COMPETITION_INFO, competitionCode],
    queryFn: async () => {
      const result = await externalFixturesAPI.getCompetition(competitionCode);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch competition info');
      }

      return result.data;
    },
    enabled: enabled && !!competitionCode,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000 // 24 hours
  });
};

/**
 * Hook for searching fixtures by team
 */
export const useFixturesByTeam = (teamName, options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.EXTERNAL_FIXTURES, 'team-search', teamName],
    queryFn: async () => {
      const result = await externalFixturesAPI.getFixturesByTeam(teamName);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to search fixtures');
      }

      return result.data;
    },
    enabled: enabled && !!teamName,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });
};

/**
 * Hook for external API status monitoring
 */
export const useExternalAPIStatus = () => {
  const queryClient = useQueryClient();

  const status = externalFixturesAPI.getAPIStatus();

  const invalidateAllQueries = () => {
    queryClient.invalidateQueries([QUERY_KEYS.EXTERNAL_FIXTURES]);
    queryClient.invalidateQueries([QUERY_KEYS.COMPETITION_FIXTURES]);
    queryClient.invalidateQueries([QUERY_KEYS.LIVE_FIXTURES]);
    queryClient.invalidateQueries([QUERY_KEYS.TODAY_FIXTURES]);
    queryClient.invalidateQueries([QUERY_KEYS.UPCOMING_FIXTURES]);
  };

  const clearCache = () => {
    queryClient.clear();
  };

  return {
    status,
    invalidateAllQueries,
    clearCache,
    isConfigured: status.configured,
    rateLimitStatus: status.rateLimit
  };
};

/**
 * Utility function to transform external fixtures for compatibility
 */
export const useFixtureCompatibility = () => {
  const transformForLegacyComponents = (externalFixtures) => {
    return externalFixtures.map(fixture => ({
      // Legacy format compatibility
      id: fixture.id,
      home: fixture.homeTeam,
      away: fixture.awayTeam,
      date: fixture.date,
      venue: fixture.venue,
      competition: fixture.competition,
      gameweek: fixture.gameweek,
      referee: fixture.referee,
      predicted: fixture.predicted || false,
      
      // Extended data
      ...fixture
    }));
  };

  const transformFromSample = (sampleFixtures) => {
    return sampleFixtures.map(fixture => ({
      // Convert sample format to external format
      id: fixture.id,
      externalId: fixture.id,
      homeTeam: fixture.home,
      awayTeam: fixture.away,
      home: fixture.home,
      away: fixture.away,
      date: fixture.date,
      venue: fixture.venue,
      competition: fixture.competition,
      gameweek: fixture.gameweek,
      referee: fixture.referee,
      status: 'SCHEDULED',
      predicted: fixture.predicted || false,
      userPrediction: fixture.userPrediction || null,
      source: 'sample-data',
      lastUpdated: new Date().toISOString()
    }));
  };

  return {
    transformForLegacyComponents,
    transformFromSample
  };
};

// Export query keys for external use
export { QUERY_KEYS };

export default {
  useExternalFixtures,
  usePremierLeagueAndChampionsLeagueFixtures,
  useTodaysFixtures,
  useLiveFixtures,
  useUpcomingFixtures,
  useMultipleCompetitions,
  useCompetitionInfo,
  useFixturesByTeam,
  useExternalAPIStatus,
  useFixtureCompatibility,
  QUERY_KEYS
};
