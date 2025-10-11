import { createColdStartWrapper } from './apiUtils';
import { getToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const createTrip = async (tripData) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    // Only include Authorization header if user is signed in
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/trips`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const updateTrip = async (tripId, tripData) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    // Authorization header is required for update
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      throw new Error('Authentication required to update trip');
    }

    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please sign in to update this trip');
      }
      if (response.status === 403) {
        throw new Error('Forbidden: You do not have permission to update this trip');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const searchDestinations = async (query, includeCountries) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/destinations/search?q=${encodeURIComponent(query)}&includeCountries=${includeCountries}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error searching destinations:', error);
    throw error;
  }
};

export const getTrips = async (filters = {}) => {
  try {
    const searchParams = new URLSearchParams();

    // Add filters to search params
    if (filters.destination) {
      searchParams.append('destination', filters.destination);
    }
    if (filters.genderPreference) {
      searchParams.append('genderPreference', filters.genderPreference);
    }
    if (filters.startDate) {
      searchParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      searchParams.append('endDate', filters.endDate);
    }

    const url = `${API_BASE_URL}/api/trips${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const showInterest = async (tripId, interestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interestData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Return error response with status for better error handling
      throw {
        status: response.status,
        message: result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error showing interest:', error);
    throw error;
  }
};

export const getTripById = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching trip by ID:', error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getMyTrips = async (limit = 20, offset = 0) => {
  try {
    const token = getToken();
    const searchParams = new URLSearchParams();
    searchParams.append('limit', limit.toString());
    searchParams.append('offset', offset.toString());

    const response = await fetch(`${API_BASE_URL}/api/trips/my-trips?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching my trips:', error);
    throw error;
  }
};

export const getMyTripById = async (tripId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/trips/my-trips/${tripId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching my trip by ID:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Wrapped versions with cold start handling for UI components
export const createTripWithColdStart = createColdStartWrapper(createTrip, 'create trip');
export const updateTripWithColdStart = createColdStartWrapper(updateTrip, 'update trip');
export const getTripsWithColdStart = createColdStartWrapper(getTrips, 'fetch trips');
export const getTripByIdWithColdStart = createColdStartWrapper(getTripById, 'fetch trip details');
export const searchDestinationsWithColdStart = createColdStartWrapper(searchDestinations, 'search destinations');
export const showInterestWithColdStart = createColdStartWrapper(showInterest, 'show interest');
export const submitFeedbackWithColdStart = createColdStartWrapper(submitFeedback, 'submit feedback');
export const getMyTripsWithColdStart = createColdStartWrapper(getMyTrips, 'fetch my trips');
export const getMyTripByIdWithColdStart = createColdStartWrapper(getMyTripById, 'fetch my trip details');
export const deleteTripWithColdStart = createColdStartWrapper(deleteTrip, 'delete trip');