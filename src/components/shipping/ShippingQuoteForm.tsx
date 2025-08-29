'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CityAutocomplete from '@/components/location/CityAutocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCourierPartners } from '@/hooks/useCourierPartners';
import { Package, ArrowRight, Calculator, User, CreditCard } from 'lucide-react';

interface CityLocation {
  city: string;
  state: string;
  fullName: string;
}

interface PackageDetails {
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
  contents: string;
}

interface ShippingFormData {
  fromLocation: CityLocation | null;
  toLocation: CityLocation | null;
  packageDetails: PackageDetails;
  deliveryType: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  courierPartnerId: string;
  serviceType: string;
  deliveryInstructions: string;
}

interface QuoteResult {
  courierPartnerId: string;
  courierName: string;
  serviceType: string;
  price: number;
  estimatedDays: number;
  rating: number;
}

export default function ShippingQuoteForm() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { profile } = useProfile();
  const { courierPartners } = useCourierPartners();

  const [formData, setFormData] = useState<ShippingFormData>({
    fromLocation: null,
    toLocation: null,
    packageDetails: {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      value: 0,
      contents: '',
    },
    deliveryType: '',
    pickupAddressId: '',
    deliveryAddressId: '',
    courierPartnerId: '',
    serviceType: '',
    deliveryInstructions: '',
  });

  const [quotes, setQuotes] = useState<QuoteResult[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedQuote, setSelectedQuote] = useState<QuoteResult | null>(null);

  // Handle location changes
  const handleFromLocationChange = (location: CityLocation | null) => {
    setFormData(prev => ({ ...prev, fromLocation: location }));
    if (errors.fromLocation) {
      setErrors(prev => ({ ...prev, fromLocation: '' }));
    }
  };

  const handleToLocationChange = (location: CityLocation | null) => {
    setFormData(prev => ({ ...prev, toLocation: location }));
    if (errors.toLocation) {
      setErrors(prev => ({ ...prev, toLocation: '' }));
    }
  };

  // Handle package details changes
  const handlePackageChange = (field: keyof PackageDetails, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      packageDetails: {
        ...prev.packageDetails,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle other form changes
  const handleFieldChange = (field: keyof ShippingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isAuthenticated) {
      newErrors.auth = 'Please log in to create shipments';
      return false;
    }

    if (!formData.fromLocation) {
      newErrors.fromLocation = 'Please select pickup location';
    }

    if (!formData.toLocation) {
      newErrors.toLocation = 'Please select delivery location';
    }

    if (
      formData.fromLocation &&
      formData.toLocation &&
      formData.fromLocation.city === formData.toLocation.city &&
      formData.fromLocation.state === formData.toLocation.state
    ) {
      newErrors.toLocation = 'Pickup and delivery locations cannot be the same';
    }

    if (!formData.packageDetails.weight || formData.packageDetails.weight <= 0) {
      newErrors.weight = 'Please enter valid weight';
    }

    if (!formData.packageDetails.length || formData.packageDetails.length <= 0) {
      newErrors.length = 'Please enter valid length';
    }

    if (!formData.packageDetails.width || formData.packageDetails.width <= 0) {
      newErrors.width = 'Please enter valid width';
    }

    if (!formData.packageDetails.height || formData.packageDetails.height <= 0) {
      newErrors.height = 'Please enter valid height';
    }

    if (!formData.packageDetails.value || formData.packageDetails.value <= 0) {
      newErrors.value = 'Please enter valid package value';
    }

    if (!formData.packageDetails.contents.trim()) {
      newErrors.contents = 'Please describe the package contents';
    }

    if (!formData.deliveryType) {
      newErrors.deliveryType = 'Please select delivery type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate shipping quotes
  const calculateQuotes = async () => {
    if (!validateForm()) return;

    setIsLoadingQuotes(true);
    try {
      // Simulate quote calculation based on package details and distance
      const volumetricWeight = getVolumetricWeight();
      const chargeableWeight = Math.max(formData.packageDetails.weight, volumetricWeight);
      
      // Generate quotes for active courier partners
      const quoteResults: QuoteResult[] = courierPartners
        .filter(partner => partner.isActive)
        .map(partner => {
          // Base price calculation (simplified)
          const basePrice = chargeableWeight * 50; // ₹50 per kg base rate
          const distanceMultiplier = Math.random() * 0.5 + 0.8; // 0.8-1.3x
          const partnerMultiplier = partner.rating / 5; // Rating-based pricing
          
          const price = Math.round(basePrice * distanceMultiplier * partnerMultiplier);
          const estimatedDays = Math.ceil(Math.random() * 3) + 1; // 1-4 days
          
          return {
            courierPartnerId: partner.id,
            courierName: partner.name,
            serviceType: formData.deliveryType,
            price,
            estimatedDays,
            rating: partner.rating,
          };
        })
        .sort((a, b) => a.price - b.price); // Sort by price

      setQuotes(quoteResults);
      setShowQuotes(true);
    } catch (error) {
      console.error('Error calculating quotes:', error);
      setErrors({ submit: 'Failed to calculate quotes. Please try again.' });
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  // Create order with selected quote
  const createOrder = async (quote: QuoteResult) => {
    setIsCreatingOrder(true);
    try {
      const orderData = {
        courierPartnerId: quote.courierPartnerId,
        serviceType: quote.serviceType,
        parcelContents: formData.packageDetails.contents,
        dimensions: {
          length: formData.packageDetails.length,
          width: formData.packageDetails.width,
          height: formData.packageDetails.height,
          weight: formData.packageDetails.weight,
        },
        declaredValue: formData.packageDetails.value,
        deliveryInstructions: formData.deliveryInstructions,
        pickupAddress: {
          name: profile?.name || user?.name || 'User',
          phone: profile?.phone || '',
          street: `${formData.fromLocation?.city}`,
          city: formData.fromLocation?.city || '',
          state: formData.fromLocation?.state || '',
          pincode: '000000', // Would be selected from form
          country: 'India',
        },
        deliveryAddress: {
          name: 'Recipient', // Would be from form
          phone: '9999999999', // Would be from form
          street: `${formData.toLocation?.city}`,
          city: formData.toLocation?.city || '',
          state: formData.toLocation?.state || '',
          pincode: '000000', // Would be selected from form
          country: 'India',
        },
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // Redirect to order details page
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ submit: 'Failed to create order. Please try again.' });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Calculate volumetric weight
  const getVolumetricWeight = () => {
    const { length, width, height } = formData.packageDetails;
    if (length > 0 && width > 0 && height > 0) {
      return Math.round(((length * width * height) / 5000) * 100) / 100;
    }
    return 0;
  };

  const volumetricWeight = getVolumetricWeight();
  const chargeableWeight = Math.max(formData.packageDetails.weight, volumetricWeight);

  if (!isAuthenticated) {
    return (
      <Card className='w-full max-w-4xl mx-auto'>
        <CardContent className="p-12 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">Please log in to create shipments and get quotes.</p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            Get Shipping Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); calculateQuotes(); }} className='space-y-6'>
            {/* Error Messages */}
            {errors.auth && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{errors.auth}</p>
              </div>
            )}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Location Selection */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <CityAutocomplete
                  label='Pickup Location'
                  placeholder='Enter pickup city...'
                  value={formData.fromLocation}
                  onChange={handleFromLocationChange}
                  required
                  className={errors.fromLocation ? 'border-red-500' : ''}
                />
                {errors.fromLocation && (
                  <p className='text-sm text-red-600 mt-1'>{errors.fromLocation}</p>
                )}
              </div>

              <div>
                <CityAutocomplete
                  label='Delivery Location'
                  placeholder='Enter delivery city...'
                  value={formData.toLocation}
                  onChange={handleToLocationChange}
                  required
                  className={errors.toLocation ? 'border-red-500' : ''}
                />
                {errors.toLocation && <p className='text-sm text-red-600 mt-1'>{errors.toLocation}</p>}
              </div>
            </div>

            {/* Package Details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Package Details
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Weight (kg) *
                  </label>
                  <Input
                    type='number'
                    step='0.1'
                    min='0.1'
                    max='100'
                    value={formData.packageDetails.weight || ''}
                    onChange={e => handlePackageChange('weight', parseFloat(e.target.value) || 0)}
                    placeholder='0.5'
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && <p className='text-sm text-red-600 mt-1'>{errors.weight}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Length (cm) *
                  </label>
                  <Input
                    type='number'
                    step='1'
                    min='1'
                    max='200'
                    value={formData.packageDetails.length || ''}
                    onChange={e => handlePackageChange('length', parseFloat(e.target.value) || 0)}
                    placeholder='30'
                    className={errors.length ? 'border-red-500' : ''}
                  />
                  {errors.length && <p className='text-sm text-red-600 mt-1'>{errors.length}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Width (cm) *
                  </label>
                  <Input
                    type='number'
                    step='1'
                    min='1'
                    max='200'
                    value={formData.packageDetails.width || ''}
                    onChange={e => handlePackageChange('width', parseFloat(e.target.value) || 0)}
                    placeholder='20'
                    className={errors.width ? 'border-red-500' : ''}
                  />
                  {errors.width && <p className='text-sm text-red-600 mt-1'>{errors.width}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Height (cm) *
                  </label>
                  <Input
                    type='number'
                    step='1'
                    min='1'
                    max='200'
                    value={formData.packageDetails.height || ''}
                    onChange={e => handlePackageChange('height', parseFloat(e.target.value) || 0)}
                    placeholder='10'
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && <p className='text-sm text-red-600 mt-1'>{errors.height}</p>}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Package Value (₹) *
                  </label>
                  <Input
                    type='number'
                    step='1'
                    min='1'
                    max='1000000'
                    value={formData.packageDetails.value || ''}
                    onChange={e => handlePackageChange('value', parseFloat(e.target.value) || 0)}
                    placeholder='1000'
                    className={errors.value ? 'border-red-500' : ''}
                  />
                  {errors.value && <p className='text-sm text-red-600 mt-1'>{errors.value}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Contents Description *
                  </label>
                  <Input
                    type='text'
                    value={formData.packageDetails.contents}
                    onChange={e => handlePackageChange('contents', e.target.value)}
                    placeholder='Books, Electronics, Clothing...'
                    className={errors.contents ? 'border-red-500' : ''}
                  />
                  {errors.contents && <p className='text-sm text-red-600 mt-1'>{errors.contents}</p>}
                </div>
              </div>

              {/* Calculated Weight Info */}
              {volumetricWeight > 0 && (
                <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
                  <h4 className='font-medium text-blue-900 mb-2'>Weight Calculation</h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                    <div>
                      <span className='text-blue-700'>Actual Weight:</span>
                      <span className='font-medium ml-2'>{formData.packageDetails.weight} kg</span>
                    </div>
                    <div>
                      <span className='text-blue-700'>Volumetric Weight:</span>
                      <span className='font-medium ml-2'>{volumetricWeight} kg</span>
                    </div>
                    <div>
                      <span className='text-blue-700'>Chargeable Weight:</span>
                      <span className='font-medium ml-2'>{chargeableWeight} kg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Delivery Type *
              </label>
              <Select 
                value={formData.deliveryType} 
                onValueChange={(value) => handleFieldChange('deliveryType', value)}
              >
                <SelectTrigger className={errors.deliveryType ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Select delivery type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='standard'>Standard Delivery</SelectItem>
                  <SelectItem value='express'>Express Delivery</SelectItem>
                  <SelectItem value='overnight'>Overnight Delivery</SelectItem>
                  <SelectItem value='same-day'>Same Day Delivery</SelectItem>
                </SelectContent>
              </Select>
              {errors.deliveryType && <p className='text-sm text-red-600 mt-1'>{errors.deliveryType}</p>}
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Delivery Instructions (Optional)
              </label>
              <Input
                type='text'
                value={formData.deliveryInstructions}
                onChange={e => handleFieldChange('deliveryInstructions', e.target.value)}
                placeholder='Leave at front door, Call before delivery...'
              />
            </div>

            {/* Submit Button */}
            <Button 
              type='submit' 
              className='w-full' 
              disabled={isLoadingQuotes}
            >
              {isLoadingQuotes ? (
                <Loading className="w-4 h-4 mr-2" />
              ) : (
                <Calculator className='w-4 h-4 mr-2' />
              )}
              {isLoadingQuotes ? 'Calculating Quotes...' : 'Get Quotes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quotes Section */}
      {showQuotes && quotes.length > 0 && (
        <Card className='w-full max-w-4xl mx-auto'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Available Quotes ({quotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotes.map((quote, index) => (
                <div 
                  key={quote.courierPartnerId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedQuote?.courierPartnerId === quote.courierPartnerId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedQuote(quote)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{quote.courierName}</h4>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Best Price
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">{quote.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Service:</span> {quote.serviceType}
                        </div>
                        <div>
                          <span className="font-medium">Delivery:</span> {quote.estimatedDays} days
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span> {chargeableWeight} kg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">₹{quote.price}</div>
                      <div className="text-sm text-gray-500">+ taxes</div>
                    </div>
                  </div>
                </div>
              ))}

              {selectedQuote && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => createOrder(selectedQuote)}
                    className="w-full"
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? (
                      <Loading className="w-4 h-4 mr-2" />
                    ) : (
                      <ArrowRight className='w-4 h-4 mr-2' />
                    )}
                    {isCreatingOrder ? 'Creating Order...' : `Book with ${selectedQuote.courierName} - ₹${selectedQuote.price}`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
