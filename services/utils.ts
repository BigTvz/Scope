
import { Currency, ExchangeRates } from '../types';

// Manual overrides for currencies where Intl.NumberFormat defaults to the ISO code in en-US
const SYMBOL_MAP: Record<string, string> = {
  NAD: 'N$',
  ZAR: 'R',
  KES: 'KSh',
  GHS: 'GH₵',
  NGN: '₦',
  EGP: 'E£',
  SAR: 'SR',
  AED: 'د.إ',
  INR: '₹',
  ARS: '$',
  CLP: '$',
  COP: '$',
  MXN: '$',
  PHP: '₱',
};

/**
 * Returns the ordinal suffix for a number (st, nd, rd, th)
 */
export const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Extracts the standalone currency symbol for a given ISO code.
 */
export const getCurrencySymbol = (currencyCode: string) => {
  if (SYMBOL_MAP[currencyCode]) return SYMBOL_MAP[currencyCode];
  
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).formatToParts(0);
    const currencyPart = parts.find(part => part.type === 'currency');
    return currencyPart ? currencyPart.value : currencyCode;
  } catch (e) {
    return currencyCode;
  }
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Force manual formatting for specific symbols to ensure N$ shows instead of NAD
  if (SYMBOL_MAP[currencyCode]) {
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      currencyDisplay: 'symbol'
    }).format(amount);
  } catch (e) {
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
};

export const getLogoUrl = (domain: string, customUrl?: string) => {
  if (customUrl) return customUrl;
  if (!domain) return `https://ui-avatars.com/api/?name=E&background=1A1D21&color=CCFF00`;
  return `https://logo.clearbit.com/${domain}`;
};

/**
 * Converts an amount from a source currency to a target currency using USD-based rates.
 * logic: AmountInTarget = AmountInSource * (RateToUSD_Target / RateToUSD_Source)
 */
export const calculateConvertedAmount = (
  amount: number, 
  sourceCurrency: Currency, 
  targetCurrency: Currency, 
  rates: ExchangeRates
) => {
  if (sourceCurrency === targetCurrency) return amount;
  
  const rateToSource = rates[sourceCurrency];
  const rateToTarget = rates[targetCurrency];
  
  if (!rateToSource || !rateToTarget) return amount;
  
  // Convert Source -> USD -> Target
  return (amount / rateToSource) * rateToTarget;
};

/**
 * Calculates human-readable relative days from today to a specific day of the month.
 */
export const getRelativeDueString = (dueDay: number) => {
  const today = new Date().getDate();
  const diff = dueDay - today;

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return `In ${diff} days`;
  if (diff === -1) return 'Yesterday';
  return `Passed (${Math.abs(diff)}d ago)`;
};

// Legacy support
export const calculateLocalAmount = (amount: number, currency: Currency, rate: number) => {
  return currency === 'USD' ? amount * rate : amount;
};
