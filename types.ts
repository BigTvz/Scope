
export type Currency = string;

export interface Expense {
  id: string;
  name: string;
  domain: string; // Used for logo fetching (e.g., netflix.com)
  amount: number;
  currency: Currency;
  dueDay: number;
  isPaid: boolean;
  category: string;
  type: 'one-time' | 'recurring';
  customLogoUrl?: string;
}

export interface UserSettings {
  exchangeRate: number; // Legacy, we now use the rates table
  localCurrencySymbol: string;
}

export interface ExchangeRates {
  [key: string]: number;
}
