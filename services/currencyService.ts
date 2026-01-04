
import { ExchangeRates } from '../types';

export const fetchAllExchangeRates = async (): Promise<ExchangeRates | null> => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.rates || null;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return null;
  }
};

// Legacy support for single rate fetch
export const fetchUSDExchangeRate = async (targetCurrency: string): Promise<number | null> => {
  const rates = await fetchAllExchangeRates();
  return rates ? rates[targetCurrency.toUpperCase()] || null : null;
};
