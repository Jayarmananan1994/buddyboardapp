import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithWarmup, signUpWithWarmup, saveToken, saveUser } from '../services/authService';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function SignInPage() {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    confirmPin: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For PIN fields, ensure only digits and max 6 characters
    if (name === 'pin' || name === 'confirmPin') {
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

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be 3-20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Validate PIN
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (formData.pin.length < 4 || formData.pin.length > 6) {
      newErrors.pin = 'PIN must be 4-6 digits';
    }

    // Validate confirm PIN in sign up mode
    if (isSignUpMode) {
      if (!formData.confirmPin) {
        newErrors.confirmPin = 'Please confirm your PIN';
      } else if (formData.pin !== formData.confirmPin) {
        newErrors.confirmPin = 'PINs do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUpMode) {
        // Sign up
        const response = await signUpWithWarmup({
          username: formData.username.trim(),
          pin: formData.pin
        });

        if (response.success) {
          // Save token and user data
          saveToken(response.token);
          saveUser(response.user);

          showSuccess(response.message || 'Account created successfully!');

          // Navigate to main app after successful signup
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } else {
        // Sign in
        const response = await signInWithWarmup({
          username: formData.username.trim(),
          pin: formData.pin
        });

        if (response.success) {
          // Save token and user data
          saveToken(response.token);
          saveUser(response.user);

          showSuccess(response.message || 'Sign in successful!');

          // Navigate to main app after successful signin
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // Handle specific error cases
      let errorMessage = 'Something went wrong. Please try again.';

      if (error.status === 400) {
        errorMessage = error.message || 'Please check your information and try again.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid username or PIN.';
      } else if (error.status === 409) {
        errorMessage = 'Username already exists. Please choose a different username.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    setIsSignUpMode(true);
  };

  const handleBackToSignIn = () => {
    setIsSignUpMode(false);
    setFormData(prev => ({ ...prev, confirmPin: '' }));
    setErrors({});
  };

  const handleContinueWithoutSignIn = () => {
    navigate('/trips');
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
              {isSignUpMode ? 'Create your account' : 'Find your next travel buddy'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUpMode ? 'Join the travel community today' : 'Sign in to your account or create a new one'}
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Username Field */}
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

              {/* PIN Field */}
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                  {isSignUpMode ? 'Create PIN (4-6 digits)' : 'PIN'}
                </label>
                <input
                  type="password"
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  autoComplete={isSignUpMode ? "new-password" : "current-password"}
                  inputMode="numeric"
                  maxLength="6"
                  pattern="\d{4,6}"
                  className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                    errors.pin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isSignUpMode ? "Create your 4-6 digit PIN" : "Enter your PIN"}
                  disabled={isSubmitting}
                  required
                />
                {errors.pin && (
                  <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                )}
              </div>

              {/* Confirm PIN Field - Only shown in sign up mode */}
              {isSignUpMode && (
                <div>
                  <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    id="confirmPin"
                    name="confirmPin"
                    value={formData.confirmPin}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    inputMode="numeric"
                    maxLength="6"
                    pattern="\d{4,6}"
                    className={`mt-1 appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors ${
                      errors.confirmPin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your PIN"
                    disabled={isSubmitting}
                    required
                  />
                  {errors.confirmPin && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPin}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {isSignUpMode ? (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back to Sign In
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSignUp}
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Continue Without Signing In - Only show in sign in mode */}
            {!isSignUpMode && (
              <div className="text-center">
                <button
                  onClick={handleContinueWithoutSignIn}
                  className="font-medium text-sm text-primary/80 hover:text-primary underline transition-colors cursor-pointer bg-transparent border-none"
                >
                  Continue without signing in
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default SignInPage;