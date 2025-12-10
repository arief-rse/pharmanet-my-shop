import React from 'react';
import { formatMYR } from '@/lib/malaysia-data';

interface MalaysianCurrencyProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
  showCents?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MalaysianCurrency: React.FC<MalaysianCurrencyProps> = ({
  amount,
  className = '',
  showSymbol = true,
  showCents = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const formatAmount = (value: number): string => {
    if (!showCents && value % 1 === 0) {
      // If no cents and it's a whole number, show without decimals
      return showSymbol 
        ? `RM ${value.toLocaleString('en-MY')}`
        : value.toLocaleString('en-MY');
    }
    
    // Use the Malaysian currency formatter
    const formatted = formatMYR(value);
    
    if (!showSymbol) {
      // Remove the currency symbol if not wanted
      return formatted.replace('RM', '').trim();
    }
    
    return formatted;
  };

  return (
    <span className={`font-medium ${sizeClasses[size]} ${className}`}>
      {formatAmount(amount)}
    </span>
  );
};

// Price display component with original price and discount
interface PriceDisplayProps {
  currentPrice: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  currentPrice,
  originalPrice,
  className = '',
  size = 'md',
  showDiscount = true
}) => {
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Current Price */}
      <MalaysianCurrency 
        amount={currentPrice} 
        size={size}
        className="text-pharma-blue font-bold"
      />
      
      {/* Original Price (crossed out) */}
      {hasDiscount && (
        <>
          <MalaysianCurrency 
            amount={originalPrice}
            size={size === 'lg' ? 'md' : 'sm'}
            className="text-gray-500 line-through"
          />
          
          {/* Discount Badge */}
          {showDiscount && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

// Savings display component
interface SavingsDisplayProps {
  originalPrice: number;
  currentPrice: number;
  className?: string;
}

export const SavingsDisplay: React.FC<SavingsDisplayProps> = ({
  originalPrice,
  currentPrice,
  className = ''
}) => {
  const savings = originalPrice - currentPrice;
  const savingsPercentage = Math.round((savings / originalPrice) * 100);

  if (savings <= 0) return null;

  return (
    <div className={`text-green-600 text-sm ${className}`}>
      You save <MalaysianCurrency amount={savings} size="sm" className="font-bold" />
      {' '}({savingsPercentage}%)
    </div>
  );
};

// Total price component for cart/checkout
interface TotalPriceProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  className?: string;
}

export const TotalPrice: React.FC<TotalPriceProps> = ({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  className = ''
}) => {
  const total = subtotal + shipping + tax - discount;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Subtotal */}
      <div className="flex justify-between text-gray-600">
        <span>Subtotal:</span>
        <MalaysianCurrency amount={subtotal} />
      </div>
      
      {/* Shipping */}
      <div className="flex justify-between text-gray-600">
        <span>Shipping:</span>
        {shipping === 0 ? (
          <span className="text-green-600 font-medium">FREE</span>
        ) : (
          <MalaysianCurrency amount={shipping} />
        )}
      </div>
      
      {/* Tax (if applicable) */}
      {tax > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Tax:</span>
          <MalaysianCurrency amount={tax} />
        </div>
      )}
      
      {/* Discount (if applicable) */}
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount:</span>
          <span>-<MalaysianCurrency amount={discount} /></span>
        </div>
      )}
      
      {/* Total */}
      <div className="border-t pt-2">
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <MalaysianCurrency amount={total} size="lg" className="text-pharma-blue" />
        </div>
      </div>
    </div>
  );
};

export default MalaysianCurrency; 