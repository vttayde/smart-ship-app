import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Award, Check, Clock, DollarSign, Loader2, Shield, Star, Truck } from 'lucide-react';
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
    fuelSurcharge?: number;
    gstAmount?: number;
    otherCharges?: number;
    estimatedDelivery: string;
    transitTime: string;
    features: string[];
    deliveryDate: string;
    isRecommended: boolean;
    savingsFromHighest: number;
    courierRating: number;
    trackingAvailable: boolean;
    insuranceIncluded: boolean;
    codAvailable: boolean;
}

interface QuoteResponse {
    success: boolean;
    quotes: QuoteData[];
    metadata: {
        totalQuotes: number;
        cheapestPrice: number;
        fastestDelivery: number;
        availableServices: string[];
        timestamp: string;
        route: {
            from: string;
            to: string;
            distance: string;
        };
    };
}

interface EnhancedQuoteComparisonProps {
    pickup: {
        name: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    delivery: {
        name: string;
        phone: string;
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
    onQuoteSelect: (quote: QuoteData) => void;
}

export default function EnhancedQuoteComparison({
    pickup,
    delivery,
    shipment,
    onQuoteSelect
}: EnhancedQuoteComparisonProps) {
    const [quotes, setQuotes] = useState<QuoteData[]>([]);
    const [metadata, setMetadata] = useState<QuoteResponse['metadata'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'price' | 'time' | 'rating'>('price');

    useEffect(() => {
        fetchQuotes();
    }, [pickup, delivery, shipment]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchQuotes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/quotes/enhanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pickup,
                    delivery,
                    shipment,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }

            const data: QuoteResponse = await response.json();

            if (data.success) {
                setQuotes(data.quotes);
                setMetadata(data.metadata);
            } else {
                throw new Error('No quotes available');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
        } finally {
            setLoading(false);
        }
    };

    const sortedQuotes = [...quotes].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.totalAmount - b.totalAmount;
            case 'time':
                return a.serviceType.estimatedDays - b.serviceType.estimatedDays;
            case 'rating':
                return b.courierRating - a.courierRating;
            default:
                return 0;
        }
    });

    const handleQuoteSelect = (quote: QuoteData) => {
        setSelectedQuote(quote.courierCode);
        onQuoteSelect(quote);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getRecommendationBadge = (quote: QuoteData) => {
        if (quote.isRecommended) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <Award className="w-3 h-3 mr-1" />
                    Best Price
                </Badge>
            );
        }
        if (quote.serviceType.isExpressDelivery && quote.serviceType.estimatedDays === 1) {
            return (
                <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Fastest
                </Badge>
            );
        }
        if (quote.courierRating >= 4.5) {
            return (
                <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">
                    <Star className="w-3 h-3 mr-1" />
                    Top Rated
                </Badge>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span className="text-lg">Getting best quotes for you...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={fetchQuotes} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            {metadata && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Quote Comparison</span>
                            <Badge variant="outline">{metadata.totalQuotes} options found</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-800">
                                    {formatCurrency(metadata.cheapestPrice)}
                                </div>
                                <div className="text-sm text-green-600">Starting from</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-800">
                                    {metadata.fastestDelivery} day{metadata.fastestDelivery > 1 ? 's' : ''}
                                </div>
                                <div className="text-sm text-blue-600">Fastest delivery</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-purple-800">
                                    {metadata.availableServices.length}
                                </div>
                                <div className="text-sm text-purple-600">Courier partners</div>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <strong>Route:</strong> {metadata.route.from} → {metadata.route.to}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sort Controls */}
            <div className="flex gap-2">
                <Button
                    variant={sortBy === 'price' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price')}
                >
                    Sort by Price
                </Button>
                <Button
                    variant={sortBy === 'time' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('time')}
                >
                    Sort by Speed
                </Button>
                <Button
                    variant={sortBy === 'rating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('rating')}
                >
                    Sort by Rating
                </Button>
            </div>

            {/* Quote Cards */}
            <div className="grid gap-4">
                {sortedQuotes.map((quote) => (
                    <Card
                        key={`${quote.courierCode}-${quote.serviceType.code}`}
                        className={`cursor-pointer transition-all duration-200 ${selectedQuote === quote.courierCode
                                ? 'ring-2 ring-blue-500 border-blue-200'
                                : 'hover:shadow-lg'
                            }`}
                    >
                        <CardContent className="p-6">
                            <div onClick={() => handleQuoteSelect(quote)} className="w-full">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">{quote.courierName}</h3>
                                            {getRecommendationBadge(quote)}
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600 ml-1">
                                                    {quote.courierRating}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-lg text-gray-700 mb-1">
                                            {quote.serviceType.name}
                                        </div>

                                        <div className="text-sm text-gray-500 mb-3">
                                            {quote.serviceType.description}
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {quote.trackingAvailable && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Live Tracking
                                                </Badge>
                                            )}
                                            {quote.insuranceIncluded && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Insurance
                                                </Badge>
                                            )}
                                            {quote.codAvailable && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <DollarSign className="w-3 h-3 mr-1" />
                                                    COD Available
                                                </Badge>
                                            )}
                                            {quote.serviceType.isExpressDelivery && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Express
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Pricing Breakdown */}
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Base charges:</span>
                                                <span>{formatCurrency(quote.baseAmount)}</span>
                                            </div>
                                            {quote.fuelSurcharge && quote.fuelSurcharge > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Fuel surcharge:</span>
                                                    <span>{formatCurrency(quote.fuelSurcharge)}</span>
                                                </div>
                                            )}
                                            {quote.gstAmount && quote.gstAmount > 0 && (
                                                <div className="flex justify-between">
                                                    <span>GST:</span>
                                                    <span>{formatCurrency(quote.gstAmount)}</span>
                                                </div>
                                            )}
                                            {quote.otherCharges && quote.otherCharges > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Other charges:</span>
                                                    <span>{formatCurrency(quote.otherCharges)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right ml-6">
                                        <div className="text-3xl font-bold text-green-600 mb-1">
                                            {formatCurrency(quote.totalAmount)}
                                        </div>

                                        <div className="text-sm text-gray-500 mb-2">
                                            Delivery in {quote.transitTime}
                                        </div>

                                        <div className="text-sm font-medium text-blue-600 mb-3">
                                            By {new Date(quote.deliveryDate).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>

                                        {quote.savingsFromHighest > 0 && (
                                            <div className="text-xs text-green-600 mb-3">
                                                Save {formatCurrency(quote.savingsFromHighest)}
                                            </div>
                                        )}

                                        <Button
                                            className="w-full"
                                            variant={selectedQuote === quote.courierCode ? 'default' : 'outline'}
                                        >
                                            {selectedQuote === quote.courierCode ? 'Selected' : 'Select'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {quotes.length === 0 && !loading && (
                <div className="text-center p-8 text-gray-500">
                    No quotes available for this route. Please try again later.
                </div>
            )}
        </div>
    );
}
