import { useState } from 'react';
import { showInterestWithColdStart } from '../services/tripService';

function ShowInterestModal({ trip, isOpen, onClose, onSuccess, onError }) {
  // Don't render if trip data is not available
  if (!trip || !isOpen) {
    return null;
  }
  const [formData, setFormData] = useState({
    name: '',
    contactMedium: 'whatsapp',
    contactHandle: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [progressMessage, setProgressMessage] = useState('');

  const contactMediumOptions = [
    { value: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
    { value: 'telegram', label: 'Telegram', placeholder: '@username or phone' },
    { value: 'instagram', label: 'Instagram', placeholder: '@username' },
    { value: 'email', label: 'Email', placeholder: 'your@email.com' },
    { value: 'phone', label: 'Phone', placeholder: '+1234567890' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Validate contact handle
    if (!formData.contactHandle.trim()) {
      newErrors.contactHandle = 'Contact information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setProgressMessage('');

    try {
      const interestData = {
        name: formData.name.trim(),
        contactDetail: {
          medium: formData.contactMedium,
          handle: formData.contactHandle.trim()
        }
      };

      // Use cold start wrapper with progress callbacks
      await showInterestWithColdStart(
        // Progress callback
        (message) => {
          setProgressMessage(message);
        },
        // Success callback
        (response) => {
          if (response.success) {
            onSuccess?.('Interest submitted successfully! The trip creator will be able to see your contact information.');
            handleClose();
          }
        },
        // Error callback
        (errorMessage) => {
          onError?.(errorMessage);
        },
        // Skip health check (false for first call)
        false,
        // API function arguments
        trip.id,
        interestData
      );
    } catch (error) {
      console.error('Error submitting interest:', error);

      // Handle specific error cases
      let errorMessage = 'Failed to submit interest. Please try again.';

      if (error.status === 409) {
        errorMessage = 'You have already expressed interest in this trip.';
      } else if (error.status === 404) {
        errorMessage = 'This trip is no longer available.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Please check your information and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
      setProgressMessage('');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      contactMedium: 'whatsapp',
      contactHandle: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose?.();
  };

  const getPlaceholder = () => {
    const selected = contactMediumOptions.find(option => option.value === formData.contactMedium);
    return selected?.placeholder || 'Your contact information';
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Show Interest</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Express your interest in traveling to <strong>
              {trip.destination?.name
                ? (trip.destination.country ? `${trip.destination.name}, ${trip.destination.country.name}` : trip.destination.name)
                : trip.destination || 'this destination'}
            </strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              maxLength="100"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Contact Medium */}
          <div>
            <label htmlFor="contactMedium" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method <span className="text-red-500">*</span>
            </label>
            <select
              id="contactMedium"
              name="contactMedium"
              value={formData.contactMedium}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              disabled={isSubmitting}
            >
              {contactMediumOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Handle */}
          <div>
            <label htmlFor="contactHandle" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Information <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contactHandle"
              name="contactHandle"
              value={formData.contactHandle}
              onChange={handleInputChange}
              placeholder={getPlaceholder()}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${
                errors.contactHandle ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.contactHandle && (
              <p className="mt-1 text-sm text-red-600">{errors.contactHandle}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This information will be shared with the trip creator so they can contact you.
            </p>
          </div>

          {/* Progress Message */}
          {progressMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">{progressMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (progressMessage || 'Submitting...') : 'Submit Interest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShowInterestModal;