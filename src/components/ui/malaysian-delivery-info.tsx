import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, MapPin, Package } from 'lucide-react';
import { DELIVERY_ZONES, getDeliveryInfo, MALAYSIAN_STATES } from '@/lib/malaysia-data';
import { MalaysianCurrency } from './malaysian-currency';

interface DeliveryInfoProps {
  stateCode?: string;
  city?: string;
  className?: string;
}

export const MalaysianDeliveryInfo: React.FC<DeliveryInfoProps> = ({
  stateCode,
  city,
  className = ''
}) => {
  const deliveryInfo = stateCode ? getDeliveryInfo(stateCode) : null;
  const stateName = stateCode ? MALAYSIAN_STATES.find(s => s.code === stateCode)?.name : null;

  if (!deliveryInfo && !stateCode) {
    // Show general delivery information
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-pharma-blue" />
            <span>Delivery Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(DELIVERY_ZONES).map(([zoneName, zoneInfo]) => (
              <div key={zoneName} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">{zoneName}</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Free delivery above:</span>
                    <MalaysianCurrency amount={zoneInfo.freeDeliveryThreshold} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Standard charge:</span>
                    <MalaysianCurrency amount={zoneInfo.standardCharge} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Express charge:</span>
                    <MalaysianCurrency amount={zoneInfo.expressCharge} size="sm" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Same day: {zoneInfo.sameDayAvailable ? 'Available' : 'Not available'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deliveryInfo || !stateCode) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-pharma-blue" />
          <span>Delivery to {stateName}{city ? `, ${city}` : ''}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
           <Badge className="bg-blue-100 text-blue-800">
             {Object.entries(DELIVERY_ZONES).find(([_, info]) => 
               info.states.includes(stateCode)
             )?.[0] || 'Malaysia'}
           </Badge>
          {deliveryInfo.sameDayAvailable && (
            <Badge className="bg-green-100 text-green-800">
              <Clock className="w-3 h-3 mr-1" />
              Same Day Available
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <Package className="w-4 h-4 mr-1" />
              Standard Delivery
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Charge:</span>
                <MalaysianCurrency amount={deliveryInfo.standardCharge} size="sm" />
              </div>
              <div className="flex justify-between">
                <span>Free above:</span>
                <MalaysianCurrency amount={deliveryInfo.freeDeliveryThreshold} size="sm" />
              </div>
              <div>
                <span>Timeframe: 1-3 working days</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <Truck className="w-4 h-4 mr-1" />
              Express Delivery
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Charge:</span>
                <MalaysianCurrency amount={deliveryInfo.expressCharge} size="sm" />
              </div>
              <div>
                <span>Timeframe: {deliveryInfo.sameDayAvailable ? 'Same day or next day' : 'Next working day'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> Orders placed before 2 PM {deliveryInfo.sameDayAvailable ? 'can be delivered the same day' : 'will be processed the same day'}. 
            Free delivery applies to orders above <MalaysianCurrency amount={deliveryInfo.freeDeliveryThreshold} size="sm" className="font-medium" />.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Delivery zones overview component
export const DeliveryZonesOverview: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🇲🇾 Nationwide Delivery Coverage</h2>
        <p className="text-gray-600">We deliver to all states in Malaysia with competitive rates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(DELIVERY_ZONES).map(([zoneName, zoneInfo]) => (
          <Card key={zoneName} className="border-2 hover:border-pharma-blue transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{zoneName}</span>
                {zoneInfo.sameDayAvailable && (
                  <Badge className="bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Same Day
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Free delivery above:</span>
                  <MalaysianCurrency amount={zoneInfo.freeDeliveryThreshold} size="sm" className="font-medium" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard delivery:</span>
                  <MalaysianCurrency amount={zoneInfo.standardCharge} size="sm" className="font-medium" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Express delivery:</span>
                  <MalaysianCurrency amount={zoneInfo.expressCharge} size="sm" className="font-medium" />
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Coverage:</h4>
                <div className="flex flex-wrap gap-1">
                  {zoneInfo.states.map((stateCode) => {
                    const state = MALAYSIAN_STATES.find(s => s.code === stateCode);
                    return (
                      <Badge key={stateCode} variant="secondary" className="text-xs">
                        {state?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-pharma-blue to-pharma-green text-white p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-3">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Fast & Reliable Delivery</h3>
            <p className="text-white/90">
              Same-day delivery available in major cities. All orders tracked and insured for your peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MalaysianDeliveryInfo; 