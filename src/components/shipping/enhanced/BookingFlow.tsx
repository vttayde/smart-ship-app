import PaymentModal from '@/components/PaymentModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Loader2,
  MapPin,
  Package,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuoteData {
  courierCode: string;
  courierName: string;
  serviceType: {
    code: string;
    name: string;
    description: string;
    estimatedDays: number;
    isExpressDelivery: boolean;
    features: string[];
  };
  totalAmount: number;
  baseAmount: number;
  estimatedDelivery: string;
  transitTime: string;
  features: string[];
}

interface BookingData {
  id: string;
  trackingNumber: string;
  courierOrderId: string;
  estimatedDelivery: Date;
  totalAmount: number;
  courierName: string;
  serviceType: string;
  labelUrl?: string;
  manifestUrl?: string;
}

interface EnhancedBookingFlowProps {
  selectedQuote: QuoteData;
  pickup: {
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  delivery: {
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  shipment: {
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    declaredValue: number;
    packageType: string;
    contents: string;
    codAmount?: number;
  };
  onBookingComplete: (booking: BookingData) => void;
}

type BookingStep = 'review' | 'payment' | 'booking' | 'confirmation';

export default function EnhancedBookingFlow({
  selectedQuote,
  pickup,
  delivery,
  shipment,
  onBookingComplete,
}: EnhancedBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('review');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [schedulePickup, setSchedulePickup] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [_paymentStatus, setPaymentStatus] = useState<
    'pending' | 'processing' | 'completed' | 'failed'
  >('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!pickupDate) {
      setPickupDate(getTomorrowDate());
    }
  }, [pickupDate]);

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    setPaymentStatus('completed');
    setShowPaymentModal(false);
    await handleBooking(paymentId, orderId);
  };

  const handleBooking = async (paymentId?: string, orderId?: string) => {
    setLoading(true);
    setError(null);
    setCurrentStep('booking');

    try {
      const bookingRequest = {
        courierCode: selectedQuote.courierCode,
        serviceType: selectedQuote.serviceType.code,
        pickup,
        delivery,
        shipment,
        deliveryInstructions,
        schedulePickup: schedulePickup
          ? {
              date: pickupDate,
              timeSlot: pickupTimeSlot,
            }
          : undefined,
        paymentId,
        orderId,
      };

      const response = await fetch('/api/bookings/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-1', // Replace with actual user ID from auth
        },
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      const data = await response.json();

      if (data.success) {
        setBookingData(data.order);
        setCurrentStep('confirmation');
        onBookingComplete(data.order);
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
      setCurrentStep('review');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (shipment.codAmount && shipment.codAmount > 0) {
      // COD - proceed directly to booking
      handleBooking();
    } else {
      // Online payment required
      setCurrentStep('payment');
      setShowPaymentModal(true);
    }
  };

  const renderReviewStep = () => (
    <div className='space-y-6'>
      {/* Selected Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-semibold text-lg mb-2'>{selectedQuote.courierName}</h3>
              <p className='text-gray-600 mb-2'>{selectedQuote.serviceType.name}</p>
              <div className='space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span>Delivery time:</span>
                  <span className='font-medium'>{selectedQuote.transitTime}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Expected delivery:</span>
                  <span className='font-medium'>{formatDate(selectedQuote.estimatedDelivery)}</span>
                </div>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-3xl font-bold text-green-600 mb-2'>
                {formatCurrency(selectedQuote.totalAmount)}
              </div>
              <div className='space-y-1 text-sm text-gray-600'>
                <div>Base: {formatCurrency(selectedQuote.baseAmount)}</div>
                <div>Total: {formatCurrency(selectedQuote.totalAmount)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <MapPin className='w-4 h-4' />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-1 text-sm'>
              <div className='font-medium'>{pickup.name}</div>
              <div>{pickup.phone}</div>
              <div>{pickup.addressLine1}</div>
              {pickup.addressLine2 && <div>{pickup.addressLine2}</div>}
              <div>
                {pickup.city}, {pickup.state} - {pickup.pincode}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <MapPin className='w-4 h-4' />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-1 text-sm'>
              <div className='font-medium'>{delivery.name}</div>
              <div>{delivery.phone}</div>
              <div>{delivery.addressLine1}</div>
              {delivery.addressLine2 && <div>{delivery.addressLine2}</div>}
              <div>
                {delivery.city}, {delivery.state} - {delivery.pincode}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Details */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Package className='w-4 h-4' />
            Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <Label className='text-gray-500'>Weight</Label>
              <div className='font-medium'>{shipment.weight} kg</div>
            </div>
            <div>
              <Label className='text-gray-500'>Package Type</Label>
              <div className='font-medium'>{shipment.packageType}</div>
            </div>
            <div>
              <Label className='text-gray-500'>Declared Value</Label>
              <div className='font-medium'>{formatCurrency(shipment.declaredValue)}</div>
            </div>
            {shipment.codAmount && (
              <div>
                <Label className='text-gray-500'>COD Amount</Label>
                <div className='font-medium'>{formatCurrency(shipment.codAmount)}</div>
              </div>
            )}
          </div>
          <div className='mt-4'>
            <Label className='text-gray-500'>Contents</Label>
            <div className='font-medium'>{shipment.contents}</div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='instructions'>Delivery Instructions (Optional)</Label>
            <Input
              id='instructions'
              placeholder='e.g., Ring doorbell, Call before delivery...'
              value={deliveryInstructions}
              onChange={e => setDeliveryInstructions(e.target.value)}
              className='mt-1'
            />
          </div>

          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <input
                type='checkbox'
                id='schedule-pickup'
                checked={schedulePickup}
                onChange={e => setSchedulePickup(e.target.checked)}
                className='rounded border-gray-300'
              />
              <Label htmlFor='schedule-pickup'>Schedule Pickup</Label>
            </div>

            {schedulePickup && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 ml-6'>
                <div>
                  <Label htmlFor='pickup-date'>Pickup Date</Label>
                  <Input
                    id='pickup-date'
                    type='date'
                    value={pickupDate}
                    min={getTomorrowDate()}
                    onChange={e => setPickupDate(e.target.value)}
                    className='mt-1'
                  />
                </div>
                <div>
                  <Label htmlFor='pickup-time'>Time Slot</Label>
                  <select
                    id='pickup-time'
                    value={pickupTimeSlot}
                    onChange={e => setPickupTimeSlot(e.target.value)}
                    className='mt-1 w-full p-2 border border-gray-300 rounded-md'
                  >
                    <option value='morning'>Morning (10 AM - 12 PM)</option>
                    <option value='afternoon'>Afternoon (2 PM - 4 PM)</option>
                    <option value='evening'>Evening (5 PM - 7 PM)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={() => window.history.back()}>
          Back to Quotes
        </Button>
        <Button onClick={handlePayment} disabled={loading} className='min-w-[150px]'>
          {loading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className='w-4 h-4 mr-2' />
              {shipment.codAmount ? 'Book with COD' : 'Proceed to Payment'}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderBookingStep = () => (
    <div className='text-center py-12'>
      <div className='mb-6'>
        <Loader2 className='w-16 h-16 animate-spin text-blue-600 mx-auto mb-4' />
        <h3 className='text-xl font-semibold mb-2'>Booking Your Shipment</h3>
        <p className='text-gray-600'>
          We&apos;re processing your booking with {selectedQuote.courierName}...
        </p>
      </div>
      <div className='text-sm text-gray-500'>
        This may take a few moments while we confirm with the courier partner.
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className='space-y-6'>
      <div className='text-center py-8'>
        <CheckCircle className='w-16 h-16 text-green-600 mx-auto mb-4' />
        <h3 className='text-2xl font-bold text-green-800 mb-2'>Booking Confirmed!</h3>
        <p className='text-gray-600'>
          Your shipment has been successfully booked with {selectedQuote.courierName}
        </p>
      </div>

      {bookingData && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div>
                  <Label className='text-gray-500'>Tracking Number</Label>
                  <div className='font-mono text-lg font-semibold'>
                    {bookingData.trackingNumber}
                  </div>
                </div>
                <div>
                  <Label className='text-gray-500'>Courier Order ID</Label>
                  <div className='font-mono'>{bookingData.courierOrderId}</div>
                </div>
                <div>
                  <Label className='text-gray-500'>Service</Label>
                  <div>
                    {bookingData.courierName} - {bookingData.serviceType}
                  </div>
                </div>
              </div>
              <div className='space-y-3'>
                <div>
                  <Label className='text-gray-500'>Total Amount</Label>
                  <div className='text-2xl font-bold text-green-600'>
                    {formatCurrency(bookingData.totalAmount)}
                  </div>
                </div>
                <div>
                  <Label className='text-gray-500'>Expected Delivery</Label>
                  <div className='font-medium'>
                    {formatDate(bookingData.estimatedDelivery.toString())}
                  </div>
                </div>
              </div>
            </div>

            {(bookingData.labelUrl || bookingData.manifestUrl) && (
              <div className='mt-6 pt-6 border-t'>
                <h4 className='font-semibold mb-3'>Downloads</h4>
                <div className='flex gap-2'>
                  {bookingData.labelUrl && (
                    <Button variant='outline' size='sm'>
                      <a
                        href={bookingData.labelUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Download className='w-4 h-4 mr-2' />
                        Shipping Label
                      </a>
                    </Button>
                  )}
                  {bookingData.manifestUrl && (
                    <Button variant='outline' size='sm'>
                      <a
                        href={bookingData.manifestUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Download className='w-4 h-4 mr-2' />
                        Manifest
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className='flex justify-center gap-4'>
        <Button variant='outline' onClick={() => (window.location.href = '/orders')}>
          <Truck className='w-4 h-4 mr-2' />
          View All Orders
        </Button>
        <Button onClick={() => (window.location.href = `/track/${bookingData?.trackingNumber}`)}>
          <Clock className='w-4 h-4 mr-2' />
          Track Shipment
        </Button>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {[
            { key: 'review', label: 'Review', icon: Package },
            { key: 'payment', label: 'Payment', icon: CreditCard },
            { key: 'booking', label: 'Booking', icon: Truck },
            { key: 'confirmation', label: 'Confirmation', icon: CheckCircle },
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted =
              ['review', 'payment', 'booking'].indexOf(currentStep) >
              ['review', 'payment', 'booking'].indexOf(step.key);

            return (
              <div key={step.key} className='flex items-center'>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isCompleted
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-12 h-0.5 ml-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'booking' && renderBookingStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedQuote.totalAmount}
          currency='INR'
          orderDetails={{
            courierName: selectedQuote.courierName,
            serviceType: selectedQuote.serviceType.name,
            weight: shipment.weight,
            route: `${pickup.city} → ${delivery.city}`,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
