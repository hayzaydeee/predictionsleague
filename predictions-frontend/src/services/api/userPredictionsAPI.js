/**
 * User Predictions API Service
 * Handles backend calls for user prediction data
 * 
 * This service will interface with the simplified backend endpoints
 * for user prediction status and management
 */

import { apiCall } from './baseAPI';

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
      const response = await apiCall('/predictions/user', {
        method: 'GET',
        params: { status }
      });

      console.log('User predictions fetched successfully', {
        count: response.data?.length || 0,
        status
      });

      return {
        success: true,
        data: response.data || [],
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
      const response = await apiCall('/predictions/status', {
        method: 'POST',
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
   * @param {Object} prediction - Prediction data
   * @returns {Promise<Object>} Prediction creation response
   */
  async createPrediction(prediction) {
    try {
      const response = await apiCall('/predictions', {
        method: 'POST',
        data: prediction
      });

      console.log('Prediction created successfully', {
        predictionId: response.data?.id,
        homeTeam: prediction.homeTeam,
        awayTeam: prediction.awayTeam
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to create prediction', {
        error: error.message,
        prediction
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_CREATE_ERROR',
          timestamp: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Update an existing prediction
   * @param {number} predictionId - Prediction ID
   * @param {Object} updates - Prediction updates
   * @returns {Promise<Object>} Prediction update response
   */
  async updatePrediction(predictionId, updates) {
    try {
      const response = await apiCall(`/predictions/${predictionId}`, {
        method: 'PUT',
        data: updates
      });

      console.log('Prediction updated successfully', {
        predictionId,
        updates
      });

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to update prediction', {
        error: error.message,
        predictionId,
        updates
      });

      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          type: 'PREDICTION_UPDATE_ERROR',
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
      const response = await apiCall(`/predictions/${predictionId}`, {
        method: 'DELETE'
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
      const response = await apiCall(`/predictions/${predictionId}`, {
        method: 'GET'
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
      const response = await apiCall('/predictions/statistics', {
        method: 'GET'
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
