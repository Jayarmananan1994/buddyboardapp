import { useState, useEffect, useCallback } from 'react';
import FilterBar from '../components/FilterBar';
import TripGrid from '../components/TripGrid';
import FloatingFeedbackButton from '../components/FloatingFeedbackButton';
import { getTripsWithColdStart } from '../services/tripService';
import { mockTrips } from '../data/mockTrips';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [progressMessage, setProgressMessage] = useState('');
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Load trips with filters
  const loadTrips = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    setProgressMessage('');

    try {
      // Use cold start wrapper
      await getTripsWithColdStart(
        // Progress callback
        (message) => {
          setProgressMessage(message);
        },
        // Success callback
        (response) => {
          // Handle the API response structure
          if (response && response.success) {
            setTrips(response.trips || []);
            setPagination(response.pagination || null);
            setAppliedFilters(response.filters || {});
          } else {
            // If response doesn't have success flag, try to handle as direct array
            const tripsData = response.trips || response || [];
            setTrips(tripsData);
          }
        },
        // Error callback
        (errorMessage) => {
          setError(errorMessage);
          showError(errorMessage);
          // Fallback to mock data on error
          setTrips(mockTrips);
        },
        // Skip health check (false for first call)
        false,
        // API function arguments
        filters
      );
    } catch (err) {
      console.error('Error loading trips:', err);
      setError('Failed to load trips');
      showError('Failed to load trips');
      // Fallback to mock data on error
      setTrips(mockTrips);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  // Load trips on component mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Handle filter changes (memoized to prevent unnecessary re-renders)
  const handleFiltersChange = useCallback((filters) => {
    loadTrips(filters);
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">View Trips</h1>
        <p className="mt-1 text-slate-500">Find your next travel buddy by browsing through trips.</p>
      </div>

      {/* Filter Bar */}
      <FilterBar onFiltersChange={handleFiltersChange} />

      {/* Results Summary */}
      {pagination && !isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            Showing {trips.length} of {pagination.total} trips
            {appliedFilters.destination && (
              <span className="ml-2 px-2 py-1 bg-blue-100 rounded-full text-xs">
                Filtered by destination
              </span>
            )}
            {appliedFilters.genderPreference && (
              <span className="ml-2 px-2 py-1 bg-blue-100 rounded-full text-xs">
                Gender: {appliedFilters.genderPreference}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Progress Message */}
      {progressMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 text-center">{progressMessage}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-slate-600">
            {progressMessage || 'Loading trips...'}
          </span>
        </div>
      )}

      {/* Trip Grid */}
      {!isLoading && <TripGrid trips={trips} />}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton />
    </>
  );
}

export default TripsPage;