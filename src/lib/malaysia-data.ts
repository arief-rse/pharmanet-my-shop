// Malaysian States and Federal Territories
export const MALAYSIAN_STATES = [
  { code: 'JHR', name: 'Johor', nameBM: 'Johor' },
  { code: 'KDH', name: 'Kedah', nameBM: 'Kedah' },
  { code: 'KTN', name: 'Kelantan', nameBM: 'Kelantan' },
  { code: 'KUL', name: 'Kuala Lumpur', nameBM: 'Kuala Lumpur' },
  { code: 'LBN', name: 'Labuan', nameBM: 'Labuan' },
  { code: 'MLK', name: 'Melaka', nameBM: 'Melaka' },
  { code: 'NSN', name: 'Negeri Sembilan', nameBM: 'Negeri Sembilan' },
  { code: 'PHG', name: 'Pahang', nameBM: 'Pahang' },
  { code: 'PRK', name: 'Perak', nameBM: 'Perak' },
  { code: 'PLS', name: 'Perlis', nameBM: 'Perlis' },
  { code: 'PNG', name: 'Penang', nameBM: 'Pulau Pinang' },
  { code: 'PJY', name: 'Putrajaya', nameBM: 'Putrajaya' },
  { code: 'SBH', name: 'Sabah', nameBM: 'Sabah' },
  { code: 'SWK', name: 'Sarawak', nameBM: 'Sarawak' },
  { code: 'SGR', name: 'Selangor', nameBM: 'Selangor' },
  { code: 'TRG', name: 'Terengganu', nameBM: 'Terengganu' },
];

// Major cities by state
export const MALAYSIAN_CITIES = {
  JHR: ['Johor Bahru', 'Skudai', 'Batu Pahat', 'Muar', 'Kluang', 'Pontian', 'Segamat'],
  KDH: ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi', 'Pendang', 'Kuala Kedah'],
  KTN: ['Kota Bharu', 'Tanah Merah', 'Machang', 'Pasir Mas', 'Gua Musang'],
  KUL: ['Kuala Lumpur', 'Cheras', 'Kepong', 'Petaling Jaya', 'Shah Alam'],
  LBN: ['Victoria', 'Rancha-Rancha'],
  MLK: ['Melaka City', 'Ayer Keroh', 'Jasin', 'Merlimau'],
  NSN: ['Seremban', 'Port Dickson', 'Nilai', 'Rembau', 'Jelebu'],
  PHG: ['Kuantan', 'Temerloh', 'Bentong', 'Raub', 'Pekan', 'Cameron Highlands'],
  PRK: ['Ipoh', 'Taiping', 'Teluk Intan', 'Kampar', 'Lumut', 'Parit Buntar'],
  PLS: ['Kangar', 'Arau', 'Padang Besar'],
  PNG: ['George Town', 'Butterworth', 'Bukit Mertajam', 'Nibong Tebal', 'Balik Pulau'],
  PJY: ['Putrajaya'],
  SBH: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau', 'Beaufort'],
  SWK: ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang', 'Sarikei'],
  SGR: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Kajang', 'Ampang', 'Puchong'],
  TRG: ['Kuala Terengganu', 'Dungun', 'Kemaman', 'Marang', 'Besut'],
};

// Malaysian postal code patterns by state
export const POSTAL_CODE_PATTERNS = {
  JHR: /^[78]\d{4}$/,
  KDH: /^0[5-9]\d{3}$/,
  KTN: /^1[5-8]\d{3}$/,
  KUL: /^[5-6]\d{4}$/,
  LBN: /^87\d{3}$/,
  MLK: /^7[5-8]\d{3}$/,
  NSN: /^7[0-3]\d{3}$/,
  PHG: /^2[5-8]\d{3}$/,
  PRK: /^3[0-6]\d{3}$/,
  PLS: /^02\d{3}$/,
  PNG: /^1[0-4]\d{3}$/,
  PJY: /^62\d{3}$/,
  SBH: /^8[8-9]\d{3}$/,
  SWK: /^9[3-8]\d{3}$/,
  SGR: /^4[0-8]\d{3}$/,
  TRG: /^2[0-4]\d{3}$/,
};

// Malaysian phone number formats
export const PHONE_FORMATS = {
  mobile: /^(\+?6?01)[0-46-9]\d{7,8}$/,
  landline: /^(\+?6?0)[2-9]\d{7,8}$/,
  toll_free: /^1[38]00\d{6}$/,
};

