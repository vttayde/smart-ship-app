'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout/Layout'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import { Truck, MapPin, Clock, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleSearch = () => {
    // Redirect to detailed shipping form
    router.push('/ship')
  }

  return (
    <Layout>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Truck className="w-4 h-4 mr-2" />
              India's #1 Logistics Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ship Smart,<br />
              <span className="text-blue-600">Ship Anywhere</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compare rates from 5+ courier partners, book instantly, and track in real-time. 
              The smartest way to send packages across India.
            </p>
          </div>

          {/* Enhanced Search Form */}
          <Card className="max-w-5xl mx-auto shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-900">Get Instant Rate Comparison</CardTitle>
              <p className="text-gray-600">Enter your shipment details to compare rates from multiple couriers</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    From City
                  </label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select pickup city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="chennai">Chennai</SelectItem>
                      <SelectItem value="kolkata">Kolkata</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    To City
                  </label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select delivery city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                      <SelectItem value="jaipur">Jaipur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Shield className="w-4 h-4 mr-2 text-orange-600" />
                    Package Weight
                  </label>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">Up to 0.5 KG</SelectItem>
                      <SelectItem value="1">1 KG</SelectItem>
                      <SelectItem value="2">2 KG</SelectItem>
                      <SelectItem value="5">5 KG</SelectItem>
                      <SelectItem value="10">10 KG</SelectItem>
                      <SelectItem value="more">More than 10 KG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Compare Rates
                  </Button>
                </div>
              </div>

              {/* Quick benefits under search */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Instant Rate Comparison
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Best Price Guarantee
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Real-time Tracking
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

        {/* Enhanced Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why 10,000+ Customers Choose Ship Smart
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of logistics with our comprehensive platform designed for modern shipping needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">5+ Courier Partners</h3>
                  <p className="text-gray-600 mb-4">
                    Delhivery, Shadowfax, Ekart, Blue Dart & more trusted partners for nationwide coverage
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary">Delhivery</Badge>
                    <Badge variant="secondary">Shadowfax</Badge>
                    <Badge variant="secondary">+3 More</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Price Guarantee</h3>
                  <p className="text-gray-600 mb-4">
                    Compare real-time rates from all partners and automatically get the best available price
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="success">Savings up to 40%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Tracking</h3>
                  <p className="text-gray-600 mb-4">
                    Live GPS tracking, delivery updates, and instant notifications for all your shipments
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="info">24/7 Tracking</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Trusted Across India</h3>
              <p className="text-blue-100 text-lg">
                Join thousands of businesses and individuals who rely on Ship Smart
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-blue-100">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-blue-100">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">5+</div>
                <div className="text-blue-100">Courier Partners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
                <div className="text-blue-100">Delivery Success</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Ship Smarter?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied customers who trust Ship Smart for their shipping needs. 
              Start comparing rates in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No setup fees • No monthly charges • Pay only when you ship
            </p>
          </div>
        </section>
    </Layout>
  )
}
