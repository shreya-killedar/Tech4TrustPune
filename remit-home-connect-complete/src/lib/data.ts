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
  'USD-VND': 24500.00
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