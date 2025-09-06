import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  
  // Immediate redirect based on URL - no async logic needed
  React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const destination = urlParams.get('destination');
    const email = urlParams.get('email'); // OAuth should provide email
    
    if (destination === 'onboarding') {
      // For new OAuth users, redirect to email verification first
      if (email) {
        navigate(`/verify-email?flow=oauth&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent('/auth/oauth/complete')}`, { replace: true });
      } else {
        // Fallback if no email provided
        navigate('/auth/oauth/complete', { replace: true });
      }
    } else if (destination === 'dashboard') {
      navigate('/home/dashboard', { replace: true });
    } else {
      // Default fallback
      navigate('/home/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-500">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300"></div>
    </div>
  );
}