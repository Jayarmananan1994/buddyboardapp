import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UmamiAnalytics from '@danielgtmn/umami-react';
import Layout from './components/Layout';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import SignInPage from './pages/SignInPage';
import ResetPinPage from './pages/ResetPinPage';
import MyTripsPage from './pages/MyTripsPage';
import { isAuthenticated } from './services/authService';
import { TripsProvider } from './contexts/TripsContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const userIsAuthenticated = isAuthenticated();
  return userIsAuthenticated ? children : <Navigate to="/signin" replace />;
}

// Auth Route Component (redirect to trips if already authenticated)
function AuthRoute({ children }) {
  const userIsAuthenticated = isAuthenticated();
  return userIsAuthenticated ? <Navigate to="/trips" replace /> : children;
}

function AppContent() {
  return (
    <Routes>
      {/* Auth Routes - no layout */}
      <Route
        path="/signin"
        element={
          <AuthRoute>
            <SignInPage />
          </AuthRoute>
        }
      />
      <Route
        path="/reset-pin"
        element={<ResetPinPage />}
      />

      {/* Public Routes - with layout */}
      <Route
        path="/"
        element={<Navigate to="/trips" replace />}
      />
      <Route
        path="/trips"
        element={
          <Layout>
            <TripsPage />
          </Layout>
        }
      />
      <Route
        path="/create-trip"
        element={
          <Layout>
            <CreateTripPage />
          </Layout>
        }
      />
      <Route
        path="/trip/:id"
        element={
          <Layout>
            <TripDetailPage />
          </Layout>
        }
      />

      {/* Protected Routes - with layout */}
      <Route
        path="/my-trips"
        element={
          <ProtectedRoute>
            <Layout>
              <MyTripsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect to trips */}
      <Route
        path="*"
        element={<Navigate to="/trips" replace />}
      />
    </Routes>
  );
}

function App() {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const umamiSrc = import.meta.env.VITE_UMAMI_SRC;

  return (
    <TripsProvider>
      <Router>
        {/* Umami Analytics - Only load if website ID is configured */}
        {websiteId && websiteId !== 'your-website-id-here' && (
          <UmamiAnalytics
            websiteId={websiteId}
            url={umamiSrc || 'https://cloud.umami.is'}
          />
        )}
        <AppContent />
      </Router>
    </TripsProvider>
  );
}

export default App