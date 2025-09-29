import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';

function AppContent() {
  const location = useLocation();
  const isTripsPage = location.pathname === '/' || location.pathname === '/trips';
  const isCreateTripPage = location.pathname === '/create-trip';
  const isTripDetailPage = location.pathname.startsWith('/trip/');

  return (
    <Layout showCreateTripButton={isTripsPage}>
      <Routes>
        <Route path="/" element={<TripsPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
      </Routes>
    </Layout>
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