// Malaysian currency formatting
export const formatMYR = (amount: number): string => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Malaysian date formatting
export const formatMalaysianDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Malaysian working hours and holidays
export const MALAYSIAN_HOLIDAYS_2024 = [
  { date: '2024-01-01', name: 'New Year\'s Day', nameBM: 'Hari Tahun Baru' },
  { date: '2024-02-10', name: 'Chinese New Year', nameBM: 'Tahun Baru Cina' },
  { date: '2024-02-11', name: 'Chinese New Year (2nd Day)', nameBM: 'Tahun Baru Cina (Hari Kedua)' },
  { date: '2024-04-10', name: 'Hari Raya Aidilfitri', nameBM: 'Hari Raya Aidilfitri' },
  { date: '2024-04-11', name: 'Hari Raya Aidilfitri (2nd Day)', nameBM: 'Hari Raya Aidilfitri (Hari Kedua)' },
  { date: '2024-05-01', name: 'Labour Day', nameBM: 'Hari Pekerja' },
  { date: '2024-05-22', name: 'Wesak Day', nameBM: 'Hari Wesak' },
  { date: '2024-06-03', name: 'Yang di-Pertuan Agong\'s Birthday', nameBM: 'Hari Keputeraan Yang di-Pertuan Agong' },
  { date: '2024-06-17', name: 'Hari Raya Aidiladha', nameBM: 'Hari Raya Aidiladha' },
  { date: '2024-08-31', name: 'Independence Day', nameBM: 'Hari Kemerdekaan' },
  { date: '2024-09-16', name: 'Malaysia Day', nameBM: 'Hari Malaysia' },
  { date: '2024-11-01', name: 'Deepavali', nameBM: 'Deepavali' },
  { date: '2024-12-25', name: 'Christmas Day', nameBM: 'Hari Krismas' },
];

// Malaysian pharmacy license format validation
export const validatePharmacyLicense = (license: string): boolean => {
  // Format: A12345 or AB12345 (1-2 letters followed by 4-5 digits)
  const pattern = /^[A-Z]{1,2}\d{4,5}$/;
  return pattern.test(license);
};

// MAL number validation (Malaysian Drug Registration Number)
export const validateMALNumber = (malNumber: string): boolean => {
  // Format: MAL followed by 8 digits, e.g., MAL12345678
  const pattern = /^MAL\d{8}$/;
  return pattern.test(malNumber);
};

// Malaysian IC number validation
export const validateMalaysianIC = (ic: string): boolean => {
  // Format: YYMMDD-PB-XXXX
  const pattern = /^\d{6}-\d{2}-\d{4}$/;
  return pattern.test(ic);
};

// Business registration number validation
export const validateBusinessRegistration = (regNumber: string): boolean => {
  // Format: 123456-A, 123456-X, etc.
  const pattern = /^\d{6}-[A-Z]$/;
  return pattern.test(regNumber);
};

// Malaysian working hours
export const WORKING_HOURS = {
  pharmacy: {
    weekdays: { open: '09:00', close: '22:00' },
    saturday: { open: '09:00', close: '22:00' },
    sunday: { open: '10:00', close: '20:00' },
    publicHolidays: { open: '10:00', close: '18:00' },
  },
  delivery: {
    weekdays: { start: '09:00', end: '21:00' },
    saturday: { start: '09:00', end: '21:00' },
    sunday: { start: '10:00', end: '19:00' },
    publicHolidays: { start: '10:00', end: '17:00' },
  },
};

// Delivery zones and charges
export const DELIVERY_ZONES = {
  'Klang Valley': {
    states: ['KUL', 'SGR', 'PJY'],
    freeDeliveryThreshold: 50,
    standardCharge: 5,
    expressCharge: 10,
    sameDayAvailable: true,
  },
  'Penang': {
    states: ['PNG'],
    freeDeliveryThreshold: 60,
    standardCharge: 8,
    expressCharge: 15,
    sameDayAvailable: true,
  },
  'Johor Bahru': {
    states: ['JHR'],
    cities: ['Johor Bahru', 'Skudai'],
    freeDeliveryThreshold: 60,
    standardCharge: 8,
    expressCharge: 15,
    sameDayAvailable: true,
  },
  'West Malaysia': {
    states: ['PRK', 'KDH', 'PLS', 'NSN', 'MLK', 'PHG', 'TRG', 'KTN'],
    freeDeliveryThreshold: 80,
    standardCharge: 12,
    expressCharge: 20,
    sameDayAvailable: false,
  },
  'East Malaysia': {
    states: ['SBH', 'SWK', 'LBN'],
    freeDeliveryThreshold: 100,
    standardCharge: 20,
    expressCharge: 35,
    sameDayAvailable: false,
  },
};

