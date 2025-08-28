import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Clock, Star, Shield, Truck } from "lucide-react"

interface CourierComparisonCardProps {
  name: string
  logo?: string
  price: number
  estimatedDays: string
  rating: number
  features: string[]
  isRecommended?: boolean
  onSelect: () => void
}

export function CourierComparisonCard({
  name,
  logo,
  price,
  estimatedDays,
  rating,
  features,
  isRecommended = false,
  onSelect
}: CourierComparisonCardProps) {
  return (
    <Card className={`relative hover:shadow-lg transition-shadow ${
      isRecommended ? "ring-2 ring-blue-500" : ""
    }`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white">
            Recommended
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {logo ? (
              <img src={logo} alt={name} className="h-8 w-8" />
            ) : (
              <Truck className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{rating}/5</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{price}</p>
            <p className="text-sm text-gray-500">incl. GST</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Delivery Time */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{estimatedDays}</span>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          {/* Select Button */}
          <Button 
            onClick={onSelect}
            className={`w-full ${
              isRecommended 
                ? "bg-blue-600 hover:bg-blue-700" 
                : ""
            }`}
          >
            Select {name}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
