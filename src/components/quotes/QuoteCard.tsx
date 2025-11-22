import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import type { CourierQuote } from '@/data/courierData';
import { formatCurrency } from '@/lib/utils-common';
import React from 'react';

interface QuoteCardProps {
  quote: CourierQuote;
  isSelected: boolean;
  showBreakdown: boolean;
  onSelect: (id: string) => void;
  onToggleBreakdown: (id: string) => void;
  onBook: (quote: CourierQuote) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  isSelected,
  showBreakdown,
  onSelect,
  onToggleBreakdown,
  onBook,
}) => {
  const getDeliveryTime = (quote: CourierQuote) => {
    if (quote.delivery.minDays === 1 && quote.delivery.maxDays === 1) {
      return 'Same day';
    }
    if (quote.delivery.minDays === quote.delivery.maxDays) {
      return `${quote.delivery.minDays} day${quote.delivery.minDays !== 1 ? 's' : ''}`;
    }
    return `${quote.delivery.minDays}-${quote.delivery.maxDays} days`;
  };

  return (
    <div
      className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${quote.isRecommended ? 'ring-2 ring-green-500' : ''}`}
      onClick={() => onSelect(quote.id)}
    >
      {quote.isRecommended && (
        <div className='mb-3'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            ⭐ Recommended
          </span>
        </div>
      )}

      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {quote.courierService.displayName}
            </h3>
            <RatingStars rating={quote.courierService.rating} />
          </div>
          <p className='text-sm text-gray-600 mb-1'>Service: {quote.serviceType.displayName}</p>
          <p className='text-sm text-gray-600'>Delivery: {getDeliveryTime(quote)}</p>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold text-gray-900'>
            {formatCurrency(quote.pricing.totalPrice)}
          </div>
          <div className='text-sm text-gray-500'>
            Base: {formatCurrency(quote.pricing.basePrice)}
          </div>
        </div>
      </div>

      <div className='flex gap-2'>
        <Button
          onClick={e => {
            e.stopPropagation();
            onToggleBreakdown(quote.id);
          }}
          variant='outline'
          size='sm'
          className='flex-1'
        >
          {showBreakdown ? 'Hide' : 'Show'} Breakdown
        </Button>
        <Button
          onClick={e => {
            e.stopPropagation();
            onBook(quote);
          }}
          className='flex-1'
        >
          Book Now
        </Button>
      </div>

      {showBreakdown && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium text-gray-900 mb-3'>Price Breakdown</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Base Price:</span>
              <span>{formatCurrency(quote.pricing.basePrice)}</span>
            </div>
            {quote.pricing.additionalCharges.map((charge, index) => (
              <div key={index} className='flex justify-between text-orange-600'>
                <span>{charge.name}:</span>
                <span>+{formatCurrency(charge.amount)}</span>
              </div>
            ))}
            {quote.pricing.discounts.map((discount, index) => (
              <div key={index} className='flex justify-between text-green-600'>
                <span>{discount.name}:</span>
                <span>-{formatCurrency(discount.amount)}</span>
              </div>
            ))}
            {quote.pricing.taxes.map((tax, index) => (
              <div key={index} className='flex justify-between text-blue-600'>
                <span>{tax.name}:</span>
                <span>+{formatCurrency(tax.amount)}</span>
              </div>
            ))}
            <div className='border-t pt-2 flex justify-between font-medium'>
              <span>Total:</span>
              <span>{formatCurrency(quote.pricing.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
