import { useState, useRef, useEffect, useCallback } from 'react';
import { searchDestinations } from '../services/tripService';
import FilterBottomSheet from './FilterBottomSheet';

function FilterBar({ onFiltersChange }) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [tempDateRange, setTempDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genderPreference, setGenderPreference] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const previousFiltersRef = useRef(null);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'all', label: 'All' }
  ];

  // Memoized function to build filter object
  const buildFilters = useCallback(() => {
    const filters = {};

    if (selectedDestination && selectedDestination.id) {
      filters.destination = selectedDestination.id;
    }

    if (genderPreference && genderPreference !== 'all') {
      filters.genderPreference = genderPreference;
    }

    // Only include dates if both start and end are present
    if (dateRange.start && dateRange.end) {
      filters.startDate = dateRange.start;
      filters.endDate = dateRange.end;
    }

    return filters;
  }, [selectedDestination, genderPreference, dateRange]);

  // Notify parent component when filters change (with deduplication)
  useEffect(() => {
    const currentFilters = buildFilters();
    const currentFiltersString = JSON.stringify(currentFilters);
    const previousFiltersString = JSON.stringify(previousFiltersRef.current);

    // Skip on initial mount (when previousFiltersRef is null)
    if (previousFiltersRef.current === null) {
      previousFiltersRef.current = currentFilters;
      return;
    }

    // Only call onFiltersChange if filters actually changed
    if (onFiltersChange && currentFiltersString !== previousFiltersString) {
      previousFiltersRef.current = currentFilters;
      onFiltersChange(currentFilters);
    }
  }, [buildFilters, onFiltersChange]);

  // Debounced search function
  const searchWithDebounce = useRef(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchDestinations(query, true);
        const destinations = response && Array.isArray(response.results) ? response.results : [];
        setSuggestions(destinations);
        setShowSuggestions(destinations.length > 0);
      } catch (error) {
        console.error('Error searching destinations:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 500)
  ).current;

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);

    // Clear selected destination when input is cleared or changed
    if (value === '' || (selectedDestination && value !== selectedDestination.name)) {
      setSelectedDestination(null);
    }

    if (value.length >= 2) {
      searchWithDebounce(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setDestinationInput('');
    setSelectedDestination(null);
    setDateRange({ start: '', end: '' });
    setTempDateRange({ start: '', end: '' });
    setGenderPreference('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowDatePicker(false);
    setShowGenderDropdown(false);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedDestination ||
           dateRange.start ||
           dateRange.end ||
           (genderPreference && genderPreference !== 'all');
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedDestination) count++;
    if (dateRange.start && dateRange.end) count++;
    if (genderPreference && genderPreference !== 'all') count++;
    return count;
  };

  // Handle bottom sheet filter apply
  const handleBottomSheetApply = (filters) => {
    // Update state from bottom sheet filters
    if (filters.destination) {
      setSelectedDestination({ id: filters.destination, name: filters.destinationName });
      setDestinationInput(filters.destinationName || '');
    } else {
      setSelectedDestination(null);
      setDestinationInput('');
    }

    if (filters.startDate && filters.endDate) {
      setDateRange({ start: filters.startDate, end: filters.endDate });
      setTempDateRange({ start: filters.startDate, end: filters.endDate });
    } else {
      setDateRange({ start: '', end: '' });
      setTempDateRange({ start: '', end: '' });
    }

    if (filters.genderPreference) {
      setGenderPreference(filters.genderPreference);
    } else {
      setGenderPreference('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setDestinationInput(suggestion.name);
    setSelectedDestination(suggestion);
    setShowSuggestions(false);
    console.log('Selected destination:', suggestion);
  };

  const handleTempDateChange = (field, value) => {
    const newTempDateRange = { ...tempDateRange, [field]: value };
    setTempDateRange(newTempDateRange);
    console.log('Temp date range updated:', newTempDateRange);
  };

  const handleDateApply = () => {
    setDateRange(tempDateRange);
    setShowDatePicker(false);
    console.log('Applied date range:', tempDateRange);
  };

  const handleDateCancel = () => {
    setTempDateRange(dateRange);
    setShowDatePicker(false);
    console.log('Cancelled date changes, reset to:', dateRange);
  };

  const handleGenderSelect = (gender) => {
    setGenderPreference(gender.value);
    setShowGenderDropdown(false);
    console.log('Selected gender preference:', gender.label);
  };

  const formatDateRange = () => {
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startDate} - ${endDate}`;
    }
    return 'Date Range';
  };

  const getGenderLabel = () => {
    const selected = genderOptions.find(option => option.value === genderPreference);
    return selected ? selected.label : 'Gender Preference';
  };

  // Remove the filtered suggestions logic since we're using API results directly

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile View - Filter Button Only */}
      <div className="md:hidden mb-6">
        {/* Filter Button */}
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          className="relative w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <span className="material-symbols-outlined">tune</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedDestination && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {selectedDestination.name}
                <button
                  onClick={() => {
                    setSelectedDestination(null);
                    setDestinationInput('');
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
            {dateRange.start && dateRange.end && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">date_range</span>
                {formatDateRange()}
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setTempDateRange({ start: '', end: '' });
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
            {genderPreference && genderPreference !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">wc</span>
                {getGenderLabel()}
                <button
                  onClick={() => setGenderPreference('')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop View - Original Filter Bar */}
      <div className="hidden md:flex mb-6 flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-background-light p-4">
        <h3 className="text-lg font-semibold text-slate-800">Filter by:</h3>
        <div className="flex flex-wrap gap-3 items-center">
        {/* Destination Input with Autocomplete */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="material-symbols-outlined text-base">location_on</span>
            <input
              type="text"
              placeholder="Destination"
              value={destinationInput}
              onChange={handleDestinationChange}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="bg-transparent border-none outline-none placeholder-primary text-primary min-w-32"
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full min-w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="font-medium">{suggestion.name}</div>
                  {/* Show country info only for cities, just name for countries */}
                  {suggestion.type === 'city' && suggestion.country && (
                    <div className="text-xs text-slate-500">{suggestion.country.name}</div>
                  )}
                  {suggestion.type === 'country' && (
                    <div className="text-xs text-slate-500">Country</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
            onClick={() => {
              setTempDateRange(dateRange);
              setShowDatePicker(!showDatePicker);
            }}
          >
            <span className="material-symbols-outlined text-base">date_range</span>
            <span>{formatDateRange()}</span>
            <span className="material-symbols-outlined text-base">arrow_drop_down</span>
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-4 min-w-64">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tempDateRange.start}
                    onChange={(e) => handleTempDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tempDateRange.end}
                    onChange={(e) => handleTempDateChange('end', e.target.value)}
                    min={tempDateRange.start}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDateCancel}
                    className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDateApply}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gender Preference Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
            onClick={() => setShowGenderDropdown(!showGenderDropdown)}
          >
            <span className="material-symbols-outlined text-base">wc</span>
            <span>{getGenderLabel()}</span>
            <span className="material-symbols-outlined text-base">arrow_drop_down</span>
          </button>

          {/* Gender Dropdown */}
          {showGenderDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full min-w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {genderOptions.map((option, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handleGenderSelect(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">clear</span>
            <span>Clear Filters</span>
          </button>
        )}
      </div>
      </div>

      {/* Filter Bottom Sheet - Mobile Only */}
      <FilterBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onApplyFilters={handleBottomSheetApply}
        initialFilters={{
          destination: selectedDestination,
          destinationName: destinationInput,
          startDate: dateRange.start,
          endDate: dateRange.end,
          genderPreference: genderPreference
        }}
      />
    </>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default FilterBar;