import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        
        // Frontend-only solution: Check if this user has logged in before
        // We'll use localStorage to track known OAuth users
        const knownOAuthUsers = JSON.parse(localStorage.getItem('known_oauth_users') || '[]');
        const isReturningUser = email && knownOAuthUsers.includes(email);
        
        if (isReturningUser) {
          // Returning user - likely has complete profile
          console.log('OAuth Callback - Returning user detected, redirecting to dashboard');
          
          setState({
            isProcessing: false,
            error: null,
            completed: true
          });
          
          // Navigate to dashboard - if user doesn't have JWT, dashboard will handle auth
          setTimeout(() => navigate('/home/dashboard', { replace: true }), 50);
        } else {
          // New user or first OAuth login - assume needs onboarding
          console.log('OAuth Callback - New user detected, redirecting to onboarding');
          
          // Add email to known users list (will be marked as "known" after successful profile completion)
          if (email && !knownOAuthUsers.includes(email)) {
            knownOAuthUsers.push(email);
            localStorage.setItem('known_oauth_users', JSON.stringify(knownOAuthUsers));
            console.log('OAuth Callback - Added email to known users list');
          }
          
          setState({
            isProcessing: false,
            error: null,
            completed: true
          });
          
          // Navigate to onboarding
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
