"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CityAutocomplete from '@/components/location/CityAutocomplete'
import { Package, ArrowRight, Calculator } from 'lucide-react'

interface CityLocation {
  city: string
  state: string
  fullName: string
}

interface PackageDetails {
  weight: number
  length: number
  width: number
  height: number
  value: number
}

interface ShippingFormData {
  fromLocation: CityLocation | null
  toLocation: CityLocation | null
  packageDetails: PackageDetails
  deliveryType: string
}

export default function ShippingQuoteForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<ShippingFormData>({
    fromLocation: null,
    toLocation: null,
    packageDetails: {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      value: 0
    },
    deliveryType: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle location changes
  const handleFromLocationChange = (location: CityLocation | null) => {
    setFormData(prev => ({ ...prev, fromLocation: location }))
    if (errors.fromLocation) {
      setErrors(prev => ({ ...prev, fromLocation: '' }))
    }
  }

  const handleToLocationChange = (location: CityLocation | null) => {
    setFormData(prev => ({ ...prev, toLocation: location }))
    if (errors.toLocation) {
      setErrors(prev => ({ ...prev, toLocation: '' }))
    }
  }

  // Handle package details changes
  const handlePackageChange = (field: keyof PackageDetails, value: number) => {
    setFormData(prev => ({
      ...prev,
      packageDetails: {
        ...prev.packageDetails,
        [field]: value
      }
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle delivery type change
  const handleDeliveryTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, deliveryType: value }))
    if (errors.deliveryType) {
      setErrors(prev => ({ ...prev, deliveryType: '' }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fromLocation) {
      newErrors.fromLocation = 'Please select pickup location'
    }

    if (!formData.toLocation) {
      newErrors.toLocation = 'Please select delivery location'
    }

    if (formData.fromLocation && formData.toLocation && 
        formData.fromLocation.city === formData.toLocation.city &&
        formData.fromLocation.state === formData.toLocation.state) {
      newErrors.toLocation = 'Pickup and delivery locations cannot be the same'
    }

    if (!formData.packageDetails.weight || formData.packageDetails.weight <= 0) {
      newErrors.weight = 'Please enter valid weight'
    }

    if (!formData.packageDetails.length || formData.packageDetails.length <= 0) {
      newErrors.length = 'Please enter valid length'
    }

    if (!formData.packageDetails.width || formData.packageDetails.width <= 0) {
      newErrors.width = 'Please enter valid width'
    }

    if (!formData.packageDetails.height || formData.packageDetails.height <= 0) {
      newErrors.height = 'Please enter valid height'
    }

    if (!formData.packageDetails.value || formData.packageDetails.value <= 0) {
      newErrors.value = 'Please enter valid package value'
    }

    if (!formData.deliveryType) {
      newErrors.deliveryType = 'Please select delivery type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay and redirect to quotes page
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store form data in sessionStorage for the quotes page
      sessionStorage.setItem('shippingQuoteData', JSON.stringify(formData))
      
      // Redirect to quotes comparison page
      router.push('/quotes')
    } catch (error) {
      console.error('Error getting quotes:', error)
      setErrors({ submit: 'Failed to get quotes. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate volumetric weight
  const getVolumetricWeight = () => {
    const { length, width, height } = formData.packageDetails
    if (length > 0 && width > 0 && height > 0) {
      return Math.round((length * width * height) / 5000 * 100) / 100
    }
    return 0
  }

  const volumetricWeight = getVolumetricWeight()
  const chargeableWeight = Math.max(formData.packageDetails.weight, volumetricWeight)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Get Shipping Quotes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CityAutocomplete
              label="Pickup Location"
              placeholder="Enter pickup city..."
              value={formData.fromLocation}
              onChange={handleFromLocationChange}
              required
              className={errors.fromLocation ? 'border-red-500' : ''}
            />
            {errors.fromLocation && (
              <p className="text-sm text-red-600 mt-1">{errors.fromLocation}</p>
            )}

            <CityAutocomplete
              label="Delivery Location"
              placeholder="Enter delivery city..."
              value={formData.toLocation}
              onChange={handleToLocationChange}
              required
              className={errors.toLocation ? 'border-red-500' : ''}
            />
            {errors.toLocation && (
              <p className="text-sm text-red-600 mt-1">{errors.toLocation}</p>
            )}
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={formData.packageDetails.weight || ''}
                  onChange={(e) => handlePackageChange('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.5"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-sm text-red-600 mt-1">{errors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (cm) *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="200"
                  value={formData.packageDetails.length || ''}
                  onChange={(e) => handlePackageChange('length', parseFloat(e.target.value) || 0)}
                  placeholder="20"
                  className={errors.length ? 'border-red-500' : ''}
                />
                {errors.length && (
                  <p className="text-sm text-red-600 mt-1">{errors.length}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (cm) *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="200"
                  value={formData.packageDetails.width || ''}
                  onChange={(e) => handlePackageChange('width', parseFloat(e.target.value) || 0)}
                  placeholder="15"
                  className={errors.width ? 'border-red-500' : ''}
                />
                {errors.width && (
                  <p className="text-sm text-red-600 mt-1">{errors.width}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm) *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="200"
                  value={formData.packageDetails.height || ''}
                  onChange={(e) => handlePackageChange('height', parseFloat(e.target.value) || 0)}
                  placeholder="10"
                  className={errors.height ? 'border-red-500' : ''}
                />
                {errors.height && (
                  <p className="text-sm text-red-600 mt-1">{errors.height}</p>
                )}
              </div>
            </div>

            {/* Weight Calculator */}
            {volumetricWeight > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Weight Calculation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Actual Weight:</span>
                    <span className="ml-2 font-medium">{formData.packageDetails.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Volumetric Weight:</span>
                    <span className="ml-2 font-medium">{volumetricWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Chargeable Weight:</span>
                    <span className="ml-2 font-medium text-blue-900">{chargeableWeight} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Package Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Value (₹) *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="1000000"
                  value={formData.packageDetails.value || ''}
                  onChange={(e) => handlePackageChange('value', parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                  <p className="text-sm text-red-600 mt-1">{errors.value}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Type *
                </label>
                <Select value={formData.deliveryType} onValueChange={handleDeliveryTypeChange}>
                  <SelectTrigger className={errors.deliveryType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                    <SelectItem value="express">Express (1-2 days)</SelectItem>
                    <SelectItem value="overnight">Overnight (Next day)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.deliveryType && (
                  <p className="text-sm text-red-600 mt-1">{errors.deliveryType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Getting Quotes...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Compare Quotes
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
