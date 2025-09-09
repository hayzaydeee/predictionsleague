import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth/AuthService';

/**
 * Custom hook for handling OAuth callback processing
 * Uses useLayoutEffect and ref guards to prevent race conditions
 */
export const useOAuthCallback = () => {
  const navigate = useNavigate();
  const { dispatch, AUTH_ACTIONS } = useAuth(); // Get dispatch instead of login
  const [state, setState] = useState({
    isProcessing: true,
    error: null,
    completed: false
  });
  
  // Prevent multiple executions
  const hasProcessed = useRef(false);
  const processingRef = useRef(false);

  useLayoutEffect(() => {
    // Double guard against multiple executions
    if (hasProcessed.current || processingRef.current) {
      return;
    }

    const processOAuthCallback = async () => {
      // Immediate guards
      if (processingRef.current) return;
      processingRef.current = true;
      hasProcessed.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const destination = urlParams.get('destination');
        const email = urlParams.get('email');
        
        // Use AuthService to verify session instead of calling login endpoint
        const authResult = await authService.checkAuth({ 
          force: true, 
          source: 'oauth-callback' 
        });
        
        if (!authResult.success || !authResult.isAuthenticated) {
          throw new Error('OAuth authentication verification failed - no valid session');
        }
        
        // Update auth context with verified user data
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: authResult.user },
        });
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user profile is complete
        const user = authResult.user;
        console.log('OAuth Callback - User data:', user);
        console.log('OAuth Callback - Username:', user?.username);
        console.log('OAuth Callback - FavouriteTeam:', user?.favouriteTeam);
        console.log('OAuth Callback - Destination param:', destination);
        
        // For OAuth users, the primary indicator of completed onboarding is having a favouriteTeam
        // Username might be null for OAuth users who use their email as identifier
        const isProfileComplete = user && user.username && user.favouriteTeam ? true : false;
        console.log('OAuth Callback - Profile complete:', isProfileComplete);
        
        // Navigate based on profile completion status
        let targetRoute;
        if (!isProfileComplete) {
          // Profile incomplete - go directly to onboarding (skip email verification for OAuth)
          console.log('OAuth Callback - Redirecting to onboarding (incomplete profile)');
          targetRoute = '/auth/finish-onboarding';
        } else {
          // Profile complete - go to dashboard
          console.log('OAuth Callback - Redirecting to dashboard (profile complete)');
          targetRoute = '/home/dashboard';
        }
        
        setState({
          isProcessing: false,
          error: null,
          completed: true
        });
        
        // Navigate after state update
        setTimeout(() => navigate(targetRoute, { replace: true }), 50);
        
      } catch (error) {
        setState({
          isProcessing: false,
          error: error.message || 'OAuth processing failed',
          completed: false
        });
        
        // Navigate to login with error after delay
        setTimeout(() => {
          navigate('/login?error=oauth_processing_failed', { replace: true });
        }, 2000);
      }
    };

    processOAuthCallback();
  }, []); // Empty deps - run only once

  return state;
};