// Common Malaysian pharmacy chains
export const PHARMACY_CHAINS = [
  'Guardian',
  'Watsons',
  'Caring Pharmacy',
  'Alpro Pharmacy',
  'Big Pharmacy',
  'Pharmaniaga',
  'AA Pharmacy',
  'Unity Pharmacy',
  'Bintang Pharmacy',
  'Apex Pharmacy',
];

// Malaysian language translations
export const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    pharmacy: 'Pharmacy',
    medicine: 'Medicine',
    health: 'Health',
    delivery: 'Delivery',
    order: 'Order',
    cart: 'Cart',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    checkout: 'Checkout',
    payment: 'Payment',
    address: 'Address',
    phone: 'Phone Number',
    email: 'Email',
    name: 'Name',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    price: 'Price',
    brand: 'Brand',
    category: 'Category',
    description: 'Description',
    reviews: 'Reviews',
    rating: 'Rating',
    stock: 'Stock',
    available: 'Available',
    outOfStock: 'Out of Stock',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    quantity: 'Quantity',
    malNumber: 'MAL Number',
    license: 'License',
    verified: 'Verified',
    authentic: 'Authentic',
    fastDelivery: 'Fast Delivery',
    sameDayDelivery: 'Same Day Delivery',
    freeDelivery: 'Free Delivery',
    securePayment: 'Secure Payment',
    customerSupport: '24/7 Customer Support',
    licensed: 'Licensed',
    ministryApproved: 'Ministry of Health Approved',
  },
  ms: {
    welcome: 'Selamat Datang',
    pharmacy: 'Farmasi',
    medicine: 'Ubat',
    health: 'Kesihatan',
    delivery: 'Penghantaran',
    order: 'Pesanan',
    cart: 'Troli',
    total: 'Jumlah',
    subtotal: 'Subjumlah',
    shipping: 'Penghantaran',
    free: 'Percuma',
    checkout: 'Bayar',
    payment: 'Pembayaran',
    address: 'Alamat',
    phone: 'Nombor Telefon',
    email: 'E-mel',
    name: 'Nama',
    search: 'Cari',
    filter: 'Tapis',
    sort: 'Susun',
    price: 'Harga',
    brand: 'Jenama',
    category: 'Kategori',
    description: 'Penerangan',
    reviews: 'Ulasan',
    rating: 'Penilaian',
    stock: 'Stok',
    available: 'Tersedia',
    outOfStock: 'Kehabisan Stok',
    addToCart: 'Tambah ke Troli',
    buyNow: 'Beli Sekarang',
    quantity: 'Kuantiti',
    malNumber: 'Nombor MAL',
    license: 'Lesen',
    verified: 'Disahkan',
    authentic: 'Tulen',
    fastDelivery: 'Penghantaran Pantas',
    sameDayDelivery: 'Penghantaran Hari Sama',
    freeDelivery: 'Penghantaran Percuma',
    securePayment: 'Pembayaran Selamat',
    customerSupport: 'Sokongan Pelanggan 24/7',
    licensed: 'Berlesen',
    ministryApproved: 'Diluluskan Kementerian Kesihatan',
  },
};

// Helper function to get translation
export const getTranslation = (key: string, language: 'en' | 'ms' = 'en'): string => {
  return TRANSLATIONS[language][key as keyof typeof TRANSLATIONS.en] || key;
};

// Helper function to validate postal code for a state
export const validatePostalCode = (postalCode: string, stateCode: string): boolean => {
  const pattern = POSTAL_CODE_PATTERNS[stateCode as keyof typeof POSTAL_CODE_PATTERNS];
  return pattern ? pattern.test(postalCode) : false;
};

// Helper function to get delivery info for a state
export const getDeliveryInfo = (stateCode: string) => {
  for (const [zoneName, zoneInfo] of Object.entries(DELIVERY_ZONES)) {
    if (zoneInfo.states.includes(stateCode)) {
      return { zone: zoneName, ...zoneInfo };
    }
  }
  return DELIVERY_ZONES['West Malaysia']; // Default fallback
};

// Helper function to format Malaysian phone number
export const formatMalaysianPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing
  let formatted = cleaned;
  if (cleaned.length === 10 && cleaned.startsWith('01')) {
    formatted = '6' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('601')) {
    formatted = cleaned;
  }
  
  // Format as +60 XX-XXX XXXX
  if (formatted.length === 11 && formatted.startsWith('601')) {
    return `+60 ${formatted.slice(3, 5)}-${formatted.slice(5, 8)} ${formatted.slice(8)}`;
  }
  
  return phone; // Return original if can't format
}; 