"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Package, Star, Shield, CheckCircle } from 'lucide-react'

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

interface CourierQuote {
  id: string
  courierName: string
  logo: string
  serviceType: string
  deliveryTime: string
  price: number
  features: string[]
  rating: number
  reviews: number
  isRecommended?: boolean
  originalPrice?: number
}

export default function QuotesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ShippingFormData | null>(null)
  const [quotes, setQuotes] = useState<CourierQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get form data from sessionStorage
    const storedData = sessionStorage.getItem('shippingQuoteData')
    if (!storedData) {
      router.push('/')
      return
    }

    const data = JSON.parse(storedData) as ShippingFormData
    setFormData(data)

    // Generate mock quotes based on the form data
    const generateMockQuotes = async (formData: ShippingFormData) => {
      setIsLoading(true)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Calculate base price based on weight and distance
      const basePrice = Math.max(formData.packageDetails.weight, getVolumetricWeight(formData.packageDetails)) * 15

      // Mock courier quotes
      const mockQuotes: CourierQuote[] = [
        {
          id: 'delhivery-1',
          courierName: 'Delhivery',
          logo: '🚚',
          serviceType: formData.deliveryType === 'overnight' ? 'Next Day' : formData.deliveryType === 'express' ? 'Express' : 'Surface',
          deliveryTime: formData.deliveryType === 'overnight' ? '1 day' : formData.deliveryType === 'express' ? '2-3 days' : '4-5 days',
          price: Math.round(basePrice * (formData.deliveryType === 'overnight' ? 2.5 : formData.deliveryType === 'express' ? 1.8 : 1.2)),
          features: ['Real-time tracking', 'Insurance included', 'Pickup & delivery', 'SMS notifications'],
          rating: 4.3,
          reviews: 12540,
          isRecommended: formData.deliveryType === 'standard',
          originalPrice: formData.deliveryType === 'standard' ? Math.round(basePrice * 1.4) : undefined
        },
        {
          id: 'shadowfax-1',
          courierName: 'Shadowfax',
          logo: '⚡',
          serviceType: formData.deliveryType === 'overnight' ? 'Same Day' : formData.deliveryType === 'express' ? 'Express' : 'Standard',
          deliveryTime: formData.deliveryType === 'overnight' ? '6-8 hours' : formData.deliveryType === 'express' ? '1-2 days' : '3-4 days',
          price: Math.round(basePrice * (formData.deliveryType === 'overnight' ? 3.0 : formData.deliveryType === 'express' ? 2.0 : 1.4)),
          features: ['Fastest delivery', 'Live tracking', 'Fragile handling', 'Customer support'],
          rating: 4.5,
          reviews: 8900,
          isRecommended: formData.deliveryType === 'overnight'
        },
        {
          id: 'ekart-1',
          courierName: 'Ekart (Flipkart)',
          logo: '📦',
          serviceType: formData.deliveryType === 'overnight' ? 'Priority' : formData.deliveryType === 'express' ? 'Express' : 'Regular',
          deliveryTime: formData.deliveryType === 'overnight' ? '1 day' : formData.deliveryType === 'express' ? '2-3 days' : '4-6 days',
          price: Math.round(basePrice * (formData.deliveryType === 'overnight' ? 2.2 : formData.deliveryType === 'express' ? 1.6 : 1.0)),
          features: ['Reliable network', 'Easy returns', 'Secure packaging', 'COD available'],
          rating: 4.1,
          reviews: 15670,
          isRecommended: formData.deliveryType === 'express',
          originalPrice: formData.deliveryType === 'express' ? Math.round(basePrice * 1.8) : undefined
        },
        {
          id: 'bluedart-1',
          courierName: 'Blue Dart',
          logo: '🌟',
          serviceType: formData.deliveryType === 'overnight' ? 'Express' : formData.deliveryType === 'express' ? 'Speed' : 'Economy',
          deliveryTime: formData.deliveryType === 'overnight' ? '1 day' : formData.deliveryType === 'express' ? '1-2 days' : '3-4 days',
          price: Math.round(basePrice * (formData.deliveryType === 'overnight' ? 2.8 : formData.deliveryType === 'express' ? 2.2 : 1.6)),
          features: ['Premium service', 'Insurance coverage', 'Priority handling', '24/7 support'],
          rating: 4.6,
          reviews: 7890
        }
      ]

      // Sort quotes by price (lowest first)
      const sortedQuotes = mockQuotes.sort((a, b) => a.price - b.price)
      setQuotes(sortedQuotes)
      setIsLoading(false)
    }

    generateMockQuotes(data)
  }, [router])

  const getVolumetricWeight = (packageDetails: PackageDetails) => {
    const { length, width, height } = packageDetails
    if (length > 0 && width > 0 && height > 0) {
      return Math.round((length * width * height) / 5000 * 100) / 100
    }
    return 0
  }

  const handleBookNow = (quote: CourierQuote) => {
    // Store selected quote for booking
    sessionStorage.setItem('selectedQuote', JSON.stringify(quote))
    router.push('/auth/login') // Redirect to login for booking
  }

  const handleBackToForm = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Getting best quotes for you...</p>
            <p className="text-sm text-gray-500">Comparing prices from multiple couriers</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!formData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">No shipping data found</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Back to Home
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const volumetricWeight = getVolumetricWeight(formData.packageDetails)
  const chargeableWeight = Math.max(formData.packageDetails.weight, volumetricWeight)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={handleBackToForm}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quote Form
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shipping Quotes Comparison
            </h1>
            <p className="text-gray-600">
              Compare prices and services from multiple courier partners
            </p>
          </div>

          {/* Shipment Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Route</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{formData.fromLocation?.city}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{formData.toLocation?.city}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Package</h4>
                  <p className="text-sm text-gray-600">
                    {chargeableWeight} kg • {formData.packageDetails.length}×{formData.packageDetails.width}×{formData.packageDetails.height} cm
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Value</h4>
                  <p className="text-sm text-gray-600">
                    ₹{formData.packageDetails.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className={`relative ${quote.isRecommended ? 'ring-2 ring-blue-500' : ''}`}>
                {quote.isRecommended && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quote.logo}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{quote.courierName}</h3>
                        <p className="text-sm text-gray-600">{quote.serviceType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {quote.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{quote.originalPrice}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-green-600">
                        ₹{quote.price}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Delivery Time */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Delivery: {quote.deliveryTime}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{quote.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({quote.reviews.toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {quote.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Button
                      onClick={() => handleBookNow(quote)}
                      className={`w-full ${
                        quote.isRecommended 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Why Ship Smart?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Best Prices:</strong> Compare rates from multiple couriers and save up to 40%
              </div>
              <div>
                <strong>Reliable Service:</strong> Partner with India&apos;s top courier companies
              </div>
              <div>
                <strong>Full Support:</strong> End-to-end tracking and customer support
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
