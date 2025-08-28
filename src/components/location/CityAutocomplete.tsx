"use client"

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { MapPin, Search } from 'lucide-react'

// List of major Indian cities for autocomplete
const INDIAN_CITIES = [
  'Mumbai, Maharashtra',
  'Delhi, Delhi',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Jaipur, Rajasthan',
  'Surat, Gujarat',
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Indore, Madhya Pradesh',
  'Thane, Maharashtra',
  'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Vadodara, Gujarat',
  'Firozabad, Uttar Pradesh',
  'Ludhiana, Punjab',
  'Rajkot, Gujarat',
  'Agra, Uttar Pradesh',
  'Siliguri, West Bengal',
  'Nashik, Maharashtra',
  'Faridabad, Haryana',
  'Patiala, Punjab',
  'Meerut, Uttar Pradesh',
  'Kalyan-Dombivali, Maharashtra',
  'Vasai-Virar, Maharashtra',
  'Varanasi, Uttar Pradesh',
  'Srinagar, Jammu and Kashmir',
  'Dhanbad, Jharkhand',
  'Jodhpur, Rajasthan',
  'Amritsar, Punjab',
  'Raipur, Chhattisgarh',
  'Allahabad, Uttar Pradesh',
  'Coimbatore, Tamil Nadu',
  'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh',
  'Madurai, Tamil Nadu',
  'Guwahati, Assam',
  'Chandigarh, Chandigarh',
  'Hubli-Dharwad, Karnataka',
  'Amroha, Uttar Pradesh',
  'Moradabad, Uttar Pradesh',
  'Gurgaon, Haryana',
  'Aligarh, Uttar Pradesh',
  'Solapur, Maharashtra',
  'Ranchi, Jharkhand',
  'Jalandhar, Punjab',
  'Tiruchirappalli, Tamil Nadu',
  'Bhubaneswar, Odisha',
  'Salem, Tamil Nadu',
  'Warangal, Telangana',
  'Mira-Bhayandar, Maharashtra',
  'Thiruvananthapuram, Kerala',
  'Bhiwandi, Maharashtra',
  'Saharanpur, Uttar Pradesh',
  'Gorakhpur, Uttar Pradesh',
  'Guntur, Andhra Pradesh',
  'Bikaner, Rajasthan',
  'Amravati, Maharashtra',
  'Noida, Uttar Pradesh',
  'Jamshedpur, Jharkhand',
  'Bhilai Nagar, Chhattisgarh',
  'Cuttack, Odisha',
  'Kochi, Kerala',
  'Udaipur, Rajasthan',
  'Bhavnagar, Gujarat',
  'Dehradun, Uttarakhand',
  'Asansol, West Bengal',
  'Nanded-Waghala, Maharashtra',
  'Ajmer, Rajasthan',
  'Jamnagar, Gujarat',
  'Ujjain, Madhya Pradesh',
  'Sangli, Maharashtra',
  'Mangalore, Karnataka',
  'Erode, Tamil Nadu',
  'Belgaum, Karnataka',
  'Ambattur, Tamil Nadu',
  'Tirunelveli, Tamil Nadu',
  'Malegaon, Maharashtra',
  'Gaya, Bihar',
  'Tirupur, Tamil Nadu',
  'Udaipur, Rajasthan'
]

interface CityLocation {
  city: string
  state: string
  fullName: string
}

interface CityAutocompleteProps {
  label: string
  placeholder?: string
  value?: CityLocation | null
  onChange: (location: CityLocation | null) => void
  required?: boolean
  className?: string
}

export default function CityAutocomplete({ 
  label, 
  placeholder = "Enter city name...", 
  value, 
  onChange, 
  required = false,
  className = ""
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value?.fullName || '')
  const [suggestions, setSuggestions] = useState<CityLocation[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse city data
  const parseCityData = (cityString: string): CityLocation => {
    const [city, state] = cityString.split(', ')
    return {
      city: city.trim(),
      state: state.trim(),
      fullName: cityString
    }
  }

  // Filter cities based on input
  const filterCities = (input: string): CityLocation[] => {
    const query = input.toLowerCase().trim()
    if (query.length < 2) return []

    return INDIAN_CITIES
      .filter(cityString => 
        cityString.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit to 10 suggestions
      .map(parseCityData)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)
    
    if (newValue.trim() === '') {
      onChange(null)
      setSuggestions([])
      setShowSuggestions(false)
    } else {
      const filteredCities = filterCities(newValue)
      setSuggestions(filteredCities)
      setShowSuggestions(filteredCities.length > 0)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (location: CityLocation) => {
    setInputValue(location.fullName)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onChange(location)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // Handle input focus
  const handleFocus = () => {
    if (inputValue && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="pl-10"
            required={required}
            autoComplete="off"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((location, index) => (
              <div
                key={`${location.city}-${location.state}`}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionSelect(location)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {location.city}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.state}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {value && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-green-900">{value.city}</span>
              <span className="text-green-700 ml-1">({value.state})</span>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="text-sm text-gray-500 text-center">
            No cities found matching &ldquo;{inputValue}&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}
