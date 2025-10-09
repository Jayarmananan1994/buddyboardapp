import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTripsWithColdStart, deleteTripWithColdStart } from '../services/tripService';
import { isAuthenticated } from '../services/authService';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SignInPrompt from '../components/SignInPrompt';
import { useTrips } from '../contexts/TripsContext';

function MyTripsPage() {
  const navigate = useNavigate();
  const userIsAuthenticated = isAuthenticated();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { myTrips, setMyTrips, hasFetchedMyTrips, setHasFetchedMyTrips, refreshTrips } = useTrips();
  const [loading, setLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, tripId: null, tripDestination: '' });

  useEffect(() => {
    // Only fetch if authenticated and haven't fetched yet
    if (userIsAuthenticated && !hasFetchedMyTrips) {
      fetchMyTrips();
    } else {
      // If not authenticated OR already fetched, stop loading
      setLoading(false);
    }
  }, [userIsAuthenticated]);

  const fetchMyTrips = async () => {
    try {
      setLoading(true);
      setProgressMessage('');

      await getMyTripsWithColdStart(
        // Progress callback
        (message) => {
          setProgressMessage(message);
        },
        // Success callback
        (data) => {
          if (data.success) {
            setMyTrips(data.trips || []);
            setHasFetchedMyTrips(true);
          }
        },
        // Error callback
        (errorMessage) => {
          showError(errorMessage);
        },
        // Skip health check (false for first call)
        false,
        // API function arguments
        20,
        0
      );
    } catch (error) {
      console.error('Error fetching my trips:', error);

      let errorMessage = 'Failed to load your trips. Please try again.';
      if (error.status === 401) {
        errorMessage = 'Please sign in to view your trips.';
        navigate('/signin');
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
      setProgressMessage('');
    }
  };

  const handleEditTrip = (tripId) => {
    // Navigate to trip detail page for now (edit functionality to be implemented)
    navigate(`/trip/${tripId}`, { state: { fromMyTrips: true } });
  };

  const handleDeleteTrip = (tripId, tripDestination) => {
    setConfirmDialog({
      isOpen: true,
      tripId,
      tripDestination
    });
  };

  const confirmDeleteTrip = async () => {
    const { tripId } = confirmDialog;

    // Close dialog first
    setConfirmDialog({ isOpen: false, tripId: null, tripDestination: '' });

    try {
      await deleteTripWithColdStart(
        // Progress callback
        () => {
          // Could show progress in UI if needed
        },
        // Success callback
        (data) => {
          if (data.success) {
            showSuccess('Trip deleted successfully!');
            // Remove from local state
            setMyTrips(prev => prev.filter(trip => trip.id !== tripId));
            // Refresh trips page data since a trip was deleted
            refreshTrips();
          }
        },
        // Error callback
        (errorMessage) => {
          showError(errorMessage);
        },
        // Skip health check
        false,
        // API function arguments
        tripId
      );
    } catch (error) {
      console.error('Error deleting trip:', error);

      let errorMessage = 'Failed to delete trip. Please try again.';
      if (error.status === 401) {
        errorMessage = 'Please sign in to delete your trip.';
        navigate('/signin');
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const cancelDeleteTrip = () => {
    setConfirmDialog({ isOpen: false, tripId: null, tripDestination: '' });
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return 'Date TBD';
    }

    const startDate = new Date(dateRange.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endDate = new Date(dateRange.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `${startDate} - ${endDate}`;
  };

  const getDestinationName = (trip) => {
    if (trip.destination?.name) {
      return trip.destination.country
        ? `${trip.destination.name}, ${trip.destination.country.name}`
        : trip.destination.name;
    }
    return trip.destination || 'Unknown Destination';
  };

  const getTripImage = (trip) => {
    // Use destination image if available, otherwise fallback
    if (trip.destination?.image) {
      return trip.destination.image;
    }

    // Fallback images based on destination
    const destination = getDestinationName(trip).toLowerCase();
    if (destination.includes('paris')) {
      return 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop';
    } else if (destination.includes('tokyo')) {
      return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop';
    } else if (destination.includes('rome')) {
      return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop';
    }

    // Default travel image
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <h2 className="px-4 text-3xl font-bold text-slate-900">My Trips</h2>
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">
                {progressMessage || 'Loading your trips...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt
  if (!userIsAuthenticated) {
    return (
      <>
        <SignInPrompt
          icon="luggage"
          title="🧳 You haven't signed in yet"
          message="Sign in to view or manage your trips easily."
          subtitle="Trips posted anonymously can't be edited or deleted."
        />
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </>
    );
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <h2 className="px-4 text-3xl font-bold text-slate-900">My Trips</h2>

        {myTrips.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-400">travel_explore</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips yet</h3>
            <p className="text-slate-600 mb-6">
              You haven't created any trips yet. Start planning your next adventure!
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {myTrips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex flex-col-reverse items-start gap-6 sm:flex-row">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {getDestinationName(trip)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDateRange(trip.dateRange)}
                    </p>
                    {trip.tripDetail && (
                      <p className="mt-4 text-sm leading-relaxed text-slate-700">
                        {trip.tripDetail}
                      </p>
                    )}

                    {/* Trip Details */}
                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      {trip.from && (
                        <p>
                          <span className="font-medium text-slate-800">Starting From:</span> {trip.from}
                        </p>
                      )}
                      {trip.genderPreference && (
                        <p>
                          <span className="font-medium text-slate-800">Gender Preference:</span> {trip.genderPreference}
                        </p>
                      )}
                      {trip.isDateFlexible && (
                        <p className="text-primary font-medium">📅 Flexible Dates</p>
                      )}
                      {trip.interestedCount !== undefined && (
                        <p>
                          <span className="font-medium text-slate-800">Interested Users:</span> {trip.interestedCount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trip Image */}
                  <div
                    className="aspect-[4/3] w-full rounded-lg bg-cover bg-center sm:w-56"
                    style={{ backgroundImage: `url("${getTripImage(trip)}")` }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-4 border-t border-slate-200 pt-4">
                  <button
                    onClick={() => handleEditTrip(trip.id)}
                    className="flex h-10 items-center justify-center gap-2 rounded bg-primary px-4 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-80"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id, getDestinationName(trip))}
                    className="flex h-10 items-center justify-center gap-2 rounded bg-slate-100 px-4 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelDeleteTrip}
        onConfirm={confirmDeleteTrip}
        title="Delete Trip"
        message={`Are you sure you want to delete your trip to ${confirmDialog.tripDestination}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default MyTripsPage;