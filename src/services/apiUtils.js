import { progressiveHealthCheck } from './healthService';

// Environment-based configuration
const ENABLE_SERVER_WARMUP = import.meta.env.VITE_ENABLE_SERVER_WARMUP === 'true';
const WARMUP_TIMEOUT_MS = parseInt(import.meta.env.VITE_WARMUP_TIMEOUT_MS) || 30000;

/**
 * Universal API call wrapper with optional server warm-up
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {Function} options.onProgress - Progress callback for UI updates
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.operationName - Operation name for logging
 * @param {boolean} options.skipWarmup - Skip warm-up even if enabled globally
 * @param {boolean} options.forceWarmup - Force warm-up even if disabled globally
 * @param {Array} options.args - Arguments to pass to the API function
 * @returns {Promise} - Result of the API call
 */
export const apiCall = async (apiFunction, options = {}) => {
  const {
    onProgress,
    onSuccess,
    onError,
    operationName = 'API request',
    skipWarmup = false,
    forceWarmup = false,
    args = []
  } = options;

  try {
    let result;

    // Determine if we should perform warm-up
    const shouldWarmup = forceWarmup || (ENABLE_SERVER_WARMUP && !skipWarmup);

    if (shouldWarmup) {
      console.log(`Starting ${operationName} with server warm-up`);

      // Perform progressive health check
      const isServerReady = await progressiveHealthCheck(onProgress);

      if (!isServerReady) {
        throw new Error('Server is not responding. Please try again later.');
      }

      console.log(`Server is ready, executing ${operationName}`);
      onProgress?.('Executing request...', 4, 4, true);
    } else {
      console.log(`Making direct ${operationName} (server warm-up disabled)`);
    }

    // Execute the API function
    result = await apiFunction(...args);
    console.log(`${operationName} completed successfully`);

    // Call success callback if provided
    onSuccess?.(result);
    return result;

  } catch (error) {
    console.error(`${operationName} failed:`, error);

    // Enhanced error handling
    let errorMessage = `Failed to ${operationName.toLowerCase()}. Please try again.`;

    if (error.message?.includes('Server is not responding')) {
      errorMessage = 'Server is currently unavailable. Please try again in a few minutes.';
    } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.status) {
      // API error with status code
      errorMessage = error.message || `Request failed with status ${error.status}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Call error callback if provided
    onError?.(errorMessage);
    throw error;
  }
};

/**
 * Create a wrapped version of an API function with automatic server warm-up
 * This function maintains backward compatibility with the existing cold start wrapper pattern
 * @param {Function} originalApiFunction - The original API function
 * @param {string} operationName - Name for logging and user feedback
 * @returns {Function} - Wrapped API function with signature (onProgress, onSuccess, onError, skipWarmup, ...args)
 */
export const createApiWrapper = (originalApiFunction, operationName) => {
  return async (onProgress, onSuccess, onError, skipWarmup = false, ...args) => {
    return await apiCall(originalApiFunction, {
      onProgress,
      onSuccess,
      onError,
      operationName,
      skipWarmup,
      args
    });
  };
};

/**
 * Simple API wrapper for direct calls without callback pattern
 * Useful for authentication and other simple API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {string} options.operationName - Operation name for logging
 * @param {boolean} options.skipWarmup - Skip warm-up for this call
 * @param {boolean} options.forceWarmup - Force warm-up for this call
 * @returns {Function} - Wrapped API function
 */
export const createSimpleApiWrapper = (apiFunction, options = {}) => {
  const { operationName = 'API request', skipWarmup = false, forceWarmup = false } = options;

  return async (...args) => {
    return await apiCall(apiFunction, {
      operationName,
      skipWarmup,
      forceWarmup,
      args
    });
  };
};

/**
 * Configuration utility to check if server warm-up is enabled
 * @returns {boolean} - Whether server warm-up is enabled
 */
export const isServerWarmupEnabled = () => ENABLE_SERVER_WARMUP;

/**
 * Configuration utility to get warm-up timeout
 * @returns {number} - Warm-up timeout in milliseconds
 */
export const getWarmupTimeout = () => WARMUP_TIMEOUT_MS;

/**
 * Backward compatibility: Export the original cold start wrapper
 * This maintains compatibility with existing code while providing the new functionality
 */
export const createColdStartWrapper = createApiWrapper;