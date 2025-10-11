import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, updateTrip } from '../services/tripService';
import AutocompleteInput from './AutocompleteInput';
import { useTrips } from '../contexts/TripsContext';

function TripForm({ tripData = null, tripId = null }) {
  const navigate = useNavigate();
  const { refreshAll } = useTrips();
  const isEditMode = Boolean(tripId);

  const [formData, setFormData] = useState({
    destination: null,
    fromLocation: null,
    dateType: 'range',
    startDate: '',
    endDate: '',
    month: '',
    flexibleDates: false,
    tripDetails: '',
    genderPreference: 'No Preference',
    contactType: 'WhatsApp',
    contactInfo: '',
    hideContactInfo: false
  });

  // Pre-populate form when in edit mode
  useEffect(() => {
    if (tripData && isEditMode) {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      setFormData({
        destination: tripData.destination || null,
        fromLocation: tripData.from || null,
        dateType: 'range',
        startDate: tripData.dateRange?.startDate
          ? new Date(tripData.dateRange.startDate).toISOString().split('T')[0]
          : '',
        endDate: tripData.dateRange?.endDate
          ? new Date(tripData.dateRange.endDate).toISOString().split('T')[0]
          : '',
        month: '',
        flexibleDates: tripData.isDateFlexible || false,
        tripDetails: tripData.tripDetail || '',
        genderPreference: tripData.genderPreference || 'No Preference',
        contactType: tripData.contactDetail?.medium ? capitalize(tripData.contactDetail.medium) : 'WhatsApp',
        contactInfo: tripData.contactDetail?.handle || '',
        hideContactInfo: tripData.contactDetail?.isHidden || false
      });
    }
  }, [tripData, isEditMode]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.destination || !formData.destination.id) {
      newErrors.destination = 'Destination is required';
    }

    if (formData.dateType === 'range') {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    } else if (formData.dateType === 'month' && !formData.month) {
      newErrors.month = 'Month is required';
    }

    if (!formData.tripDetails.trim()) {
      newErrors.tripDetails = 'Trip details are required';
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
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

    try {
      // Transform form data to API format
      const apiData = {
        destinationId: formData.destination.id,
        dateRange: formData.dateType === 'range' ? {
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        } : {
          startDate: new Date(formData.month + '-01').toISOString(),
          endDate: new Date(new Date(formData.month + '-01').getFullYear(), new Date(formData.month + '-01').getMonth() + 1, 0).toISOString()
        },
        isDateFlexible: formData.flexibleDates,
        tripDetail: formData.tripDetails,
        contactDetail: {
          medium: formData.contactType.toLowerCase(),
          handle: formData.contactInfo,
          isHidden: formData.hideContactInfo
        }
      };

      // Add from location if provided
      if (formData.fromLocation && formData.fromLocation.id) {
        apiData.fromId = formData.fromLocation.id;
      }

      let response;
      if (isEditMode) {
        // Update existing trip
        response = await updateTrip(tripId, apiData);
      } else {
        // Create new trip
        response = await createTrip(apiData);
      }

      if (response.success) {
        // Refresh trips and my trips data
        refreshAll();

        if (isEditMode) {
          // Navigate back to my trips page after successful update
          navigate('/my-trips');
        } else {
          // Show success dialog for new trip
          setCreatedTrip(response.trip);
          setShowSuccessDialog(true);

          // Reset form
          setFormData({
            destination: null,
            fromLocation: null,
            dateType: 'range',
            startDate: '',
            endDate: '',
            month: '',
            flexibleDates: false,
            tripDetails: '',
            genderPreference: 'No Preference',
            contactType: 'WhatsApp',
            contactInfo: '',
            hideContactInfo: false
          });
        }
      }
    } catch (error) {
      console.error(isEditMode ? 'Error updating trip:' : 'Error posting trip:', error);
      alert(isEditMode ? 'Error updating trip. Please try again.' : 'Error posting trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    setCreatedTrip(null);
  };

  return (
    <>
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Trip Posted Successfully!
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Your trip to {createdTrip?.destination?.name} has been created.
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeSuccessDialog}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Post a Trip</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <AutocompleteInput
          label="Destination"
          name="destination"
          value={formData.destination}
          onChange={handleInputChange}
          placeholder="e.g., Paris, Tokyo, London"
          error={errors.destination}
          required={true}
        />

        {/* From Location */}
        <AutocompleteInput
          label="From Location"
          name="fromLocation"
          value={formData.fromLocation}
          onChange={handleInputChange}
          placeholder="e.g., New York, London, Mumbai"
          required={false}
        />

        {/* Dates Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
          <div className="space-y-4">
            {/* Date Type Selection */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="date-range"
                  name="dateType"
                  value="range"
                  checked={formData.dateType === 'range'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="date-range" className="ml-2 block text-sm text-gray-900">
                  Date Range
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="date-month"
                  name="dateType"
                  value="month"
                  checked={formData.dateType === 'month'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="date-month" className="ml-2 block text-sm text-gray-900">
                  Month
                </label>
              </div>
            </div>

            {/* Date Range Fields */}
            {formData.dateType === 'range' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    className={`w-full bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            )}

            {/* Month Field */}
            {formData.dateType === 'month' && (
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className={`w-full bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
                    errors.month ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600">{errors.month}</p>
                )}
              </div>
            )}

            {/* Flexible Dates Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="flexibleDates"
                name="flexibleDates"
                checked={formData.flexibleDates}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="flexibleDates" className="ml-2 block text-sm text-gray-900">
                Flexible Dates
              </label>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div>
          <label htmlFor="tripDetails" className="block text-sm font-medium text-gray-700 mb-1">
            Trip Details
          </label>
          <textarea
            id="tripDetails"
            name="tripDetails"
            value={formData.tripDetails}
            onChange={handleInputChange}
            rows="4"
            placeholder="Describe your trip plans, interests, and what you're looking for in a travel buddy."
            className={`w-full bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
              errors.tripDetails ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.tripDetails && (
            <p className="mt-1 text-sm text-red-600">{errors.tripDetails}</p>
          )}
        </div>

        {/* Gender Preference */}
        <div>
          <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">
            Gender Preference
          </label>
          <select
            id="genderPreference"
            name="genderPreference"
            value={formData.genderPreference}
            onChange={handleInputChange}
            className="w-full bg-background-light border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2"
          >
            <option>No Preference</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        {/* Contact Information */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="contactType" className="block text-sm font-medium text-gray-700">
              Contact Channel
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hideContactInfo"
                checked={formData.hideContactInfo}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-background-light border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-gray-600">Hide contact info</span>
            </label>
          </div>
          <div className="flex space-x-2">
            <select
              id="contactType"
              name="contactType"
              value={formData.contactType}
              onChange={handleInputChange}
              className="w-1/3 bg-background-light border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2"
            >
              <option>WhatsApp</option>
              <option>Telegram</option>
              <option>Instagram</option>
              <option>Email</option>
              <option>Phone</option>
            </select>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              placeholder="Your contact details"
              className={`w-2/3 bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
                errors.contactInfo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.contactInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo}</p>
          )}
          {formData.hideContactInfo && (
            <p className="mt-2 text-xs text-gray-500">
              ℹ️ Your contact info will be hidden. 
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Trip' : 'Post Trip')}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default TripForm;