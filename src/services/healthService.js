const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Health check with configurable timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if server is healthy, false otherwise
 */
const checkHealth = async (timeout = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Handle timeout or network errors
    if (error.name === 'AbortError') {
      console.log(`Health check timed out after ${timeout}ms`);
    } else {
      console.log('Health check failed:', error.message);
    }
    return false;
  }
};

/**
 * Progressive health check with increasing timeouts
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<boolean>} - True if server becomes healthy, false if all attempts fail
 */
export const progressiveHealthCheck = async (onProgress) => {
  const attempts = [
    { timeout: 5000, message: 'Checking server status...', step: 1, total: 4 },
    { timeout: 15000, message: 'Server warming up, please wait...', step: 2, total: 4 },
    { timeout: 30000, message: 'Almost ready, hang tight...', step: 3, total: 4 },
    { timeout: 60000, message: 'Final check, almost there...', step: 4, total: 4 }
  ];

  for (const attempt of attempts) {
    // Notify progress
    onProgress?.(attempt.message, attempt.step, attempt.total);

    console.log(`Health check attempt ${attempt.step}/${attempt.total}: ${attempt.message}`);

    const isHealthy = await checkHealth(attempt.timeout);

    if (isHealthy) {
      console.log(`Server is healthy after ${attempt.timeout}ms timeout`);
      onProgress?.('Server is ready!', attempt.step, attempt.total, true);
      return true;
    }

    console.log(`Health check failed with ${attempt.timeout}ms timeout`);
  }

  console.log('All health check attempts failed');
  onProgress?.('Server failed to respond. Please try again later.', 4, 4, false);
  return false;
};

/**
 * Simple health check for testing
 * @returns {Promise<boolean>}
 */
export const simpleHealthCheck = async () => {
  return await checkHealth(5000);
};