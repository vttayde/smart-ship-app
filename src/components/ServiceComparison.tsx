// Enhanced service comparison components for Week 3 Day 6-7

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { CourierQuote } from '@/data/courierData'

// Sorting options for courier quotes
export type SortOption = 'price' | 'delivery' | 'rating' | 'recommended'

// Filter options for courier selection
export interface FilterOptions {
  maxPrice?: number
  maxDeliveryDays?: number
  minRating?: number
  courierIds?: string[]
  serviceTypes?: string[]
  features?: string[]
}

// Service comparison utilities
export class ServiceComparison {
  static sortQuotes(quotes: CourierQuote[], sortBy: SortOption): CourierQuote[] {
    const sortedQuotes = [...quotes]
    
    switch (sortBy) {
      case 'price':
        return sortedQuotes.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice)
      
      case 'delivery':
        return sortedQuotes.sort((a, b) => a.delivery.minDays - b.delivery.minDays)
      
      case 'rating':
        return sortedQuotes.sort((a, b) => b.courierService.rating - a.courierService.rating)
      
      case 'recommended':
        return sortedQuotes.sort((a, b) => {
          if (a.isRecommended && !b.isRecommended) return -1
          if (!a.isRecommended && b.isRecommended) return 1
          return a.pricing.totalPrice - b.pricing.totalPrice
        })
      
      default:
        return sortedQuotes
    }
  }

  static filterQuotes(quotes: CourierQuote[], filters: FilterOptions): CourierQuote[] {
    return quotes.filter(quote => {
      // Price filter
      if (filters.maxPrice && quote.pricing.totalPrice > filters.maxPrice) {
        return false
      }

      // Delivery time filter
      if (filters.maxDeliveryDays && quote.delivery.maxDays > filters.maxDeliveryDays) {
        return false
      }

      // Rating filter
      if (filters.minRating && quote.courierService.rating < filters.minRating) {
        return false
      }

      // Courier ID filter
      if (filters.courierIds && filters.courierIds.length > 0) {
        if (!filters.courierIds.includes(quote.courierService.id)) {
          return false
        }
      }

      // Service type filter
      if (filters.serviceTypes && filters.serviceTypes.length > 0) {
        if (!filters.serviceTypes.includes(quote.serviceType.id)) {
          return false
        }
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature => 
          quote.features.some(quoteFeature => 
            quoteFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
        if (!hasAllFeatures) {
          return false
        }
      }

      return true
    })
  }

  static compareQuotes(quotes: CourierQuote[]): {
    cheapest: CourierQuote | null
    fastest: CourierQuote | null
    mostReliable: CourierQuote | null
    bestValue: CourierQuote | null
  } {
    if (quotes.length === 0) {
      return { cheapest: null, fastest: null, mostReliable: null, bestValue: null }
    }

    const cheapest = quotes.reduce((min, quote) => 
      quote.pricing.totalPrice < min.pricing.totalPrice ? quote : min
    )

    const fastest = quotes.reduce((min, quote) => 
      quote.delivery.minDays < min.delivery.minDays ? quote : min
    )

    const mostReliable = quotes.reduce((max, quote) => 
      quote.courierService.rating > max.courierService.rating ? quote : max
    )

    // Best value: combination of price and reliability
    const bestValue = quotes.reduce((best, quote) => {
      const currentScore = (quote.courierService.rating * 20) - (quote.pricing.totalPrice / 10)
      const bestScore = (best.courierService.rating * 20) - (best.pricing.totalPrice / 10)
      return currentScore > bestScore ? quote : best
    })

    return { cheapest, fastest, mostReliable, bestValue }
  }

  static getComparisonMetrics(quotes: CourierQuote[]) {
    if (quotes.length === 0) {
      return {
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        averageDeliveryTime: 0,
        deliveryRange: { min: 0, max: 0 },
        averageRating: 0,
        totalSavings: 0
      }
    }

    const prices = quotes.map(q => q.pricing.totalPrice)
    const deliveryTimes = quotes.map(q => q.delivery.estimatedDays)
    const ratings = quotes.map(q => q.courierService.rating)

    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const averageDeliveryTime = deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

    const priceRange = { min: Math.min(...prices), max: Math.max(...prices) }
    const deliveryRange = { min: Math.min(...deliveryTimes), max: Math.max(...deliveryTimes) }
    const totalSavings = priceRange.max - priceRange.min

    return {
      averagePrice: Math.round(averagePrice),
      priceRange,
      averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
      deliveryRange,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSavings: Math.round(totalSavings)
    }
  }
}

