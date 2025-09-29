import { useState, useEffect, useRef } from 'react';
import { searchDestinations } from '../services/tripService';

function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false
}) {
  const [inputValue, setInputValue] = useState(() => {
    if (value && typeof value === 'object') {
      return value.name || '';
    }
    return typeof value === 'string' ? value : '';
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Only update input value when external value prop changes and it's different
  useEffect(() => {
    const newValue = value && typeof value === 'object' ? value.name || '' : (typeof value === 'string' ? value : '');
    if (newValue !== inputValue && !inputRef.current?.matches(':focus')) {
      setInputValue(newValue);
    }
  }, [value]);

  const searchWithDebounce = useRef(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Searching for:', query); // Debug log
        const response = await searchDestinations(query, false);
        console.log('Full API response:', response); // Debug log
        console.log('Response type:', typeof response, 'Is array:', Array.isArray(response)); // Debug log

        // Parse API response - prioritize 'results' array based on your API format
        let destinations = [];
        if (response && Array.isArray(response.results)) {
          destinations = response.results;
        } else if (Array.isArray(response)) {
          destinations = response;
        } else if (response && Array.isArray(response.destinations)) {
          destinations = response.destinations;
        } else if (response && Array.isArray(response.data)) {
          destinations = response.data;
        }

        console.log('Parsed destinations:', destinations, 'Length:', destinations.length); // Debug log
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

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Clear the selected destination when typing
    onChange({ target: { name, value: '' } });

    // Show suggestions immediately if we have cached results
    if (newValue.length >= 2) {
      searchWithDebounce(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onChange({ target: { name, value: suggestion } });
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative" style={{ zIndex: showSuggestions ? 1000 : 'auto' }}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-background-light border rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {(showSuggestions && suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
          style={{ zIndex: 9999 }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="font-medium">{suggestion.name}</div>
              {/* Show country info only for cities, not for countries */}
              {suggestion.type === 'city' && suggestion.country && (
                <div className="text-sm text-gray-500">{suggestion.country.name}</div>
              )}
              {suggestion.type === 'country' && (
                <div className="text-sm text-gray-500">Country</div>
              )}
            </div>
          ))}
        </div>
      )}


      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Improved debounce utility function that waits for user pause
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

export default AutocompleteInput;