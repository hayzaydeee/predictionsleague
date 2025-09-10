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
        
        // Store email in session storage if provided by backend
        if (email) {
          sessionStorage.setItem('oauth_user_email', email);
          console.log('OAuth Callback - Email stored in session:', email);
        }
        
        // For harmonized auth flow: backend won't initialize JWT until step 3
        // So we need to handle the case where /dashboard/me will fail
        let authResult;
        try {
          // Try to check auth - this might fail if JWT not initialized yet
          authResult = await authService.checkAuth({ 
            force: true, 
            source: 'oauth-callback' 
          });
        } catch (error) {
          console.log('OAuth Callback - Auth check failed (expected if JWT not initialized):', error.message);
          // This is expected if backend hasn't set JWT cookies yet
          authResult = { success: false, isAuthenticated: false };
        }
        
        // Handle two scenarios:
        // 1. JWT cookies exist (user profile complete) → go to dashboard
        // 2. No JWT cookies (incomplete profile) → go to onboarding
        if (authResult.success && authResult.isAuthenticated && authResult.user) {
          // User has JWT and complete profile
          const user = authResult.user;
          
          // Update auth context with verified user data
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: authResult.user },
          });
          
          console.log('OAuth Callback - User authenticated with complete profile, redirecting to dashboard');
          
          setState({
            isProcessing: false,
            error: null,
            completed: true
          });
          
          setTimeout(() => navigate('/home/dashboard', { replace: true }), 50);
        } else {
          // No JWT cookies or incomplete profile → go to onboarding
          console.log('OAuth Callback - No JWT or incomplete profile, redirecting to onboarding');
          
          setState({
            isProcessing: false,
            error: null,
            completed: true
          });
          
          setTimeout(() => navigate('/auth/finish-onboarding', { replace: true }), 50);
        }
        
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
