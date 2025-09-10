import { redirect } from 'react-router-dom';
import authAPI from '../services/api/authAPI';

/**
 * Dashboard loader - checks authentication before rendering dashboard
 * Handles OAuth users gracefully by redirecting to onboarding if no JWT
 */
export const dashboardLoader = async () => {
  try {
    // Try to get current user - this will succeed if JWT cookies exist
    const response = await authAPI.getCurrentUser();
    
    if (response.success && response.user) {
      // User is authenticated - proceed to dashboard
      return { user: response.user, needsOnboarding: false };
    } else {
      // No user data - redirect appropriately
      throw new Error('No user data received');
    }
  } catch (error) {
    // Auth failed - determine where to redirect
    console.log('Dashboard loader - Auth check failed:', error.message);
    
    // Check if this is an OAuth user who needs onboarding
    const oauthEmail = sessionStorage.getItem('oauth_user_email');
    
    if (oauthEmail) {
      // OAuth user without JWT - needs onboarding
      console.log('Dashboard loader - OAuth user needs onboarding, redirecting');
      throw redirect(`/auth/finish-onboarding?email=${encodeURIComponent(oauthEmail)}`);
    } else {
      // Regular user - needs login
      console.log('Dashboard loader - Regular user needs login, redirecting');
      throw redirect('/login?error=authentication_required');
    }
  }
};
