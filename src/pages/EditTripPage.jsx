import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { getMyTripByIdWithColdStart } from '../services/tripService';

function EditTripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Trip ID not provided');
      setIsLoading(false);
      return;
    }

    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    setIsLoading(true);
    setError(null);
    setProgressMessage('');

    try {
      await getMyTripByIdWithColdStart(
        // Progress callback
        (message) => {
          setProgressMessage(message);
        },
        // Success callback
        (response) => {
          if (response && response.success && response.trip) {
            setTrip(response.trip);
          } else {
            setError('Trip not found');
          }
        },
        // Error callback
        (errorMessage) => {
          setError(errorMessage || 'Failed to load trip details');
        },
        // Skip health check
        false,
        // API function arguments
        id
      );
    } catch (err) {
      console.error('Error loading trip:', err);
      setError('Failed to load trip details. Please try again.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">{progressMessage || 'Loading trip details...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <p className="text-red-600">{error}</p>
        </div>
        <Link
          to="/my-trips"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to My Trips
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-slate-600 mb-4">Trip not found</p>
        <Link
          to="/my-trips"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to My Trips
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            to="/my-trips"
            className="text-slate-600 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Trip</h1>
        </div>
        <p className="mt-1 text-slate-500">Update your travel plans and trip details.</p>
      </div>

      {/* Trip Form with pre-populated data */}
      <TripForm tripData={trip} tripId={id} />
    </>
  );
}

export default EditTripPage;