// Sort and Filter Controls Component
interface SortFilterControlsProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  quotesCount: number
  totalQuotes: number
}

export function SortFilterControls({
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
  quotesCount,
  totalQuotes
}: SortFilterControlsProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleMaxPriceChange = (value: string) => {
    const maxPrice = value ? parseInt(value) : undefined
    onFiltersChange({ ...filters, maxPrice })
  }

  const handleMaxDeliveryChange = (value: string) => {
    const maxDeliveryDays = value ? parseInt(value) : undefined
    onFiltersChange({ ...filters, maxDeliveryDays })
  }

  const handleMinRatingChange = (value: string) => {
    const minRating = value ? parseFloat(value) : undefined
    onFiltersChange({ ...filters, minRating })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Results Summary and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-2 sm:mb-0">
            <span className="text-sm text-gray-600">
              Showing {quotesCount} of {totalQuotes} options
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recommended">Recommended</option>
              <option value="price">Price (Low to High)</option>
              <option value="delivery">Fastest Delivery</option>
              <option value="rating">Highest Rated</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Any price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Delivery Days
                </label>
                <input
                  type="number"
                  placeholder="Any duration"
                  value={filters.maxDeliveryDays || ''}
                  onChange={(e) => handleMaxDeliveryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating
                </label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleMinRatingChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                  <option value="3.0">3.0+ stars</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Active filters: {Object.values(filters).filter(Boolean).length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={Object.values(filters).filter(Boolean).length === 0}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Comparison Summary Component
interface ComparisonSummaryProps {
  quotes: CourierQuote[]
}

export function ComparisonSummary({ quotes }: ComparisonSummaryProps) {
  const comparison = ServiceComparison.compareQuotes(quotes)
  const metrics = ServiceComparison.getComparisonMetrics(quotes)

  if (quotes.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {comparison.cheapest && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">💰 Cheapest</div>
            <div className="font-semibold">{comparison.cheapest.courierService.displayName}</div>
            <div className="text-sm text-gray-600">{formatCurrency(comparison.cheapest.pricing.totalPrice)}</div>
          </div>
        )}

        {comparison.fastest && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">⚡ Fastest</div>
            <div className="font-semibold">{comparison.fastest.courierService.displayName}</div>
            <div className="text-sm text-gray-600">{comparison.fastest.delivery.minDays}-{comparison.fastest.delivery.maxDays} days</div>
          </div>
        )}

        {comparison.mostReliable && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium">⭐ Most Reliable</div>
            <div className="font-semibold">{comparison.mostReliable.courierService.displayName}</div>
            <div className="text-sm text-gray-600">{comparison.mostReliable.courierService.rating}★ rating</div>
          </div>
        )}

        {comparison.bestValue && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">🏆 Best Value</div>
            <div className="font-semibold">{comparison.bestValue.courierService.displayName}</div>
            <div className="text-sm text-gray-600">Price + Rating optimized</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-500">Average Price</div>
          <div className="font-semibold">{formatCurrency(metrics.averagePrice)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Price Range</div>
          <div className="font-semibold">{formatCurrency(metrics.priceRange.min)} - {formatCurrency(metrics.priceRange.max)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Avg Delivery</div>
          <div className="font-semibold">{metrics.averageDeliveryTime} days</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Potential Savings</div>
          <div className="font-semibold text-green-600">{formatCurrency(metrics.totalSavings)}</div>
        </div>
      </div>
    </Card>
  )
}

export default ServiceComparison
