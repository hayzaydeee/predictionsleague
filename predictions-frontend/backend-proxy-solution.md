/**
 * Backend API Proxy Solution
 * 
 * 1. Move external API calls to your Java Spring Boot backend
 * 2. Frontend calls your backend, backend calls Football-Data.org
 * 3. No CORS issues since backend-to-backend calls don't have CORS restrictions
 */

// Backend endpoint structure (Java Spring Boot)
/*
@RestController
@RequestMapping("/api/external-fixtures")
public class ExternalFixturesController {
    
    @GetMapping("/fixtures")
    public ResponseEntity<FixturesResponse> getFixtures(
        @RequestParam List<String> competitions,
        @RequestParam String dateFrom,
        @RequestParam String dateTo
    ) {
        // Call Football-Data.org API from backend
        // Transform data
        // Return to frontend
    }
}
*/

// Frontend modification - update API calls to use backend proxy
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';

export const externalFixturesAPI = {
  // Change this to call your backend instead of Football-Data.org directly
  async getFixtures(options = {}) {
    const response = await fetch(`${BACKEND_API_URL}/api/external-fixtures/fixtures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // Your app's auth
      },
      body: JSON.stringify(options)
    });
    
    return response.json();
  }
};

// Benefits:
// ✅ No CORS issues
// ✅ API key hidden on backend (more secure)
// ✅ Rate limiting handled on backend
// ✅ Data caching possible on backend
// ✅ Consistent with your existing architecture
