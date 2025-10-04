import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPinWithWarmup, isAuthenticated, getUser } from '../services/authService';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function ResetPinPage() {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuth = isAuthenticated();
  const currentUser = getUser();

  const [formData, setFormData] = useState({
    username: isAuth ? currentUser?.username || '' : '',
    oldPin: '',
    newPin: '',
    confirmNewPin: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For PIN fields, ensure only digits and max 6 characters
    if (name === 'oldPin' || name === 'newPin' || name === 'confirmNewPin') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username (only if not authenticated)
    if (!isAuth) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3 || formData.username.length > 20) {
        newErrors.username = 'Username must be 3-20 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }

    // Validate old PIN (only if authenticated)
    if (isAuth) {
      if (!formData.oldPin) {
        newErrors.oldPin = 'Current PIN is required';
      } else if (formData.oldPin.length < 4 || formData.oldPin.length > 6) {
        newErrors.oldPin = 'PIN must be 4-6 digits';
      }
    }

    // Validate new PIN
    if (!formData.newPin) {
      newErrors.newPin = 'New PIN is required';
    } else if (formData.newPin.length < 4 || formData.newPin.length > 6) {
      newErrors.newPin = 'PIN must be 4-6 digits';
    }

    // Validate confirm PIN
    if (!formData.confirmNewPin) {
      newErrors.confirmNewPin = 'Please confirm your new PIN';
    } else if (formData.newPin !== formData.confirmNewPin) {
      newErrors.confirmNewPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let requestBody;

      // If authenticated, send oldPin and newPin with Bearer token
      if (isAuth) {
        requestBody = {
          oldPin: formData.oldPin,
          newPin: formData.newPin
        };
      } else {
        // If not authenticated, send username, oldPin (as verification), and newPin
        requestBody = {
          username: formData.username.trim(),
          oldPin: formData.oldPin,
          newPin: formData.newPin
        };
      }

      const response = await resetPinWithWarmup(requestBody);

      if (response.success) {
        showSuccess(response.message || 'PIN reset successfully!');

        // Navigate based on authentication status
        setTimeout(() => {
          if (isAuth) {
            navigate('/trips');
          } else {
            navigate('/signin');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Reset PIN error:', error);

      // Handle specific error cases
      let errorMessage = 'Something went wrong. Please try again.';

      if (error.status === 404) {
        errorMessage = 'Username not found.';
      } else if (error.status === 401) {
        errorMessage = 'Current PIN is incorrect.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Please check your information and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">BuddyBoard</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header Text */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Reset Your PIN
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAuth
                ? 'Enter your current PIN and create a new one'
                : 'Enter your username, current PIN, and create a new one'}
            </p>
          </div>

          {/* Reset PIN Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <form onSubmit={handleResetPin} className="space-y-4">
              {/* Username Field - Only show if not authenticated */}
              {!isAuth && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="username"
                    className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your username"
                    disabled={isSubmitting}
                    required
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Current PIN Field */}
              <div>
                <label htmlFor="oldPin" className="block text-sm font-medium text-gray-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  id="oldPin"
                  name="oldPin"
                  value={formData.oldPin}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  inputMode="numeric"
                  maxLength="6"
                  pattern="\d{4,6}"
                  className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                    errors.oldPin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your current PIN"
                  disabled={isSubmitting}
                  required
                />
                {errors.oldPin && (
                  <p className="mt-1 text-sm text-red-600">{errors.oldPin}</p>
                )}
              </div>

              {/* New PIN Field */}
              <div>
                <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
                  New PIN (4-6 digits)
                </label>
                <input
                  type="password"
                  id="newPin"
                  name="newPin"
                  value={formData.newPin}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  inputMode="numeric"
                  maxLength="6"
                  pattern="\d{4,6}"
                  className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                    errors.newPin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create your new 4-6 digit PIN"
                  disabled={isSubmitting}
                  required
                />
                {errors.newPin && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPin}</p>
                )}
              </div>

              {/* Confirm New PIN Field */}
              <div>
                <label htmlFor="confirmNewPin" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  id="confirmNewPin"
                  name="confirmNewPin"
                  value={formData.confirmNewPin}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  inputMode="numeric"
                  maxLength="6"
                  pattern="\d{4,6}"
                  className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                    errors.confirmNewPin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new PIN"
                  disabled={isSubmitting}
                  required
                />
                {errors.confirmNewPin && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmNewPin}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Resetting PIN...' : 'Reset PIN'}
                </button>
                <Link
                  to={isAuth ? "/trips" : "/signin"}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out"
                >
                  {isAuth ? 'Cancel' : 'Back to Sign In'}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default ResetPinPage;
