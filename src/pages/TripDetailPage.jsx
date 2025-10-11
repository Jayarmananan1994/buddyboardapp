import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getTripByIdWithColdStart, getMyTripByIdWithColdStart } from '../services/tripService';
import { handleContactClick } from '../utils/contactUtils';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import ShowInterestModal from '../components/ShowInterestModal';
import FloatingFeedbackButton from '../components/FloatingFeedbackButton';

function TripDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [isShowInterestModalOpen, setIsShowInterestModalOpen] = useState(false);
  const [isOwnerView, setIsOwnerView] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const loadTrip = async (showLoading = true) => {
    if (!id) {
      setError('Trip ID not provided');
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    setProgressMessage('');

    // Determine if this is an owner view based on navigation source
    const fromMyTrips = location.state?.fromMyTrips ||
                       document.referrer.includes('/my-trips') ||
                       sessionStorage.getItem(`trip-${id}-owner`) === 'true';

    setIsOwnerView(fromMyTrips);

    try {
      // Use appropriate API based on context
      const apiCall = fromMyTrips ? getMyTripByIdWithColdStart : getTripByIdWithColdStart;

      await apiCall(
        // Progress callback
        (message) => {
          if (showLoading) {
            setProgressMessage(message);
          }
        },
        // Success callback
        (response) => {
          if (response && response.success && response.trip) {
            setTrip(response.trip);
            // Store owner context in session for future reference
            if (fromMyTrips) {
              sessionStorage.setItem(`trip-${id}-owner`, 'true');
            }
          } else {
            setError('Trip not found');
          }
        },
        // Error callback
        (errorMessage) => {
          setError(errorMessage || 'Failed to load trip details');
        },
        // Skip health check (false for first call)
        false,
        // API function arguments
        id
      );
    } catch (err) {
      console.error('Error loading trip:', err);
      setError('Failed to load trip details');
    } finally {
      if (showLoading) {
        setIsLoading(false);
        setProgressMessage('');
      }
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const handleShowInterest = () => {
    setIsShowInterestModalOpen(true);
  };

  const handleInterestSuccess = async (message) => {
    // Show success message
    showSuccess(message);
    // Close the modal
    setIsShowInterestModalOpen(false);
    // Refresh trip data to show updated interested users (without loading state)
    await loadTrip(false);
  };

  if (isLoading) {
    return (
      <>
        {/* Loading State */}
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-slate-600">
            {progressMessage || 'Loading trip details...'}
          </span>
        </div>
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Error State */}
        <div className="flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">error</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-2">Trip Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Trips</span>
          </Link>
        </div>
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </>
    );
  }

  if (!trip) {
    return null;
  }

  // Format date range for display
  const formatDateRange = () => {
    if (trip.dateRange) {
      const startDate = new Date(trip.dateRange.startDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const endDate = new Date(trip.dateRange.endDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      return `${startDate} - ${endDate}`;
    }
    return trip.dates || 'Date TBD';
  };

  // Get destination name
  const getDestinationName = () => {
    if (trip.destination && trip.destination.name) {
      if (trip.destination.country) {
        return `${trip.destination.name}, ${trip.destination.country.name}`;
      }
      return trip.destination.name;
    }
    return trip.destination || 'Unknown Destination';
  };

  // Get contact method display
  const getContactMethod = () => {
    if (trip.contactDetail && trip.contactDetail.medium) {
      return trip.contactDetail.medium;
    }
    return trip.contact?.type || 'Not specified';
  };

  // Render contact icon for interested users
  const renderContactIcon = (contactDetail) => {
    if (!contactDetail || !contactDetail.medium) return null;

    const { medium, handle } = contactDetail;

    const handleUserContactClick = async () => {
      await handleContactClick(
        medium,
        handle,
        (message) => showSuccess(message),
        (message) => showError(message)
      );
    };

    const getIconForMedium = (medium) => {
      switch (medium.toLowerCase()) {
        case 'whatsapp':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          );
        case 'telegram':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          );
        case 'instagram':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          );
        case 'email':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          );
        case 'phone':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          );
        default:
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          );
      }
    };

    return (
      <button
        onClick={handleUserContactClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
        title={`Contact via ${medium}`}
      >
        {getIconForMedium(medium)}
      </button>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          <Link
            to={isOwnerView ? "/my-trips" : "/trips"}
            className="hover:text-primary transition-colors"
          >
            {isOwnerView ? "My Trips" : "Explore"}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Trip to {getDestinationName()}</span>
        </p>
      </div>

      {/* Trip Detail Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        {/* Hero Image */}
        {trip.imageUrl ? (
          <div
            className="relative h-64 md:h-80 w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${trip.imageUrl}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                Trip to {getDestinationName()}
              </h1>
              <p className="text-slate-100 text-sm md:text-base">
                {formatDateRange()}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary/30">travel_explore</span>
          </div>
        )}

        {/* Header */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              {!trip.imageUrl && (
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Trip to {getDestinationName()}
                </h1>
              )}
              <p className="mt-2 text-slate-600">
                {trip.tripDetail || trip.description || 'Join me on an amazing travel adventure!'}
              </p>
            </div>
            {trip.canShowInterest !== false && !isOwnerView && (
              <button
                onClick={handleShowInterest}
                className="flex-shrink-0 w-full md:w-auto bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                I'm Interested
              </button>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="border-t border-slate-200 px-6 md:px-8 py-6">
          <h3 className="text-lg font-bold mb-4 text-slate-900">Trip Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Destination</span>
              <span className="font-medium text-slate-900">{getDestinationName()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Dates</span>
              <span className="font-medium text-slate-900">{formatDateRange()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Starting From</span>
              <span className="font-medium text-slate-900">{trip.from || trip.startingFrom || 'Not specified'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Gender Preference</span>
              <span className="font-medium text-slate-900">{trip.genderPref || trip.genderPreference || 'Any'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Contact Via</span>
              <span className="font-medium text-slate-900 capitalize">{getContactMethod()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 mb-1">Date Flexible</span>
              <span className="font-medium text-slate-900">{trip.isDateFlexible ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* About the Trip */}
        {(trip.tripDetail || trip.description) && (
          <div className="border-t border-slate-200 px-6 md:px-8 py-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900">About the Trip</h3>
            <p className="text-slate-600 leading-relaxed">{trip.tripDetail || trip.description}</p>
          </div>
        )}

        {/* Interested Users */}
        {trip.interestedUsers && trip.interestedUsers.length > 0 && (
          <div className="border-t border-slate-200">
            <h3 className="text-lg font-bold px-6 md:px-8 py-4 text-slate-900">
              People Interested ({trip.interestedCount || trip.interestedUsers.length})
            </h3>
            <ul className="divide-y divide-slate-200">
              {trip.interestedUsers.map((user, index) => (
                <li key={user.id || index} className="p-4 hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {user.name || user.contactInfo?.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-slate-500">
                        Interested in traveling with you
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(isOwnerView || trip.isOwner) && user.contactDetail && renderContactIcon(user.contactDetail)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Show Interest Modal */}
      <ShowInterestModal
        isOpen={isShowInterestModalOpen}
        onClose={() => setIsShowInterestModalOpen(false)}
        trip={trip}
        onSuccess={handleInterestSuccess}
        onError={showError}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

     
    </>
  );
}

export default TripDetailPage;