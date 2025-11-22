// Enhanced quotes page with new pricing calculator integration

'use client';

import { ComparisonModal } from '@/components/ComparisonModal';
import Layout from '@/components/layout/Layout';
import {
  ComparisonSummary,
  ServiceComparison,
  SortFilterControls,
  type FilterOptions,
  type SortOption,
} from '@/components/ServiceComparison';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/loading';
import { RatingStars } from '@/components/ui/RatingStars';
import type { CourierQuote } from '@/data/courierData';
import { SAMPLE_SHIPPING_REQUESTS } from '@/data/mockData';
import { pricingCalculator, type ShippingRequest } from '@/data/pricingCalculator';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils-common';
import { QuoteExporter } from '@/utils/QuoteExporter';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function QuotesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [allQuotes, setAllQuotes] = useState<CourierQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<ShippingRequest>(
    SAMPLE_SHIPPING_REQUESTS[0].request
  );
  const [searchData, setSearchData] = useState<{
    fromCity: string;
    toCity: string;
    weight: string;
    timestamp: string;
  } | null>(null);

  // New comparison features
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Load search data from sessionStorage on component mount
  useEffect(() => {
    const storedSearchData = sessionStorage.getItem('quoteSearchData');
    if (storedSearchData) {
      try {
        const parsedData = JSON.parse(storedSearchData);
        setSearchData(parsedData);

        // Update current request based on search data
        const updatedRequest: ShippingRequest = {
          ...SAMPLE_SHIPPING_REQUESTS[0].request,
          fromCity: parsedData.fromCity,
          toCity: parsedData.toCity,
          weight: parseFloat(parsedData.weight) || 1,
        };
        setCurrentRequest(updatedRequest);
      } catch (error) {
        console.error('Error parsing search data:', error);
      }
    }
  }, []);

  // Memoized filtered and sorted quotes
  const quotes = useMemo(() => {
    if (allQuotes.length === 0) return [];

    let processedQuotes = ServiceComparison.filterQuotes(allQuotes, filters);
    processedQuotes = ServiceComparison.sortQuotes(processedQuotes, sortBy);
    return processedQuotes;
  }, [allQuotes, sortBy, filters]);

  const generateQuotes = useCallback(async () => {
    setLoading(true);
    try {
      // Remove unnecessary delay for better performance
      const generatedQuotes = pricingCalculator.generateQuotes(currentRequest);
      setAllQuotes(generatedQuotes);
    } catch (error) {
      console.error('Error generating quotes:', error);
      setAllQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [currentRequest]);

  useEffect(() => {
    generateQuotes();
  }, [generateQuotes]);

  const handleSelectQuote = useCallback((quoteId: string) => {
    if (!isAuthenticated) {
      // Store intended action for after login
      sessionStorage.setItem('pendingAction', JSON.stringify({
        type: 'book_shipment',
        quoteId,
        searchData: searchData || currentRequest
      }));

      // Redirect to login page with return URL
      router.push('/auth/login?redirect=/quotes');
      return;
    }

    // User is authenticated, proceed to booking
    setSelectedQuote(quoteId);
    const selectedQuoteData = allQuotes.find(q => q.id === quoteId);
    if (selectedQuoteData) {
      // Navigate to shipping page with pre-filled data
      const params = new URLSearchParams({
        courier: selectedQuoteData.courierService.name,
        quoteId: quoteId,
        from: searchData?.fromCity || currentRequest.fromCity,
        to: searchData?.toCity || currentRequest.toCity,
        weight: (searchData?.weight || currentRequest.weight).toString(),
      });
      router.push(`/ship?${params.toString()}`);
    }
  }, [isAuthenticated, router, searchData, currentRequest, allQuotes]);

  const toggleBreakdown = useCallback((quoteId: string) => {
    setShowBreakdown(showBreakdown === quoteId ? null : quoteId);
  }, [showBreakdown]);

  const getDeliveryText = useCallback((quote: CourierQuote) => {
    if (quote.delivery.minDays === quote.delivery.maxDays) {
      return `${quote.delivery.minDays} ${quote.delivery.minDays === 1 ? 'day' : 'days'}`;
    }
    return `${quote.delivery.minDays}-${quote.delivery.maxDays} days`;
  }, []);

  const getRatingStars = useCallback((rating: number) => {
    return <RatingStars rating={rating} />;
  }, []);

  if (loading) {
    return <Loading size='lg' text='Generating quotes...' className='min-h-screen' />;
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Shipping Quotes</h1>
                <p className='text-gray-600'>
                  Compare rates from {allQuotes.length} courier partners for your shipment
                </p>
                {searchData && (
                  <div className='mt-2 text-sm text-blue-600'>
                    📍 {searchData.fromCity} → {searchData.toCity} • {searchData.weight} KG
                  </div>
                )}
              </div>
              <div className='mt-4 lg:mt-0 flex space-x-2'>
                <Button
                  variant={comparisonMode ? 'default' : 'outline'}
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  {comparisonMode ? '📊 Comparison View' : '📋 List View'}
                </Button>
                {quotes.length > 1 && (
                  <Button variant='outline' onClick={() => setShowComparisonModal(true)}>
                    ⚖️ Detailed Compare
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Shipment Summary */}
          <div className='mb-6'>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Shipment Details</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <p className='text-gray-600'>From</p>
                  <p className='font-medium capitalize'>
                    {searchData?.fromCity || currentRequest.fromCity}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>To</p>
                  <p className='font-medium capitalize'>
                    {searchData?.toCity || currentRequest.toCity}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>Package</p>
                  <p className='font-medium'>
                    {searchData?.weight || currentRequest.weight} KG, {currentRequest.dimensions.length} × {currentRequest.dimensions.width} × {currentRequest.dimensions.height} cm
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sample Request Selector */}
          <div className='mb-6'>
            <Card className='p-4'>
              <h3 className='font-medium mb-3'>Try Different Scenarios</h3>
              <div className='flex flex-wrap gap-2'>
                {SAMPLE_SHIPPING_REQUESTS.map(sample => (
                  <Button
                    key={sample.id}
                    variant={currentRequest === sample.request ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentRequest(sample.request)}
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Comparison Summary */}
          {!loading && quotes.length > 0 && <ComparisonSummary quotes={quotes} />}

          {/* Sort and Filter Controls */}
          {!loading && allQuotes.length > 0 && (
            <SortFilterControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              filters={filters}
              onFiltersChange={setFilters}
              quotesCount={quotes.length}
              totalQuotes={allQuotes.length}
            />
          )}

          {/* Quotes */}
          {quotes.length === 0 ? (
            <Card className='p-8 text-center'>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No quotes available</h3>
              <p className='text-gray-600'>
                {allQuotes.length > 0
                  ? 'No quotes match your current filters. Try adjusting your criteria.'
                  : 'Unable to generate quotes for this route. Please try a different destination.'}
              </p>
              {allQuotes.length > 0 && (
                <Button variant='outline' className='mt-4' onClick={() => setFilters({})}>
                  Clear All Filters
                </Button>
              )}
            </Card>
          ) : comparisonMode ? (
            // Comparison Table View
            <Card className='overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Courier Service
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Delivery Time
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Rating
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Features
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {quotes.map(quote => (
                      <tr key={quote.id} className={quote.isRecommended ? 'bg-blue-50' : ''}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <span className='text-2xl mr-3'>{quote.courierService.logo}</span>
                            <div>
                              <div className='text-sm font-medium text-gray-900'>
                                {quote.courierService.displayName}
                                {quote.isRecommended && (
                                  <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {quote.serviceType.displayName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-lg font-semibold text-gray-900'>
                            {formatCurrency(quote.pricing.totalPrice)}
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleBreakdown(quote.id)}
                            className='mt-1'
                          >
                            {showBreakdown === quote.id ? 'Hide' : 'Show'} Details
                          </Button>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {getDeliveryText(quote)}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {quote.delivery.workingDaysOnly ? 'Working days' : 'Calendar days'}
                          </div>
                          <div className='text-xs text-gray-400'>
                            Cutoff: {quote.delivery.cutoffTime}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {getRatingStars(quote.courierService.rating)}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex flex-wrap gap-1'>
                            {quote.features.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
                              >
                                {feature}
                              </span>
                            ))}
                            {quote.features.length > 3 && (
                              <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'>
                                +{quote.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <Button
                            onClick={() => handleSelectQuote(quote.id)}
                            variant={quote.isRecommended ? 'default' : 'outline'}
                            size='sm'
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Breakdown Rows */}
              {quotes.map(
                quote =>
                  showBreakdown === quote.id && (
                    <div
                      key={`breakdown-${quote.id}`}
                      className='border-t border-gray-200 bg-gray-50 px-6 py-4'
                    >
                      <h4 className='font-medium mb-3'>
                        Price Breakdown - {quote.courierService.displayName}
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span>Base Price</span>
                            <span>{formatCurrency(quote.pricing.basePrice)}</span>
                          </div>

                          {quote.pricing.additionalCharges.map((charge, index) => (
                            <div key={index} className='flex justify-between text-gray-600'>
                              <span>{charge.name}</span>
                              <span>+{formatCurrency(charge.amount)}</span>
                            </div>
                          ))}
                        </div>
                        <div className='space-y-2 text-sm'>
                          {quote.pricing.discounts.map((discount, index) => (
                            <div key={index} className='flex justify-between text-green-600'>
                              <span>{discount.name}</span>
                              <span>-{formatCurrency(discount.amount)}</span>
                            </div>
                          ))}

                          {quote.pricing.taxes.map((tax, index) => (
                            <div key={index} className='flex justify-between text-gray-600'>
                              <span>{tax.name}</span>
                              <span>+{formatCurrency(tax.amount)}</span>
                            </div>
                          ))}

                          <div className='flex justify-between font-semibold pt-2 border-t border-gray-300'>
                            <span>Total Amount</span>
                            <span>{formatCurrency(quote.pricing.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </Card>
          ) : (
            // List View (existing card layout)
            <div className='space-y-4'>
              {quotes.map(quote => (
                <Card
                  key={quote.id}
                  className={`p-6 transition-all duration-200 ${quote.isRecommended ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    } ${selectedQuote === quote.id ? 'ring-2 ring-green-500' : ''}`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      {/* Courier Header */}
                      <div className='flex items-center mb-4'>
                        <span className='text-2xl mr-3'>{quote.courierService.logo}</span>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {quote.courierService.displayName}
                            {quote.isRecommended && (
                              <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                Recommended
                              </span>
                            )}
                          </h3>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            {getRatingStars(quote.courierService.rating)}
                            <span>• {quote.serviceType.displayName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                        <div>
                          <p className='text-sm text-gray-600'>Delivery Time</p>
                          <p className='font-medium'>{getDeliveryText(quote)}</p>
                          <p className='text-xs text-gray-500'>
                            {quote.delivery.workingDaysOnly ? 'Working days only' : 'Calendar days'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>Cutoff Time</p>
                          <p className='font-medium'>{quote.delivery.cutoffTime}</p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>Confidence</p>
                          <p className='font-medium'>{quote.confidence}%</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className='mb-4'>
                        <p className='text-sm text-gray-600 mb-2'>Features</p>
                        <div className='flex flex-wrap gap-2'>
                          {quote.features.map((feature, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className='text-right ml-6'>
                      <div className='text-2xl font-bold text-gray-900 mb-2'>
                        {formatCurrency(quote.pricing.totalPrice)}
                      </div>
                      <p className='text-sm text-gray-600 mb-3'>All inclusive</p>

                      <div className='space-y-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => toggleBreakdown(quote.id)}
                          className='w-full'
                        >
                          {showBreakdown === quote.id ? 'Hide' : 'Show'} Breakdown
                        </Button>

                        <Button
                          onClick={() => handleSelectQuote(quote.id)}
                          className='w-full'
                          variant={quote.isRecommended ? 'default' : 'outline'}
                        >
                          Select This Quote
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {showBreakdown === quote.id && (
                    <div className='mt-6 pt-4 border-t border-gray-200'>
                      <h4 className='font-medium mb-3'>Price Breakdown</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Base Price</span>
                          <span>{formatCurrency(quote.pricing.basePrice)}</span>
                        </div>

                        {quote.pricing.additionalCharges.map((charge, index) => (
                          <div key={index} className='flex justify-between text-gray-600'>
                            <span>{charge.name}</span>
                            <span>+{formatCurrency(charge.amount)}</span>
                          </div>
                        ))}

                        {quote.pricing.discounts.map((discount, index) => (
                          <div key={index} className='flex justify-between text-green-600'>
                            <span>{discount.name}</span>
                            <span>-{formatCurrency(discount.amount)}</span>
                          </div>
                        ))}

                        {quote.pricing.taxes.map((tax, index) => (
                          <div key={index} className='flex justify-between text-gray-600'>
                            <span>{tax.name}</span>
                            <span>+{formatCurrency(tax.amount)}</span>
                          </div>
                        ))}

                        <div className='flex justify-between font-semibold pt-2 border-t border-gray-200'>
                          <span>Total Amount</span>
                          <span>{formatCurrency(quote.pricing.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Enhanced Bottom Actions */}
          <div className='mt-8 text-center space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button variant='outline' onClick={generateQuotes}>
                🔄 Refresh Quotes
              </Button>
              {quotes.length > 1 && (
                <>
                  <Button variant='outline' onClick={() => setComparisonMode(!comparisonMode)}>
                    {comparisonMode ? '📋 Switch to List View' : '📊 Switch to Comparison View'}
                  </Button>
                  <Button variant='outline' onClick={() => setShowComparisonModal(true)}>
                    ⚖️ Detailed Compare
                  </Button>
                </>
              )}
              {allQuotes.length > quotes.length && (
                <Button variant='outline' onClick={() => setFilters({})}>
                  🔍 Show All {allQuotes.length} Options
                </Button>
              )}
            </div>

            {/* Export Options */}
            {quotes.length > 0 && (
              <div className='flex flex-col sm:flex-row gap-2 justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => QuoteExporter.exportQuotesAsCSV(currentRequest, quotes)}
                >
                  📊 Export CSV
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => QuoteExporter.exportQuotesAsPDF(currentRequest, quotes)}
                >
                  📄 Export PDF
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={async () => {
                    try {
                      await QuoteExporter.copyQuotesToClipboard(currentRequest, quotes);
                      alert('Quotes copied to clipboard!');
                    } catch (err) {
                      console.error('Failed to copy:', err);
                      alert('Failed to copy quotes');
                    }
                  }}
                >
                  📋 Copy to Clipboard
                </Button>
              </div>
            )}

            {quotes.length > 0 && (
              <div className='text-sm text-gray-500'>
                💡 Tip: Use filters to narrow down options or comparison view to see all details at
                once
              </div>
            )}
          </div>
        </div>

        {/* Comparison Modal */}
        <ComparisonModal
          quotes={quotes}
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          onSelectQuote={handleSelectQuote}
        />
      </div>
    </Layout>
  );
}
