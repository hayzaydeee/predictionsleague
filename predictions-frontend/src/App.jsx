import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "./context/ThemeContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { AuthProvider } from "./context/AuthContext";
import { QueryProvider } from "./context/QueryContext";
import DefaultRedirect from "./components/common/DefaultRedirect";
import PrivateRoute, { PublicRoute } from "./components/common/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HowToPlay from "./pages/HowToPlay";
import Home from "./pages/Home";
import OAuthCallback from "./pages/OAuthCallback";
import OAuthOnboarding from "./pages/OAuthOnboarding";
import EmailVerification from "./pages/EmailVerification";
import { dashboardLoader } from "./loaders/dashboardLoader";

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/howToPlay",
    element: <HowToPlay />
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    )
  },
  {
    path: "/auth/callback",
    element: <OAuthCallback />
  },
  {
    path: "/verify-email",
    element: (
      <PublicRoute>
        <EmailVerification />
      </PublicRoute>
    )
  },
  {
    path: "/auth/finish-onboarding",
    element: <OAuthOnboarding />
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <DefaultRedirect />
      </PrivateRoute>
    )
  },
  {
    path: "/home/dashboard",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
    loader: dashboardLoader
  },
  {
    path: "/home/:view",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    )
  },
  {
    path: "/dashboard",
    element: <Navigate to="/home/dashboard" replace />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <UserPreferencesProvider>
          <AuthProvider>
            <Theme>
              <RouterProvider router={router} />
            </Theme>
          </AuthProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
