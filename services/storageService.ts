
import { Expense, UserSettings, ExchangeRates } from '../types';

// Storage keys
const USERS_KEY = 'scope_users';
const CURRENT_USER_KEY = 'scope_current_user';

// Helper to get namespaced key
const getNamespacedKey = (userId: string, key: string) => `scope_app_${userId}_${key}`;

export const StorageService = {
  // --- Generic Storage ---
  getItem: <T>(userId: string, key: string, defaultValue: T): T => {
    const fullKey = getNamespacedKey(userId, key);
    const item = localStorage.getItem(fullKey);
    return item ? JSON.parse(item) : defaultValue;
  },

  setItem: <T>(userId: string, key: string, value: T): void => {
    const fullKey = getNamespacedKey(userId, key);
    localStorage.setItem(fullKey, JSON.stringify(value));
  },

  removeItem: (userId: string, key: string): void => {
    const fullKey = getNamespacedKey(userId, key);
    localStorage.removeItem(fullKey);
  },

  // --- Migration Helper ---
  // Moves legacy root-level items to the first user's namespace
  migrateLegacyData: (userId: string) => {
    const legacyKeys = ['expenses', 'settings', 'exchange_rates', 'last_sync', 'last_active_month_year'];
    let migratedCount = 0;

    legacyKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        // defined directly check to avoid overwriting if already exists in namespace? 
        // For simplicity, we assume if migrate is called, we want to bring it over.
        // But better safety: only if namespace doesn't exist.
        const fullKey = getNamespacedKey(userId, key);
        if (!localStorage.getItem(fullKey)) {
          localStorage.setItem(fullKey, value);
          // Optional: localStorage.removeItem(key); // Keep legacy for safety? Or clean up? Let's keep for now.
          migratedCount++;
        }
      }
    });
    return migratedCount;
  }
};
