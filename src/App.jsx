import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import SignInPage from './pages/SignInPage';
import MyTripsPage from './pages/MyTripsPage';
import { isAuthenticated } from './services/authService';

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
  const location = useLocation();
  const isTripsPage = location.pathname === '/' || location.pathname === '/trips';
  const isCreateTripPage = location.pathname === '/create-trip';
  const isTripDetailPage = location.pathname.startsWith('/trip/');
  const isSignInPage = location.pathname === '/signin';

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

      {/* Protected Routes - with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/trips" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <Layout>
              <TripsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateTripPage />
            </Layout>
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/trip/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TripDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect to signin for unauthenticated, trips for authenticated */}
      <Route
        path="*"
        element={
          isAuthenticated() ? <Navigate to="/trips" replace /> : <Navigate to="/signin" replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App