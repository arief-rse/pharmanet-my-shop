import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Common
    'common.search': 'Search medicines...',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    
    // Product related
    'product.name': 'Product Name',
    'product.brand': 'Brand',
    'product.price': 'Price',
    'product.description': 'Description',
    'product.category': 'Category',
    'product.stock': 'Stock',
    'product.addToCart': 'Add to Cart',
    'product.quantity': 'Quantity',
    'product.reviews': 'Reviews',
    'product.rating': 'Rating',
    'product.specifications': 'Specifications',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.continue': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.update': 'Update',
    
    // Delivery
    'delivery.free': 'FREE',
    'delivery.sameDay': 'Same Day Delivery',
    'delivery.standard': 'Standard Delivery',
    'delivery.express': 'Express Delivery',
    'delivery.zones': 'Delivery Zones',
    'delivery.coverage': 'Nationwide Delivery Coverage',
    'delivery.klangValley': 'Klang Valley',
    'delivery.penang': 'Penang',
    'delivery.johorBahru': 'Johor Bahru',
    
    // Pharmacy
    'pharmacy.licensed': 'Licensed Pharmacy',
    'pharmacy.verified': 'Verified',
    'pharmacy.authentic': 'Verified and authentic medication',
    'pharmacy.consultation': 'Free consultation available',
    
    // States
    'state.johor': 'Johor',
    'state.kedah': 'Kedah',
    'state.kelantan': 'Kelantan',
    'state.kualaLumpur': 'Kuala Lumpur',
    'state.labuan': 'Labuan',
    'state.melaka': 'Melaka',
    'state.negeriSembilan': 'Negeri Sembilan',
    'state.pahang': 'Pahang',
    'state.penang': 'Penang',
    'state.perak': 'Perak',
    'state.perlis': 'Perlis',
    'state.putrajaya': 'Putrajaya',
    'state.sabah': 'Sabah',
    'state.sarawak': 'Sarawak',
    'state.selangor': 'Selangor',
    'state.terengganu': 'Terengganu',
    
    // Hero section
    'hero.title': "Malaysia's Trusted Digital Health Platform",
    'hero.subtitle': 'Connect with licensed local pharmacies for OTC medicines, vitamins, and wellness products. Private, accessible, and secure shopping experience delivered to your door.',
    'hero.shopNow': 'Shop Now',
    'hero.joinPartner': 'Join as Pharmacy Partner',
    'hero.licensedPharmacies': 'Licensed Pharmacies',
    'hero.fastDelivery': 'Fast Delivery',
    'hero.support247': '24/7 Support',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    // Only English is supported now
    console.log('Only English is supported');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Toggle Component (Hidden - English only)
export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return null; // Don't show any language toggle
};

// Language Badge Component (Hidden - English only)
export const LanguageBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return null; // Don't show any language badge
};

export default LanguageToggle; 