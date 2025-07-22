// Sample data for the migrant finance app

export interface User {
  id: string;
  name: string;
  country: string;
  profileImage: string;
  balance: number;
  currency: string;
  language: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'save' | 'withdraw';
  amount: number;
  currency: string;
  recipient?: string;
  recipientCountry?: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  fee: number;
  exchangeRate?: number;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  exchangeRate: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  dueDate: string;
  category: string;
}

export interface Insurance {
  id: string;
  type: 'health' | 'life' | 'accident';
  name: string;
  monthlyPremium: number;
  coverage: number;
  currency: string;
  isActive: boolean;
}

export const sampleUser: User = {
  id: '1',
  name: 'Maria Rodriguez',
  country: 'Philippines',
  profileImage: '/placeholder.svg',
  balance: 2450.50,
  currency: 'USD',
  language: 'en'
};

export const countries: Country[] = [
  { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭', exchangeRate: 56.25 },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳', exchangeRate: 83.12 },
  { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽', exchangeRate: 17.89 },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', flag: '🇧🇩', exchangeRate: 110.15 },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', flag: '🇵🇰', exchangeRate: 279.50 },
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬', exchangeRate: 30.85 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', exchangeRate: 1150.00 },
  { code: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳', exchangeRate: 24500.00 }
];

export const recentTransactions: Transaction[] = [
  {
    id: '1',
    type: 'send',
    amount: 300,
    currency: 'USD',
    recipient: 'Rosa Rodriguez',
    recipientCountry: 'Philippines',
    status: 'completed',
    date: '2024-01-15',
    fee: 3.99,
    exchangeRate: 56.25
  },
  {
    id: '2',
    type: 'receive',
    amount: 150,
    currency: 'USD',
    status: 'completed',
    date: '2024-01-14',
    fee: 0
  },
  {
    id: '3',
    type: 'save',
    amount: 100,
    currency: 'USD',
    status: 'completed',
    date: '2024-01-13',
    fee: 0
  },
  {
    id: '4',
    type: 'send',
    amount: 200,
    currency: 'USD',
    recipient: 'Juan Rodriguez',
    recipientCountry: 'Philippines',
    status: 'pending',
    date: '2024-01-12',
    fee: 2.99,
    exchangeRate: 56.25
  }
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 2450,
    currency: 'USD',
    dueDate: '2024-12-31',
    category: 'emergency'
  },
  {
    id: '2',
    name: 'Family House',
    targetAmount: 20000,
    currentAmount: 8500,
    currency: 'USD',
    dueDate: '2026-06-30',
    category: 'home'
  },
  {
    id: '3',
    name: 'Children Education',
    targetAmount: 10000,
    currentAmount: 3200,
    currency: 'USD',
    dueDate: '2025-08-15',
    category: 'education'
  }
];

export const insuranceOptions: Insurance[] = [
  {
    id: '1',
    type: 'health',
    name: 'Basic Health Coverage',
    monthlyPremium: 25,
    coverage: 10000,
    currency: 'USD',
    isActive: true
  },
  {
    id: '2',
    type: 'life',
    name: 'Life Insurance',
    monthlyPremium: 15,
    coverage: 50000,
    currency: 'USD',
    isActive: false
  },
  {
    id: '3',
    type: 'accident',
    name: 'Accident Protection',
    monthlyPremium: 10,
    coverage: 25000,
    currency: 'USD',
    isActive: true
  }
];

export const exchangeRates = {
  'USD-PHP': 56.25,
  'USD-INR': 83.12,
  'USD-MXN': 17.89,
  'USD-BDT': 110.15,
  'USD-PKR': 279.50,
  'USD-EGP': 30.85,
  'USD-NGN': 1150.00,
  'USD-VND': 24500.00,

  // All pairs generated using USD as bridge
  'PHP-USD': 1/56.25,
  'INR-USD': 1/83.12,
  'MXN-USD': 1/17.89,
  'BDT-USD': 1/110.15,
  'PKR-USD': 1/279.50,
  'EGP-USD': 1/30.85,
  'NGN-USD': 1/1150.00,
  'VND-USD': 1/24500.00,

  // PHP pairs
  'PHP-INR': 83.12/56.25,
  'INR-PHP': 56.25/83.12,
  'PHP-MXN': 17.89/56.25,
  'MXN-PHP': 56.25/17.89,
  'PHP-BDT': 110.15/56.25,
  'BDT-PHP': 56.25/110.15,
  'PHP-PKR': 279.50/56.25,
  'PKR-PHP': 56.25/279.50,
  'PHP-EGP': 30.85/56.25,
  'EGP-PHP': 56.25/30.85,
  'PHP-NGN': 1150.00/56.25,
  'NGN-PHP': 56.25/1150.00,
  'PHP-VND': 24500.00/56.25,
  'VND-PHP': 56.25/24500.00,

  // INR pairs
  'INR-MXN': 17.89/83.12,
  'MXN-INR': 83.12/17.89,
  'INR-BDT': 110.15/83.12,
  'BDT-INR': 83.12/110.15,
  'INR-PKR': 279.50/83.12,
  'PKR-INR': 83.12/279.50,
  'INR-EGP': 30.85/83.12,
  'EGP-INR': 83.12/30.85,
  'INR-NGN': 1150.00/83.12,
  'NGN-INR': 83.12/1150.00,
  'INR-VND': 24500.00/83.12,
  'VND-INR': 83.12/24500.00,

  // MXN pairs
  'MXN-BDT': 110.15/17.89,
  'BDT-MXN': 17.89/110.15,
  'MXN-PKR': 279.50/17.89,
  'PKR-MXN': 17.89/279.50,
  'MXN-EGP': 30.85/17.89,
  'EGP-MXN': 17.89/30.85,
  'MXN-NGN': 1150.00/17.89,
  'NGN-MXN': 17.89/1150.00,
  'MXN-VND': 24500.00/17.89,
  'VND-MXN': 17.89/24500.00,

  // BDT pairs
  'BDT-PKR': 279.50/110.15,
  'PKR-BDT': 110.15/279.50,
  'BDT-EGP': 30.85/110.15,
  'EGP-BDT': 110.15/30.85,
  'BDT-NGN': 1150.00/110.15,
  'NGN-BDT': 110.15/1150.00,
  'BDT-VND': 24500.00/110.15,
  'VND-BDT': 110.15/24500.00,

  // PKR pairs
  'PKR-EGP': 30.85/279.50,
  'EGP-PKR': 279.50/30.85,
  'PKR-NGN': 1150.00/279.50,
  'NGN-PKR': 279.50/1150.00,
  'PKR-VND': 24500.00/279.50,
  'VND-PKR': 279.50/24500.00,

  // EGP pairs
  'EGP-NGN': 1150.00/30.85,
  'NGN-EGP': 30.85/1150.00,
  'EGP-VND': 24500.00/30.85,
  'VND-EGP': 30.85/24500.00,

  // NGN-VND
  'NGN-VND': 24500.00/1150.00,
  'VND-NGN': 1150.00/24500.00
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' }
];