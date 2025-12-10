import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MALAYSIAN_STATES, 
  MALAYSIAN_CITIES, 
  validatePostalCode,
  formatMalaysianPhone,
  PHONE_FORMATS
} from '@/lib/malaysia-data';

interface MalaysianAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface MalaysianAddressFormProps {
  address: MalaysianAddress;
  onChange: (address: MalaysianAddress) => void;
  showPhoneField?: boolean;
  phone?: string;
  onPhoneChange?: (phone: string) => void;
  errors?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
  };
}

export const MalaysianAddressForm: React.FC<MalaysianAddressFormProps> = ({
  address,
  onChange,
  showPhoneField = false,
  phone = '',
  onPhoneChange,
  errors = {}
}) => {
  const [selectedState, setSelectedState] = useState(address.state);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [postalCodeError, setPostalCodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Update available cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateInfo = MALAYSIAN_STATES.find(s => s.code === selectedState);
      if (stateInfo) {
        setAvailableCities(MALAYSIAN_CITIES[selectedState as keyof typeof MALAYSIAN_CITIES] || []);
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedState]);

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    onChange({
      ...address,
      state: stateCode,
      city: '', // Reset city when state changes
      postalCode: '' // Reset postal code when state changes
    });
  };

  const handleCityChange = (city: string) => {
    onChange({
      ...address,
      city
    });
  };

  const handlePostalCodeChange = (postalCode: string) => {
    // Remove any non-digits
    const cleanedCode = postalCode.replace(/\D/g, '');
    
    onChange({
      ...address,
      postalCode: cleanedCode
    });

    // Validate postal code for selected state
    if (cleanedCode && selectedState) {
      const isValid = validatePostalCode(cleanedCode, selectedState);
      if (!isValid) {
        const stateName = MALAYSIAN_STATES.find(s => s.code === selectedState)?.name;
        setPostalCodeError(`Invalid postal code for ${stateName}`);
      } else {
        setPostalCodeError('');
      }
    } else {
      setPostalCodeError('');
    }
  };

  const handlePhoneChange = (phoneNumber: string) => {
    if (onPhoneChange) {
      onPhoneChange(phoneNumber);
      
      // Validate phone number
      if (phoneNumber) {
        const isMobileValid = PHONE_FORMATS.mobile.test(phoneNumber);
        const isLandlineValid = PHONE_FORMATS.landline.test(phoneNumber);
        
        if (!isMobileValid && !isLandlineValid) {
          setPhoneError('Please enter a valid Malaysian phone number');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    }
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    return formatMalaysianPhone(phoneNumber);
  };

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street">Street Address *</Label>
        <Textarea
          id="street"
          placeholder="Enter your full street address"
          value={address.street}
          onChange={(e) => onChange({ ...address, street: e.target.value })}
          className={errors.street ? 'border-red-500' : ''}
          rows={2}
        />
        {errors.street && (
          <p className="text-sm text-red-500">{errors.street}</p>
        )}
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label htmlFor="state">State *</Label>
        <Select value={selectedState} onValueChange={handleStateChange}>
          <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select your state" />
          </SelectTrigger>
          <SelectContent>
            {MALAYSIAN_STATES.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && (
          <p className="text-sm text-red-500">{errors.state}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Select 
            value={address.city} 
            onValueChange={handleCityChange}
            disabled={!selectedState}
          >
            <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
              <SelectValue placeholder={selectedState ? "Select your city" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            placeholder="e.g., 50450"
            value={address.postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className={errors.postalCode || postalCodeError ? 'border-red-500' : ''}
            maxLength={5}
          />
          {(errors.postalCode || postalCodeError) && (
            <p className="text-sm text-red-500">{errors.postalCode || postalCodeError}</p>
          )}
        </div>
      </div>

      {/* Country (Fixed to Malaysia) */}
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value="Malaysia 🇲🇾"
          disabled
          className="bg-gray-50"
        />
      </div>

      {/* Phone Number (Optional) */}
      {showPhoneField && (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="relative">
            <Input
              id="phone"
              placeholder="e.g., +60 12-345 6789 or 012-345 6789"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={errors.phone || phoneError ? 'border-red-500' : ''}
            />
            {phone && (
              <div className="text-xs text-gray-500 mt-1">
                Formatted: {formatPhoneDisplay(phone)}
              </div>
            )}
          </div>
          {(errors.phone || phoneError) && (
            <p className="text-sm text-red-500">{errors.phone || phoneError}</p>
          )}
          <p className="text-xs text-gray-500">
            Enter Malaysian mobile (+60 1X-XXX XXXX) or landline (+60 X-XXX XXXX) number
          </p>
        </div>
      )}

      {/* Helpful information */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>💡 Tip:</strong> Make sure your address is complete and accurate for smooth delivery. 
          We deliver to all states in Malaysia with different delivery charges and timeframes.
        </p>
      </div>
    </div>
  );
};

export default MalaysianAddressForm; 