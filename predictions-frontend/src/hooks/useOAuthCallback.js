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
      console.log('🛑 OAuth processing already completed or in progress');
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
        
        console.log('🔄 useOAuthCallback: Processing OAuth callback:', {
          url: window.location.href,
          destination,
          email,
          allParams: Object.fromEntries(urlParams.entries())
        });

        // The backend should have set HTTP-only cookies during OAuth flow
        // Now we just need to verify the authentication worked
        console.log('🔐 useOAuthCallback: Verifying OAuth authentication...');
        
        // Use AuthService to verify session instead of calling login endpoint
        const authResult = await authService.checkAuth({ 
          force: true, 
          source: 'oauth-callback' 
        });
        
        if (!authResult.success || !authResult.isAuthenticated) {
          throw new Error('OAuth authentication verification failed - no valid session');
        }
        
        console.log('✅ useOAuthCallback: OAuth session verified successfully');
        
        // Update auth context with verified user data
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: authResult.user },
        });
        
        console.log('✅ useOAuthCallback: Auth context updated with OAuth user');
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate based on destination
        const targetRoute = destination === 'onboarding' 
          ? (email ? `/verify-email?flow=oauth&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent('/auth/oauth/complete')}` : '/auth/oauth/complete')
          : '/home/dashboard';
        
        console.log('📍 useOAuthCallback: Navigating to:', targetRoute);
        
        setState({
          isProcessing: false,
          error: null,
          completed: true
        });
        
        // Navigate after state update
        setTimeout(() => navigate(targetRoute, { replace: true }), 50);
        
      } catch (error) {
        console.error('❌ useOAuthCallback: Processing failed:', error);
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
