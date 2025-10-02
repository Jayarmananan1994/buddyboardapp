import { createSimpleApiWrapper, createApiWrapper } from './apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const signUp = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Return error response with status for better error handling
      throw {
        status: response.status,
        message: result.message || result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

export const signIn = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      // Return error response with status for better error handling
      throw {
        status: response.status,
        message: result.message || result.error || `HTTP error! status: ${response.status}`,
        details: result
      };
    }

    return result;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

// Token management functions
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const removeToken = () => {
  localStorage.removeItem('authToken');
};

export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const logout = () => {
  removeToken();
  removeUser();
};

export const isAuthenticated = () => {
  return !!getToken();
};

// Wrapped versions with server warm-up support
export const signUpWithWarmup = createSimpleApiWrapper(signUp, {
  operationName: 'sign up'
});

export const signInWithWarmup = createSimpleApiWrapper(signIn, {
  operationName: 'sign in'
});

// Callback-style wrappers for UI components that need progress feedback
export const signUpWithProgress = createApiWrapper(signUp, 'sign up');
export const signInWithProgress = createApiWrapper(signIn, 'sign in');