/**
 * User Predictions API Service
 * Handles backend calls for user prediction data
 * 
 * This service will interface with the simplified backend endpoints
 * for user prediction status and management
 */

import { apiCall } from './baseAPI';
import { 
  transformPredictionToBackend, 
  validateBackendPayload,
  transformChipsFromBackend,
  transformTeamNameFromBackend 
} from '../../utils/backendMappings';

/**
 * User Predictions API Service
 */
export const userPredictionsAPI = {
  /**
   * Get all user predictions
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status ('upcoming', 'completed', 'all')
   * @returns {Promise<Object>} User predictions response
   */
  async getAllUserPredictions(options = {}) {
    const { status = 'upcoming' } = options;

    try {
      // This endpoint will be implemented in the backend
      const response = await apiCall({
        method: 'GET',
        url: '/predictions/user',
        params: { status }
      });

      console.log('📥 User predictions fetched successfully', {
        count: response.data?.length || 0,
        status,
        rawResponse: response
      });

      // Log detailed prediction data
      if (response.data && response.data.length > 0) {
        console.log('📊 First prediction sample:', {
          prediction: response.data[0],
          hasStatus: 'status' in response.data[0],
          statusValue: response.data[0].status,
          hasPoints: 'points' in response.data[0],
          pointsValue: response.data[0].points,
          hasActualScores: 'actualHomeScore' in response.data[0],
          actualHomeScore: response.data[0].actualHomeScore,
          actualAwayScore: response.data[0].actualAwayScore
        });
        
        // Log all predictions with their status
        console.log('📋 All predictions status breakdown:', 
          response.data.map(p => ({
            id: p.id,
            match: `${p.homeTeam} vs ${p.awayTeam}`,
            status: p.status,
            points: p.points,
            actualScores: `${p.actualHomeScore ?? 'null'}-${p.actualAwayScore ?? 'null'}`,
            date: p.date || p.matchDate
          }))
        );
      }

      // 🔧 NORMALIZE DATA: Fix backend inconsistencies
      const normalizedData = (response.data || []).map(prediction => {
        const normalized = { ...prediction };
        
        // Convert backend "PENDING" status to lowercase "pending"
        if (normalized.status) {
          normalized.status = normalized.status.toLowerCase();
        }
        
        // If status is pending and points is 0, set to null
        // This fixes the backend returning 0 instead of null for pending predictions
        if (normalized.status === 'pending' && normalized.points === 0) {
          normalized.points = null;
          console.log('🔧 Fixed points for pending prediction:', {
            match: `${normalized.homeTeam} vs ${normalized.awayTeam}`,
            oldPoints: 0,
            newPoints: null
          });
        }
        
        // Ensure actualScores are truly null if match hasn't been played
        if (normalized.status === 'pending') {
          if (normalized.actualHomeScore === 0 || normalized.actualHomeScore === undefined) {
            normalized.actualHomeScore = null;
          }
          if (normalized.actualAwayScore === 0 || normalized.actualAwayScore === undefined) {
            normalized.actualAwayScore = null;
          }
        }
        
        return normalized;
      });

      console.log('✅ Data normalized - points set to null for pending predictions');

      return {
        success: true,
        data: normalizedData,
        meta: response.meta || {},
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch user predictions', {
        error: error.message,
        status
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'USER_PREDICTIONS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get prediction status for specific fixtures
   * @param {Array} fixtures - Array of fixture objects to check
   * @returns {Promise<Object>} Prediction status response
   */
  async getPredictionStatus(fixtures) {
    if (!fixtures || !Array.isArray(fixtures)) {
      return {
        success: false,
        data: null,
        error: {
          message: 'Invalid fixtures array provided',
          type: 'VALIDATION_ERROR'
        }
      };
    }

    try {
      // Transform fixtures for backend request
      const requestPayload = {
        fixtures: fixtures.map(fixture => ({
          homeTeam: fixture.homeTeam || fixture.home,
          awayTeam: fixture.awayTeam || fixture.away,
          date: fixture.date,
          externalId: fixture.externalId || fixture.id
        }))
      };

      // This endpoint will be implemented in the backend
      const response = await apiCall({
        method: 'POST',
        url: '/predictions/status',
        data: requestPayload
      });

      console.log('Prediction status fetched successfully', {
        fixturesRequested: fixtures.length,
        statusesReturned: response.data?.length || 0
      });

      return {
        success: true,
        data: response.data || [],
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch prediction status', {
        error: error.message,
        fixturesCount: fixtures.length
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_STATUS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Create or update a prediction
   * @param {Object} frontendPrediction - Frontend prediction object
   * @param {Object} fixture - Frontend fixture object
   * @param {boolean} isEditing - Whether this is an update (true) or creation (false)
   * @returns {Promise<Object>} Prediction creation/update response
   */
  async makePrediction(frontendPrediction, fixture, isEditing = false) {
    try {
      // Transform frontend data to backend format
      const backendPayload = transformPredictionToBackend(frontendPrediction, fixture);
      
      // Validate the payload before sending
      const validation = validateBackendPayload(backendPayload);
      if (!validation.isValid) {
        throw new Error(`Invalid prediction data: ${validation.errors.join(', ')}`);
      }

      console.log(`🚀 ${isEditing ? 'Updating' : 'Creating'} prediction with backend payload:`, {
        matchId: backendPayload.matchId,
        teams: `${backendPayload.homeTeam} vs ${backendPayload.awayTeam}`,
        score: `${backendPayload.homeScore}-${backendPayload.awayScore}`,
        chips: backendPayload.chips,
        gameweek: backendPayload.gameweek,
        isEditing
      });

      const response = await apiCall({
        method: isEditing ? 'PUT' : 'POST',
        url: '/predictions/make-prediction',
        data: backendPayload
      });

      console.log(`✅ Prediction ${isEditing ? 'updated' : 'created'} successfully`, {
        predictionId: response.data?.id,
        matchId: backendPayload.matchId
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error(`❌ Failed to ${isEditing ? 'update' : 'create'} prediction`, {
        error: error.message,
        frontendPrediction,
        fixture,
        isEditing
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: isEditing ? 'PREDICTION_UPDATE_ERROR' : 'PREDICTION_CREATE_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },


  /**
   * Delete a prediction
   * @param {number} predictionId - Prediction ID
   * @returns {Promise<Object>} Prediction deletion response
   */
  async deletePrediction(predictionId) {
    try {
      const response = await apiCall({
        method: 'DELETE',
        url: `/predictions/${predictionId}`
      });

      console.log('Prediction deleted successfully', {
        predictionId
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to delete prediction', {
        error: error.message,
        predictionId
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_DELETE_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get prediction by ID
   * @param {number} predictionId - Prediction ID
   * @returns {Promise<Object>} Prediction response
   */
  async getPrediction(predictionId) {
    try {
      const response = await apiCall({
        method: 'GET',
        url: `/predictions/${predictionId}`
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch prediction', {
        error: error.message,
        predictionId
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_FETCH_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get prediction statistics for the user
   * @returns {Promise<Object>} Prediction statistics response
   */
  async getPredictionStatistics() {
    try {
      const response = await apiCall({
        method: 'GET',
        url: '/predictions/statistics'
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch prediction statistics', {
        error: error.message
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_STATS_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};

export default userPredictionsAPI;
