import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth/AuthService';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const destination = urlParams.get('destination');
        const email = urlParams.get('email');
        
        console.log('🔄 OAuthCallback processing:', {
          url: window.location.href,
          destination,
          email,
          allParams: Object.fromEntries(urlParams.entries())
        });

        // Use OAuth-specific authentication check
        console.log('🔐 Checking OAuth authentication status...');
        try {
          const authResult = await authService.checkOAuthAuth();
          console.log('✅ OAuth authentication successful:', authResult);
          
          // Update auth context using the special OAuth login pattern
          if (authResult.success && authResult.user) {
            await login({
              skipApiCall: true,
              userData: authResult.user
            });
            console.log('✅ Auth context updated with OAuth user');
          } else {
            throw new Error('No user data received from OAuth');
          }
        } catch (authError) {
          console.error('❌ OAuth authentication failed:', authError);
          setError('Authentication failed. Redirecting to login...');
          setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 2000);
          return;
        }
        
        // Small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (destination === 'onboarding') {
          console.log('📍 Redirecting to onboarding flow');
          if (email) {
            navigate(`/verify-email?flow=oauth&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent('/auth/oauth/complete')}`, { replace: true });
          } else {
            navigate('/auth/oauth/complete', { replace: true });
          }
        } else if (destination === 'dashboard') {
          console.log('📍 Redirecting to dashboard');
          navigate('/home/dashboard', { replace: true });
        } else {
          console.log('📍 No destination specified, defaulting to dashboard');
          navigate('/home/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('❌ OAuth callback processing failed:', error);
        setError('OAuth processing failed. Redirecting to login...');
        setTimeout(() => navigate('/login?error=oauth_processing_failed', { replace: true }), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [navigate, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-500">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-500">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300 mx-auto mb-4"></div>
        <div className="text-white">
          {isProcessing ? 'Processing OAuth login...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  );
}