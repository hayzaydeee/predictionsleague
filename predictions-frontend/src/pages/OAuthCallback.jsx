import React from 'react';
import { useOAuthCallback } from '../hooks/useOAuthCallback';

export default function OAuthCallback() {
  const { isProcessing, error } = useOAuthCallback();

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