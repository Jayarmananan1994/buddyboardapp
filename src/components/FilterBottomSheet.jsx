import { useState, useRef, useEffect } from 'react';
import { searchDestinations } from '../services/tripService';

function FilterBottomSheet({ isOpen, onClose, onApplyFilters, initialFilters = {} }) {
  const [destinationInput, setDestinationInput] = useState(initialFilters.destinationName || '');
  const [selectedDestination, setSelectedDestination] = useState(initialFilters.destination || null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: initialFilters.startDate || '',
    end: initialFilters.endDate || ''
  });
  const [genderPreference, setGenderPreference] = useState(initialFilters.genderPreference || '');

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'all', label: 'All' }
  ];

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

  const handleSuggestionClick = (suggestion) => {
    setDestinationInput(suggestion.name);
    setSelectedDestination(suggestion);
    setShowSuggestions(false);
  };

  const handleApply = () => {
    const filters = {};

    if (selectedDestination && selectedDestination.id) {
      filters.destination = selectedDestination.id;
      filters.destinationName = selectedDestination.name;
    }

    if (genderPreference && genderPreference !== 'all') {
      filters.genderPreference = genderPreference;
    }

    // Only include dates if both start and end are present
    if (dateRange.start && dateRange.end) {
      filters.startDate = dateRange.start;
      filters.endDate = dateRange.end;
    }

    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setDestinationInput('');
    setSelectedDestination(null);
    setDateRange({ start: '', end: '' });
    setGenderPreference('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClearAll = () => {
    handleClear();
    onApplyFilters({});
    onClose();
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
        onClick={handleBackdropClick}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Destination Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  location_on
                </span>
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={destinationInput}
                  onChange={handleDestinationChange}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="font-medium text-slate-900">{suggestion.name}</div>
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
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  min={dateRange.start}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGenderPreference(option.value)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
                    genderPreference === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="flex-1 py-3 px-4 border-2 border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 bg-primary rounded-lg font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
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

export default FilterBottomSheet;
