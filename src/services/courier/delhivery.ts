import { CourierService, CourierCredentials, ShipmentAddress, ShipmentDetails, ServiceType, RateQuote, ShipmentBooking, TrackingUpdate, CourierAPIError, CourierAuthenticationError } from './types';
import axios, { AxiosInstance } from 'axios';

interface DelhiveryRateResponse {
  delivery_charges: number;
  cod_charges: number;
  total_amount: number;
  expected_delivery_date: string;
}

interface DelhiveryBookingResponse {
  success: boolean;
  waybill: string;
  label_url: string;
  manifest_url: string;
  status: string;
}

interface DelhiveryTrackingResponse {
  ShipmentData: Array<{
    Shipment: {
      Status: {
        Status: string;
        StatusLocation: string;
        StatusDateTime: string;
        Instructions: string;
        StatusType: string;
      };
      ScanDetail: Array<{
        ScanType: string;
        ScanDateTime: string;
        ScanLocation: string;
        Instructions: string;
        StatusCode: string;
      }>;
    };
  }>;
}

export class DelhiveryService extends CourierService {
  private client: AxiosInstance;
  private readonly baseUrls = {
    sandbox: 'https://staging-express.delhivery.com',
    production: 'https://track.delhivery.com'
  };

  constructor(credentials: CourierCredentials, isProduction: boolean = false) {
    super(credentials, isProduction, 'delhivery', 'Delhivery');
    
    this.client = axios.create({
      baseURL: this.baseUrls[isProduction ? 'production' : 'sandbox'],
      headers: {
        'Authorization': `Token ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new CourierAuthenticationError(this.courierCode);
        }
        throw new CourierAPIError(
          error.message || 'Delhivery API request failed',
          this.courierCode,
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  async canDeliver(pincode: string): Promise<boolean> {
    try {
      if (!this.validatePincode(pincode)) {
        return false;
      }

      const response = await this.client.get(`/c/api/pin-codes/json/?filter_codes=${pincode}`);
      const data = response.data;
      
      return data.delivery_codes && data.delivery_codes.length > 0;
    } catch (error) {
      console.error('Error checking Delhivery pincode availability:', error);
      return false;
    }
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    // Delhivery service types based on their API documentation
    return [
      {
        code: 'E',
        name: 'Express',
        description: 'Express delivery service',
        estimatedDays: 1,
        isExpressDelivery: true,
        features: ['Express', 'Same Day in select cities']
      },
      {
        code: 'S',
        name: 'Surface',
        description: 'Standard surface delivery',
        estimatedDays: 3,
        isExpressDelivery: false,
        features: ['Standard', 'Cost Effective']
      },
      {
        code: 'C',
        name: 'Cash on Delivery',
        description: 'COD service',
        estimatedDays: 2,
        isExpressDelivery: false,
        features: ['COD', 'Payment on Delivery']
      }
    ];
  }

  async calculateRate(
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType: string = 'E'
  ): Promise<RateQuote[]> {
    try {
      const volumetricWeight = shipment.dimensions 
        ? this.calculateVolumetricWeight(shipment.dimensions)
        : 0;
      const chargeableWeight = this.getChargeableWeight(shipment.weight, volumetricWeight);

      const params = {
        pickup_postcode: pickup.pincode,
        delivery_postcode: delivery.pincode,
        weight: chargeableWeight,
        cod: shipment.codAmount || 0,
        mode: serviceType
      };

      const response = await this.client.get('/api/kinko/v1/invoice/charges/.json', { params });
      const data = response.data as DelhiveryRateResponse;

      const serviceTypes = await this.getServiceTypes();
      const selectedService = serviceTypes.find(s => s.code === serviceType) || serviceTypes[0];

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + selectedService.estimatedDays);

      return [{
        courierCode: this.courierCode,
        courierName: this.courierName,
        serviceType: selectedService,
        totalAmount: data.total_amount,
        baseAmount: data.delivery_charges,
        fuelSurcharge: 0, // Included in delivery_charges
        gstAmount: data.total_amount - data.delivery_charges - data.cod_charges,
        otherCharges: data.cod_charges,
        estimatedDelivery,
        transitTime: `${selectedService.estimatedDays} day${selectedService.estimatedDays > 1 ? 's' : ''}`,
        features: selectedService.features
      }];
    } catch (error) {
      console.error('Error calculating Delhivery rates:', error);
      throw new CourierAPIError(
        'Failed to calculate shipping rates',
        this.courierCode,
        undefined,
        error
      );
    }
  }

  async bookShipment(
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType: string,
    orderId: string
  ): Promise<ShipmentBooking> {
    try {
      const volumetricWeight = shipment.dimensions 
        ? this.calculateVolumetricWeight(shipment.dimensions)
        : 0;
      const chargeableWeight = this.getChargeableWeight(shipment.weight, volumetricWeight);

      const bookingData = {
        shipments: [{
          name: delivery.name,
          add: `${delivery.addressLine1} ${delivery.addressLine2 || ''}`.trim(),
          pin: delivery.pincode,
          city: delivery.city,
          state: delivery.state,
          country: delivery.country || 'India',
          phone: this.formatPhoneNumber(delivery.phone),
          order: orderId,
          payment_mode: shipment.codAmount ? 'COD' : 'Prepaid',
          return_pin: pickup.pincode,
          return_city: pickup.city,
          return_phone: this.formatPhoneNumber(pickup.phone),
          return_add: `${pickup.addressLine1} ${pickup.addressLine2 || ''}`.trim(),
          return_state: pickup.state,
          return_country: pickup.country || 'India',
          products_desc: shipment.contents,
          hsn_code: '',
          cod_amount: shipment.codAmount || 0,
          order_date: new Date().toISOString().split('T')[0],
          total_amount: shipment.declaredValue,
          seller_add: `${pickup.addressLine1} ${pickup.addressLine2 || ''}`.trim(),
          seller_name: pickup.name,
          seller_inv: orderId,
          quantity: 1,
          waybill: '',
          shipment_width: shipment.dimensions?.width || 10,
          shipment_height: shipment.dimensions?.height || 10,
          weight: chargeableWeight,
          seller_gst_tin: '',
          shipping_mode: serviceType,
          address_type: 'home'
        }],
        pickup_location: {
          name: pickup.name,
          add: `${pickup.addressLine1} ${pickup.addressLine2 || ''}`.trim(),
          city: pickup.city,
          pin_code: pickup.pincode,
          country: pickup.country || 'India',
          phone: this.formatPhoneNumber(pickup.phone)
        }
      };

      const response = await this.client.post('/api/cmu/create.json', bookingData);
      const data = response.data as DelhiveryBookingResponse;

      if (!data.success) {
        throw new CourierAPIError(
          'Delhivery booking failed',
          this.courierCode,
          response.status,
          data
        );
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2); // Default 2 days

      return {
        courierOrderId: data.waybill,
        courierTrackingId: data.waybill,
        airwayBill: data.waybill,
        labelUrl: data.label_url,
        manifestUrl: data.manifest_url,
        estimatedDelivery,
        totalAmount: shipment.declaredValue,
        rawResponse: data
      };
    } catch (error) {
      console.error('Error booking Delhivery shipment:', error);
      throw new CourierAPIError(
        'Failed to book shipment with Delhivery',
        this.courierCode,
        undefined,
        error
      );
    }
  }

  async trackShipment(trackingId: string): Promise<TrackingUpdate[]> {
    try {
      const response = await this.client.get(`/api/v1/packages/json/?waybill=${trackingId}`);
      const data = response.data as DelhiveryTrackingResponse;

      const updates: TrackingUpdate[] = [];

      if (data.ShipmentData && data.ShipmentData.length > 0) {
        const shipment = data.ShipmentData[0].Shipment;
        
        // Add current status
        if (shipment.Status) {
          updates.push({
            status: this.mapDelhiveryStatus(shipment.Status.Status),
            statusCode: shipment.Status.StatusType || shipment.Status.Status,
            location: shipment.Status.StatusLocation,
            timestamp: new Date(shipment.Status.StatusDateTime),
            description: shipment.Status.Instructions || shipment.Status.Status,
            courierStatus: shipment.Status.Status,
            rawData: shipment.Status
          });
        }

        // Add scan details
        if (shipment.ScanDetail) {
          shipment.ScanDetail.forEach(scan => {
            updates.push({
              status: this.mapDelhiveryStatus(scan.ScanType),
              statusCode: scan.StatusCode || scan.ScanType,
              location: scan.ScanLocation,
              timestamp: new Date(scan.ScanDateTime),
              description: scan.Instructions || scan.ScanType,
              courierStatus: scan.ScanType,
              rawData: scan
            });
          });
        }
      }

      return updates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error tracking Delhivery shipment:', error);
      throw new CourierAPIError(
        'Failed to track shipment',
        this.courierCode,
        undefined,
        error
      );
    }
  }

  async cancelShipment(courierOrderId: string): Promise<boolean> {
    try {
      const response = await this.client.post('/api/p/edit', {
        waybill: courierOrderId,
        cancellation: true
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Error cancelling Delhivery shipment:', error);
      return false;
    }
  }

  async generateLabel(courierOrderId: string): Promise<string> {
    try {
      const response = await this.client.get(`/api/p/packing_slip?wbn=${courierOrderId}&pdf=true`);
      return response.data.label_url || '';
    } catch (error) {
      console.error('Error generating Delhivery label:', error);
      throw new CourierAPIError(
        'Failed to generate shipping label',
        this.courierCode,
        undefined,
        error
      );
    }
  }

  async schedulePickup(courierOrderId: string, pickupDate: Date): Promise<boolean> {
    try {
      const response = await this.client.post('/fm/request/new/', {
        pickup_date: pickupDate.toISOString().split('T')[0],
        pickup_time: '14:00:00',
        expected_package_count: 1,
        waybill: courierOrderId
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Error scheduling Delhivery pickup:', error);
      return false;
    }
  }

  private mapDelhiveryStatus(delhiveryStatus: string): string {
    const statusMap: Record<string, string> = {
      'Shipped': 'picked_up',
      'In Transit': 'in_transit',
      'Out for Delivery': 'out_for_delivery',
      'Delivered': 'delivered',
      'RTO': 'returned',
      'Pending': 'pending',
      'Dispatched': 'picked_up',
      'Reached at destination hub': 'in_transit',
      'Out For Delivery': 'out_for_delivery',
      'Delivered/Shipment Delivered': 'delivered'
    };

    return statusMap[delhiveryStatus] || 'in_transit';
  }
}
