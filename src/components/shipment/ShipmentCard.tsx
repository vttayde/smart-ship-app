import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Package, MapPin, Clock, IndianRupee } from "lucide-react"

interface ShipmentCardProps {
  id: string
  trackingNumber: string
  status: "pending" | "picked" | "in-transit" | "delivered" | "cancelled"
  courierPartner: string
  origin: string
  destination: string
  estimatedDelivery: string
  amount: number
  onTrack?: () => void
  onViewDetails?: () => void
}

const statusConfig = {
  pending: { color: "warning", label: "Pending" },
  picked: { color: "info", label: "Picked Up" },
  "in-transit": { color: "info", label: "In Transit" },
  delivered: { color: "success", label: "Delivered" },
  cancelled: { color: "destructive", label: "Cancelled" }
}

export function ShipmentCard({
  id,
  trackingNumber,
  status,
  courierPartner,
  origin,
  destination,
  estimatedDelivery,
  amount,
  onTrack,
  onViewDetails
}: ShipmentCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {trackingNumber}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{courierPartner}</p>
          </div>
          <Badge variant={statusInfo.color as any}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Route Information */}
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{origin}</span>
                <span className="text-gray-400 mx-2">→</span>
                <span className="font-medium">{destination}</span>
              </p>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              Est. Delivery: {estimatedDelivery}
            </p>
          </div>

          {/* Amount */}
          <div className="flex items-center space-x-3">
            <IndianRupee className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-medium">₹{amount.toFixed(2)}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTrack}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Track
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="flex-1"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
