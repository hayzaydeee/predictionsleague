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
        
        // For harmonized auth flow: backend won't have JWT cookies until profile completion
        // Skip auth check entirely and go directly to onboarding
        console.log('OAuth Callback - Harmonized flow: redirecting to onboarding (no JWT check needed)');
        
        setState({
          isProcessing: false,
          error: null,
          completed: true
        });
        
        // Navigate directly to onboarding
        setTimeout(() => navigate('/auth/finish-onboarding', { replace: true }), 50);
        
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
