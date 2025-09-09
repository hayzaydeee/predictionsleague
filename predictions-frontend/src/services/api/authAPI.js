import baseAPI, { apiCall, setTokens, clearTokens } from './baseAPI.js';
import { handleApiError } from '../../utils/apiErrorHandler.js';

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */
export const authAPI = {
  /**
   * Login user with username/email and password
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username or email
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with user data
   */
  async login(credentials) {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/auth/login',
        data: {
          email: credentials.email || credentials.username,
          password: credentials.password,
        },
      });

      if (response.success) {
        // With HTTP-only cookies, tokens are automatically stored by browser
        // We only need to handle user data and auth state
        const { user } = response.data;
        setTokens('http-only', 'http-only'); // Mark as authenticated
        
        return {
          success: true,
          user,
        };
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      handleApiError(error, { customMessage: 'Login failed. Please check your credentials.' });
      throw error;
    }
  },

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Frontend validation: Check if passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Only send necessary data to backend (no confirmPassword)
      const response = await apiCall({
        method: 'POST',
        url: '/auth/register',
        data: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          favouriteTeam: userData.favouriteTeam.toUpperCase(), // Convert to uppercase for backend
        },
      });

      if (response.success) {
        // With HTTP-only cookies, tokens are automatically stored by browser
        // We only need to handle user data and auth state
        const { user } = response.data;
        setTokens('http-only', 'http-only'); // Mark as authenticated
        
        return {
          success: true,
          user,
        };
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      handleApiError(error, { customMessage: 'Registration failed. Please try again.' });
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/auth/logout',
      });

      // Clear tokens regardless of response
      clearTokens();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Clear tokens even if logout API call fails
      clearTokens();
      
      handleApiError(error, { silent: true });
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  },

  /**
   * Send OTP for verification (e.g., email verification, 2FA)
   * @param {Object} otpData - OTP request data
   * @param {string} otpData.email - Email address to send OTP to
   * @param {string} otpData.type - Type of OTP (e.g., 'email_verification', '2fa')
   * @returns {Promise<Object>} OTP send response
   */
  async sendVerifyOtp(otpData) {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/auth/send-verify-otp',
        data: {
          email: otpData.email,
          type: otpData.type || 'email_verification',
        },
      });

      if (response.success) {
        return {
          success: true,
          message: 'OTP sent successfully',
        };
      } else {
        throw new Error(response.error?.message || 'Failed to send OTP');
      }
    } catch (error) {
      handleApiError(error, { customMessage: 'Failed to send verification code.' });
      throw error;
    }
  },

  /**
   * Verify OTP code
   * @param {Object} verifyData - OTP verification data
   * @param {string} verifyData.email - Email address
   * @param {string} verifyData.otp - OTP code to verify
   * @param {string} verifyData.type - Type of OTP verification
   * @returns {Promise<Object>} OTP verification response
   */
  async verifyOtp(verifyData) {
    try {
      const response = await apiCall({
        method: 'POST',
        url: '/auth/verify-otp',
        data: {
          email: verifyData.email,
          otp: verifyData.otp,
          type: verifyData.type || 'email_verification',
        },
      });

      if (response.success) {
        return {
          success: true,
          message: 'OTP verified successfully',
          data: response.data,
        };
      } else {
        throw new Error(response.error?.message || 'OTP verification failed');
      }
    } catch (error) {
      handleApiError(error, { customMessage: 'Invalid verification code. Please try again.' });
      throw error;
    }
  },

  /**
   * Get current user information
   * Uses the /dashboard/me endpoint
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/me`, {
        method: 'GET',
        credentials: 'include', // Include HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        
        // Backend returns the user object directly
        return {
          success: true,
          user: user,
        };
      } else {
        throw new Error(`Authentication check failed: ${response.status}`);
      }
    } catch (error) {
      // Don't show error notifications for auth checks
      throw error;
    }
  },

  /**
   * Calls the backend endpoint to finish user onboarding
   * @param {Object} profileData - Profile completion data
   * @param {string} profileData.username - Chosen username
   * @param {string} profileData.favouriteTeam - Selected favorite team
   * @returns {Promise<Object>} Profile completion response
   */
  async completeOAuthProfile(profileData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/finish-registration`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username,
          favouriteTeam: profileData.favouriteTeam.toUpperCase() // Convert to uppercase for backend
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Mark as authenticated with complete profile
          setTokens('http-only', 'http-only');
          
          return {
            success: true,
            user: result.user,
            message: result.message || 'Profile completed successfully'
          };
        } else {
          throw new Error(result.error || 'Profile completion failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 409) {
          throw new Error(errorData.error || 'Username already taken');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid profile data');
        } else if (response.status === 401) {
          throw new Error('Not authenticated - please sign in again');
        } else {
          throw new Error(errorData.error || 'Failed to complete profile');
        }
      }
    } catch (error) {
      handleApiError(error, { customMessage: 'Failed to complete profile. Please try again.' });
      throw error;
    }
  },
};

export default authAPI;