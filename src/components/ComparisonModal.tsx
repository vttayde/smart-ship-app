// Advanced comparison modal for detailed side-by-side analysis

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { CourierQuote } from '@/data/courierData'

interface ComparisonModalProps {
  quotes: CourierQuote[]
  isOpen: boolean
  onClose: () => void
  onSelectQuote: (quoteId: string) => void
}

export function ComparisonModal({ quotes, isOpen, onClose, onSelectQuote }: ComparisonModalProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<CourierQuote[]>([])

  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getDeliveryText = (quote: CourierQuote) => {
    if (quote.delivery.minDays === quote.delivery.maxDays) {
      return `${quote.delivery.minDays} ${quote.delivery.minDays === 1 ? 'day' : 'days'}`
    }
    return `${quote.delivery.minDays}-${quote.delivery.maxDays} days`
  }

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">☆</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  const addToComparison = (quote: CourierQuote) => {
    if (selectedQuotes.length < 3 && !selectedQuotes.find(q => q.id === quote.id)) {
      setSelectedQuotes([...selectedQuotes, quote])
    }
  }

  const removeFromComparison = (quoteId: string) => {
    setSelectedQuotes(selectedQuotes.filter(q => q.id !== quoteId))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Compare Courier Services</h2>
            <Button variant="outline" onClick={onClose}>
              ✕ Close
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Select up to 3 courier services to compare side-by-side
          </p>
        </div>

        <div className="flex h-full max-h-[calc(90vh-100px)]">
          {/* Quote Selection Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Available Options ({quotes.length})</h3>
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <Card key={quote.id} className={`p-3 cursor-pointer transition-all ${
                    selectedQuotes.find(q => q.id === quote.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{quote.courierService.logo}</span>
                        <div>
                          <div className="font-medium text-sm">
                            {quote.courierService.displayName}
                            {quote.isRecommended && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{quote.serviceType.displayName}</div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(quote.pricing.totalPrice)}
                          </div>
                        </div>
                      </div>
                      
                      {selectedQuotes.find(q => q.id === quote.id) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromComparison(quote.id)}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToComparison(quote)}
                          disabled={selectedQuotes.length >= 3}
                        >
                          Compare
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-y-auto">
            {selectedQuotes.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services selected</h3>
                <p className="text-gray-600">Select courier services from the left to compare them side-by-side</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedQuotes.map((quote) => (
                    <Card key={quote.id} className="p-4">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <span className="text-3xl">{quote.courierService.logo}</span>
                        <h3 className="font-bold text-lg mt-2">{quote.courierService.displayName}</h3>
                        <p className="text-sm text-gray-600">{quote.serviceType.displayName}</p>
                        {quote.isRecommended && (
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            🏆 Recommended
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-center mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(quote.pricing.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-600">All inclusive</div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Time:</span>
                          <span className="font-medium">{getDeliveryText(quote)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cutoff Time:</span>
                          <span className="font-medium">{quote.delivery.cutoffTime}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rating:</span>
                          <div className="text-right">
                            {getRatingStars(quote.courierService.rating)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium">{quote.confidence}%</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Key Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {quote.features.slice(0, 4).map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-sm mb-2">Price Breakdown</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span>{formatCurrency(quote.pricing.basePrice)}</span>
                          </div>
                          {quote.pricing.additionalCharges.map((charge, index) => (
                            <div key={index} className="flex justify-between text-gray-600">
                              <span>{charge.name}:</span>
                              <span>+{formatCurrency(charge.amount)}</span>
                            </div>
                          ))}
                          {quote.pricing.taxes.map((tax, index) => (
                            <div key={index} className="flex justify-between text-gray-600">
                              <span>{tax.name}:</span>
                              <span>+{formatCurrency(tax.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        className="w-full mt-4"
                        onClick={() => {
                          onSelectQuote(quote.id)
                          onClose()
                        }}
                        variant={quote.isRecommended ? 'default' : 'outline'}
                      >
                        Select This Service
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedQuotes.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Comparing {selectedQuotes.length} service{selectedQuotes.length !== 1 ? 's' : ''}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuotes([])}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparisonModal
