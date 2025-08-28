'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, Navigation } from 'lucide-react';

interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  label: string;
  placeholder?: string;
  value?: Location | null;
  onChange: (location: Location | null) => void;
  required?: boolean;
  className?: string;
}

export default function LocationPicker({
  label,
  placeholder = 'Enter your location...',
  value,
  onChange,
  required = false,
  className = '',
}: LocationPickerProps) {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry'],
        });

        await loader.load();

        // Initialize services
        autocompleteService.current = new google.maps.places.AutocompleteService();
        geocoder.current = new google.maps.Geocoder();

        // Create a dummy div for PlacesService (required by Google Maps API)
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load location services');
      }
    };

    initializeGoogleMaps();
  }, []);

  // Get location suggestions
  const getSuggestions = async (input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const request = {
        input,
        componentRestrictions: { country: 'IN' }, // Restrict to India
        types: ['address'],
        fields: ['place_id', 'description', 'structured_formatting'],
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  // Get place details from place_id
  const getPlaceDetails = async (placeId: string): Promise<Location | null> => {
    if (!placesService.current) return null;

    return new Promise(resolve => {
      const request = {
        placeId,
        fields: ['address_components', 'formatted_address', 'geometry'],
      };

      placesService.current!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const location = extractLocationFromPlace(place);
          resolve(location);
        } else {
          resolve(null);
        }
      });
    });
  };

  // Extract location details from Google Place
  const extractLocationFromPlace = (place: google.maps.places.PlaceResult): Location | null => {
    if (!place.address_components || !place.geometry?.location) return null;

    const components = place.address_components;
    let city = '';
    let state = '';
    let pincode = '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    return {
      address: place.formatted_address || '',
      city,
      state,
      pincode,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
  };

  // Get current location using geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        if (!geocoder.current) {
          setError('Location services not ready');
          setIsLoading(false);
          return;
        }

        try {
          const request = {
            location: { lat: latitude, lng: longitude },
          };

          geocoder.current.geocode(request, (results, status) => {
            setIsLoading(false);

            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              const location = extractLocationFromPlace(results[0]);
              if (location) {
                setInputValue(location.address);
                onChange(location);
              }
            } else {
              setError('Could not get address for your location');
            }
          });
        } catch (err) {
          setIsLoading(false);
          setError('Error getting current location');
          console.error('Geocoding error:', err);
        }
      },
      error => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred while retrieving location');
            break;
        }
      }
    );
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError('');

    if (newValue.trim() === '') {
      onChange(null);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      getSuggestions(newValue);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setShowSuggestions(false);
    setIsLoading(true);
    setError('');

    const location = await getPlaceDetails(prediction.place_id);
    setIsLoading(false);

    if (location) {
      onChange(location);
    } else {
      setError('Could not get details for selected location');
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      <div className='relative'>
        <div className='relative'>
          <Input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={() => inputValue && setSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={`pl-10 pr-12 ${error ? 'border-red-500' : ''}`}
            required={required}
          />
          <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={getCurrentLocation}
            disabled={isLoading}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-1'
          >
            <Navigation className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto'>
            {suggestions.map(prediction => (
              <div
                key={prediction.place_id}
                className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                onClick={() => handleSuggestionSelect(prediction)}
              >
                <div className='flex items-center'>
                  <MapPin className='h-4 w-4 text-gray-400 mr-3 flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium text-gray-900 truncate'>
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className='text-sm text-gray-500 truncate'>
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

      {/* Loading Indicator */}
      {isLoading && <p className='mt-1 text-sm text-blue-600'>Getting location...</p>}

      {/* Selected Location Details */}
      {value && !error && !isLoading && (
        <div className='mt-2 p-3 bg-green-50 border border-green-200 rounded-md'>
          <div className='flex items-start'>
            <MapPin className='h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0' />
            <div className='text-sm'>
              <div className='font-medium text-green-900'>{value.address}</div>
              {value.city && value.state && (
                <div className='text-green-700 mt-1'>
                  {value.city}, {value.state} {value.pincode && `- ${value.pincode}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
