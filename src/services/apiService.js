import { progressiveHealthCheck } from './healthService';

/**
 * Wrapper for API calls that handles cold starts with progressive health checks
 * @param {Function} apiCall - The actual API function to call
 * @param {Function} onProgress - Progress callback for UI updates
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise} - Result of the API call
 */
export const withColdStartHandling = async (apiCall, onProgress, operationName = 'API call') => {
  try {
    console.log(`Starting ${operationName} with cold start handling`);

    // First, perform progressive health check
    const isServerReady = await progressiveHealthCheck(onProgress);

    if (!isServerReady) {
      throw new Error('Server is not responding. Please try again later.');
    }

    // Server is ready, now make the actual API call
    console.log(`Server is ready, executing ${operationName}`);
    onProgress?.('Executing request...', 4, 4, true);

    const result = await apiCall();
    console.log(`${operationName} completed successfully`);

    return result;
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    throw error;
  }
};

/**
 * Enhanced API call wrapper with error handling and user feedback
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Configuration options
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.operationName - Operation name for logging
 * @param {boolean} options.skipHealthCheck - Skip health check (for already warm server)
 * @returns {Promise} - Result of the API call
 */
export const makeApiCall = async (apiCall, options = {}) => {
  const {
    onProgress,
    onSuccess,
    onError,
    operationName = 'API request',
    skipHealthCheck = false
  } = options;

  try {
    let result;

    if (skipHealthCheck) {
      // Skip health check and make direct API call
      console.log(`Making direct ${operationName} (skipping health check)`);
      result = await apiCall();
    } else {
      // Use cold start handling
      result = await withColdStartHandling(apiCall, onProgress, operationName);
    }

    onSuccess?.(result);
    return result;
  } catch (error) {
    console.error(`${operationName} failed:`, error);

    // Handle specific error types
    let errorMessage = `Failed to ${operationName.toLowerCase()}. Please try again.`;

    if (error.message.includes('Server is not responding')) {
      errorMessage = 'Server is currently unavailable. Please try again in a few minutes.';
    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.status) {
      // API error with status code
      errorMessage = error.message || `Request failed with status ${error.status}`;
    }

    onError?.(errorMessage);
    throw error;
  }
};

/**
 * Create a wrapped version of an API function that automatically handles cold starts
 * @param {Function} originalApiFunction - The original API function
 * @param {string} operationName - Name for logging and user feedback
 * @returns {Function} - Wrapped API function
 */
export const createColdStartWrapper = (originalApiFunction, operationName) => {
  return async (onProgress, onSuccess, onError, skipHealthCheck = false, ...args) => {
    const apiCall = () => originalApiFunction(...args);

    return await makeApiCall(apiCall, {
      onProgress,
      onSuccess,
      onError,
      operationName,
      skipHealthCheck
    });
  };
};