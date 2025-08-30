'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Package,
    Search,
    Trash2,
    Truck,
    Upload,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

interface BulkShipment {
    id: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    city: string;
    state: string;
    pincode: string;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    value: number;
    productDescription: string;
    courier?: string;
    estimatedCost?: number;
    status: 'pending' | 'validated' | 'error' | 'shipped';
    errors?: string[];
}

interface BulkOperationsProps {
    className?: string;
}

export default function BulkOperations({ className = '' }: BulkOperationsProps) {
    const [shipments, setShipments] = useState<BulkShipment[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'error'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock data for demonstration
    const mockShipments: BulkShipment[] = useMemo(() => [
        {
            id: '1',
            recipientName: 'John Smith',
            recipientPhone: '+1-555-0123',
            recipientAddress: '123 Main St, Apt 4B',
            city: 'New York',
            state: 'NY',
            pincode: '10001',
            weight: 2.5,
            dimensions: { length: 30, width: 20, height: 15 },
            value: 150,
            productDescription: 'Electronics - Smartphone',
            courier: 'FedEx Express',
            estimatedCost: 25.99,
            status: 'validated',
        },
        {
            id: '2',
            recipientName: 'Sarah Johnson',
            recipientPhone: '+1-555-0124',
            recipientAddress: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            pincode: '90210',
            weight: 1.2,
            dimensions: { length: 25, width: 15, height: 10 },
            value: 75,
            productDescription: 'Clothing - T-shirt',
            status: 'pending',
        },
        {
            id: '3',
            recipientName: 'Mike Wilson',
            recipientPhone: '+1-555-0125',
            recipientAddress: '789 Pine St',
            city: 'Chicago',
            state: '',
            pincode: '60601',
            weight: 3.8,
            dimensions: { length: 40, width: 30, height: 20 },
            value: 200,
            productDescription: 'Books',
            status: 'error',
            errors: ['State is required', 'Weight exceeds 3kg limit for standard shipping'],
        },
    ], []);

    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!file.name.endsWith('.csv')) {
                alert('Please upload a CSV file');
                return;
            }

            setIsProcessing(true);
            setUploadProgress(0);

            // Simulate file processing
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsProcessing(false);
                        setShipments(mockShipments);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        },
        [mockShipments]
    );

    const validateShipments = useCallback(() => {
        setShipments(prev =>
            prev.map(shipment => {
                const errors: string[] = [];

                if (!shipment.state) errors.push('State is required');
                if (shipment.weight > 3) errors.push('Weight exceeds 3kg limit for standard shipping');
                if (shipment.pincode.length !== 5 && shipment.pincode.length !== 6) {
                    errors.push('Invalid pincode format');
                }
                if (!shipment.recipientPhone.match(/^\+?[\d\s\-\(\)]+$/)) {
                    errors.push('Invalid phone number format');
                }

                return {
                    ...shipment,
                    status: errors.length > 0 ? 'error' : ('validated' as const),
                    errors: errors.length > 0 ? errors : undefined,
                    courier: errors.length === 0 ? 'Smart Logistics' : undefined,
                    estimatedCost:
                        errors.length === 0
                            ? Math.round((shipment.weight * 8 + shipment.value * 0.02) * 100) / 100
                            : undefined,
                };
            })
        );
    }, []);

    const processShipments = useCallback(() => {
        const validShipments = shipments.filter(s => s.status === 'validated');
        if (validShipments.length === 0) {
            alert('No valid shipments to process');
            return;
        }

        setIsProcessing(true);

        // Simulate processing
        setTimeout(() => {
            setShipments(prev =>
                prev.map(shipment =>
                    shipment.status === 'validated' ? { ...shipment, status: 'shipped' as const } : shipment
                )
            );
            setIsProcessing(false);
            alert(`Successfully processed ${validShipments.length} shipments`);
        }, 2000);
    }, [shipments]);

    const downloadTemplate = () => {
        const csvContent = `Recipient Name,Recipient Phone,Recipient Address,City,State,Pincode,Weight (kg),Length (cm),Width (cm),Height (cm),Value ($),Product Description
John Doe,+1-555-0123,123 Main Street,New York,NY,10001,2.5,30,20,15,150,Sample Product
Jane Smith,+1-555-0124,456 Oak Avenue,Los Angeles,CA,90210,1.2,25,15,10,75,Another Product`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_shipments_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportResults = () => {
        const csvContent = [
            'ID,Recipient Name,Status,Courier,Estimated Cost,Errors',
            ...shipments.map(
                s =>
                    `${s.id},${s.recipientName},${s.status},${s.courier || ''},${s.estimatedCost || ''},"${s.errors?.join('; ') || ''}"`
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_shipments_results.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredShipments = shipments.filter(shipment => {
        const matchesFilter = filter === 'all' || shipment.status === filter;
        const matchesSearch =
            searchTerm === '' ||
            shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.productDescription.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: BulkShipment['status']) => {
        switch (status) {
            case 'validated':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: BulkShipment['status']) => {
        switch (status) {
            case 'validated':
                return <CheckCircle className='w-4 h-4' />;
            case 'shipped':
                return <Truck className='w-4 h-4' />;
            case 'error':
                return <AlertCircle className='w-4 h-4' />;
            case 'pending':
                return <Clock className='w-4 h-4' />;
            default:
                return <Package className='w-4 h-4' />;
        }
    };

    const stats = {
        total: shipments.length,
        pending: shipments.filter(s => s.status === 'pending').length,
        validated: shipments.filter(s => s.status === 'validated').length,
        error: shipments.filter(s => s.status === 'error').length,
        shipped: shipments.filter(s => s.status === 'shipped').length,
        totalCost: shipments
            .filter(s => s.estimatedCost)
            .reduce((sum, s) => sum + (s.estimatedCost || 0), 0),
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Bulk Operations</h1>
                    <p className='text-gray-600 mt-1'>Upload and process multiple shipments at once</p>
                </div>
                <div className='flex items-center space-x-3'>
                    <Button variant='outline' onClick={downloadTemplate}>
                        <Download className='w-4 h-4 mr-2' />
                        Download Template
                    </Button>
                    {shipments.length > 0 && (
                        <Button variant='outline' onClick={exportResults}>
                            <Download className='w-4 h-4 mr-2' />
                            Export Results
                        </Button>
                    )}
                </div>
            </div>

            {/* Upload Section */}
            <Card className='p-6'>
                <div className='text-center'>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-8'>
                        <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Upload Bulk Shipments</h3>
                        <p className='text-gray-600 mb-4'>
                            Upload a CSV file with your shipment details. Maximum 1000 shipments per file.
                        </p>

                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='.csv'
                            onChange={handleFileUpload}
                            className='hidden'
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className='mb-4'
                        >
                            <Upload className='w-4 h-4 mr-2' />
                            {isProcessing ? 'Processing...' : 'Choose CSV File'}
                        </Button>

                        {isProcessing && (
                            <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
                                <div
                                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}

                        <p className='text-sm text-gray-500'>
                            Supported format: CSV. Required fields: Recipient Name, Address, City, State, Pincode
                        </p>
                    </div>
                </div>
            </Card>

            {/* Statistics */}
            {shipments.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
                        <div className='text-sm text-gray-600'>Total</div>
                    </Card>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-yellow-600'>{stats.pending}</div>
                        <div className='text-sm text-gray-600'>Pending</div>
                    </Card>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-green-600'>{stats.validated}</div>
                        <div className='text-sm text-gray-600'>Validated</div>
                    </Card>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-red-600'>{stats.error}</div>
                        <div className='text-sm text-gray-600'>Errors</div>
                    </Card>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-blue-600'>{stats.shipped}</div>
                        <div className='text-sm text-gray-600'>Shipped</div>
                    </Card>
                    <Card className='p-4 text-center'>
                        <div className='text-2xl font-bold text-green-600'>${stats.totalCost.toFixed(2)}</div>
                        <div className='text-sm text-gray-600'>Total Cost</div>
                    </Card>
                </div>
            )}

            {/* Actions */}
            {shipments.length > 0 && (
                <Card className='p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center space-x-4'>
                            {/* Filter */}
                            <div className='flex items-center space-x-2'>
                                <Filter className='w-4 h-4 text-gray-500' />
                                <select
                                    value={filter}
                                    onChange={e => setFilter(e.target.value as typeof filter)}
                                    className='border border-gray-300 rounded px-3 py-1 text-sm'
                                >
                                    <option value='all'>All Status</option>
                                    <option value='pending'>Pending</option>
                                    <option value='validated'>Validated</option>
                                    <option value='error'>Errors</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div className='flex items-center space-x-2'>
                                <Search className='w-4 h-4 text-gray-500' />
                                <input
                                    type='text'
                                    placeholder='Search shipments...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className='border border-gray-300 rounded px-3 py-1 text-sm w-64'
                                />
                            </div>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <Button variant='outline' onClick={validateShipments} disabled={isProcessing}>
                                <CheckCircle className='w-4 h-4 mr-2' />
                                Validate All
                            </Button>
                            <Button onClick={processShipments} disabled={isProcessing || stats.validated === 0}>
                                <Truck className='w-4 h-4 mr-2' />
                                Process {stats.validated} Shipments
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Shipments Table */}
            {shipments.length > 0 && (
                <Card className='overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b'>
                                <tr>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Recipient</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Destination</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Package</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Status</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Courier</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Cost</th>
                                    <th className='px-4 py-3 text-left font-medium text-gray-900'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {filteredShipments.map(shipment => (
                                    <tr key={shipment.id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3'>
                                            <div>
                                                <div className='font-medium text-gray-900'>{shipment.recipientName}</div>
                                                <div className='text-gray-500'>{shipment.recipientPhone}</div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div>
                                                <div className='text-gray-900'>
                                                    {shipment.city}, {shipment.state}
                                                </div>
                                                <div className='text-gray-500'>{shipment.pincode}</div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div>
                                                <div className='text-gray-900'>{shipment.productDescription}</div>
                                                <div className='text-gray-500'>
                                                    {shipment.weight}kg • ${shipment.value}
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <Badge
                                                className={`flex items-center space-x-1 ${getStatusColor(shipment.status)}`}
                                            >
                                                {getStatusIcon(shipment.status)}
                                                <span className='capitalize'>{shipment.status}</span>
                                            </Badge>
                                            {shipment.errors && (
                                                <div className='mt-1 text-xs text-red-600'>
                                                    {shipment.errors.join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='text-gray-900'>{shipment.courier || '-'}</div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='text-gray-900'>
                                                {shipment.estimatedCost ? `$${shipment.estimatedCost}` : '-'}
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center space-x-2'>
                                                <Button variant='ghost' size='sm'>
                                                    <Eye className='w-3 h-3' />
                                                </Button>
                                                <Button variant='ghost' size='sm'>
                                                    <Edit className='w-3 h-3' />
                                                </Button>
                                                <Button variant='ghost' size='sm'>
                                                    <Trash2 className='w-3 h-3' />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
