
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, TrendingUp, Wallet, ArrowRightLeft, RefreshCw, ChevronDown } from 'lucide-react';
import { Expense, UserSettings, ExchangeRates } from './types';
import { formatCurrency, calculateConvertedAmount, getCurrencySymbol } from './services/utils';
import { CircularProgress } from './components/CircularProgress';
import { ExpenseItem } from './components/ExpenseItem';
import { AddExpenseModal } from './components/AddExpenseModal';
import { CurrencyPickerModal } from './components/CurrencyPickerModal';
import { ScopeLogo } from './components/ScopeLogo';
import { fetchAllExchangeRates } from './services/currencyService';

const DUMMY_EXPENSES: Expense[] = [
  { id: '1', name: 'Adobe Creative Cloud', domain: 'adobe.com', amount: 54.99, currency: 'USD', dueDay: 1, isPaid: true, category: 'saas', type: 'recurring' },
  { id: '2', name: 'Figma Professional', domain: 'figma.com', amount: 15.00, currency: 'USD', dueDay: 3, isPaid: true, category: 'saas', type: 'recurring' },
  { id: '3', name: 'MacBook Pro 14"', domain: 'apple.com', amount: 1999.00, currency: 'USD', dueDay: 5, isPaid: true, category: 'hardware', type: 'one-time' },
  { id: '4', name: 'Netflix Premium', domain: 'netflix.com', amount: 19.99, currency: 'USD', dueDay: 5, isPaid: false, category: 'entertainment', type: 'recurring' },
  { id: '5', name: 'Business Lunch', domain: '', amount: 65.00, currency: 'USD', dueDay: 8, isPaid: true, category: 'food', type: 'one-time' },
  { id: '6', name: 'Google Workspace', domain: 'google.com', amount: 12.00, currency: 'USD', dueDay: 15, isPaid: false, category: 'saas', type: 'recurring' },
  { id: '7', name: 'Vercel Pro', domain: 'vercel.com', amount: 20.00, currency: 'USD', dueDay: 18, isPaid: false, category: 'saas', type: 'recurring' },
  { id: '8', name: 'React Course', domain: 'udemy.com', amount: 24.99, currency: 'USD', dueDay: 12, isPaid: true, category: 'entertainment', type: 'one-time' },
  { id: '9', name: 'Notion Plus', domain: 'notion.so', amount: 10.00, currency: 'USD', dueDay: 22, isPaid: false, category: 'saas', type: 'recurring' },
  { id: '10', name: 'ChatGPT Plus', domain: 'openai.com', amount: 20.00, currency: 'USD', dueDay: 14, isPaid: true, category: 'saas', type: 'recurring' },
  { id: '11', name: 'Conference Ticket', domain: 'reactconf.com', amount: 450.00, currency: 'USD', dueDay: 20, isPaid: false, category: 'travel', type: 'one-time' },
  { id: '12', name: 'Amazon Prime', domain: 'amazon.com', amount: 14.99, currency: 'USD', dueDay: 25, isPaid: false, category: 'shopping', type: 'recurring' },
  { id: '13', name: 'Coworking Desk', domain: 'wework.com', amount: 350.00, currency: 'USD', dueDay: 1, isPaid: true, category: 'office', type: 'recurring' },
];

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : DUMMY_EXPENSES;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { exchangeRate: 1.0, localCurrencySymbol: 'USD' };
  });

  const [rates, setRates] = useState<ExchangeRates>(() => {
    const saved = localStorage.getItem('exchange_rates');
    return saved ? JSON.parse(saved) : { USD: 1 };
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHomeCurrencyPickerOpen, setIsHomeCurrencyPickerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => {
    const saved = localStorage.getItem('last_sync');
    return saved ? new Date(saved) : null;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle month rollover: clear one-time expenses
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const savedDateStr = localStorage.getItem('last_active_month_year');
    const currentDateStr = `${currentMonth}-${currentYear}`;
    
    if (savedDateStr !== null && savedDateStr !== currentDateStr) {
      console.log('New cycle detected. Cleaning up one-time expenses...');
      setExpenses(prev => {
        const filtered = prev.filter(e => e.type === 'recurring');
        return filtered;
      });
    }
    
    localStorage.setItem('last_active_month_year', currentDateStr);
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('exchange_rates', JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    if (lastSync) localStorage.setItem('last_sync', lastSync.toISOString());
  }, [lastSync]);

  const syncRates = useCallback(async () => {
    setIsSyncing(true);
    const fetchedRates = await fetchAllExchangeRates();
    if (fetchedRates) {
      setRates(fetchedRates);
      setLastSync(new Date());
      if (fetchedRates[settings.localCurrencySymbol]) {
        setSettings(prev => ({ ...prev, exchangeRate: fetchedRates[settings.localCurrencySymbol] }));
      }
    }
    setIsSyncing(false);
  }, [settings.localCurrencySymbol]);

  useEffect(() => {
    if (!lastSync || (new Date().getTime() - lastSync.getTime() > 3600000)) {
      syncRates();
    }
  }, [syncRates]);

  const stats = useMemo(() => {
    const totalNeeded = expenses.reduce((acc, exp) => 
      acc + calculateConvertedAmount(exp.amount, exp.currency, settings.localCurrencySymbol, rates), 0
    );
    const totalPaid = expenses.reduce((acc, exp) => 
      exp.isPaid ? acc + calculateConvertedAmount(exp.amount, exp.currency, settings.localCurrencySymbol, rates) : acc, 0
    );
    const remaining = totalNeeded - totalPaid;
    const progress = totalNeeded === 0 ? 0 : (totalPaid / totalNeeded) * 100;

    return { totalNeeded, totalPaid, remaining, progress };
  }, [expenses, settings.localCurrencySymbol, rates]);

  // Determine the "Next Up" payment ID
  const nextPaymentId = useMemo(() => {
    const today = new Date().getDate();
    const unpaid = expenses.filter(e => !e.isPaid).sort((a, b) => a.dueDay - b.dueDay);
    if (unpaid.length === 0) return null;
    
    // Find first one that is today or later
    const upcoming = unpaid.find(e => e.dueDay >= today);
    // If none are later this month, the first one next month is the next up
    return upcoming ? upcoming.id : unpaid[0].id;
  }, [expenses]);

  const addExpense = (newExp: Omit<Expense, 'id' | 'isPaid'>) => {
    const expense: Expense = {
      ...newExp,
      id: Math.random().toString(36).substr(2, 9),
      isPaid: false
    };
    setExpenses(prev => [...prev, expense].sort((a, b) => a.dueDay - b.dueDay));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const togglePaid = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isPaid: !e.isPaid } : e));
  };

  const handleSetHomeCurrency = (code: string) => {
    setSettings(prev => ({ ...prev, localCurrencySymbol: code }));
  };

  const isMobile = windowWidth < 768;
  const progressSize = isMobile ? Math.floor(windowWidth * 0.33) : 160;
  const progressStroke = isMobile ? Math.max(6, Math.floor(progressSize * 0.08)) : 12;

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-accent selection:text-brand-black overflow-x-hidden">
      <div className="w-full px-2 pb-20 md:px-10 lg:px-16 py-3 md:py-8">
        
        {/* Compact Header */}
        <header className="flex items-center justify-between mb-3 md:mb-8 px-1">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-transparent flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <ScopeLogo className="w-full h-full" />
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase leading-none text-white italic">Scope</h1>
          </div>
          
          <div className="flex items-center space-x-1 bg-brand-card px-2 py-1 md:px-4 md:py-2 rounded-xl border border-white/5 shadow-lg group">
            <ArrowRightLeft className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSyncing ? 'animate-spin' : ''} text-brand-accent`} />
            <div className="flex items-center border-l border-white/10 pl-2 ml-1">
              <button 
                onClick={() => setIsHomeCurrencyPickerOpen(true)}
                className="flex items-center space-x-1 px-1 py-0.5 rounded hover:bg-white/5 transition-colors text-brand-accent font-black text-xs md:text-sm uppercase"
              >
                <span>{getCurrencySymbol(settings.localCurrencySymbol)}</span>
                <span className="opacity-60">{settings.localCurrencySymbol}</span>
                <ChevronDown className="w-3 md:w-3.5 h-3 md:h-3.5 text-brand-muted" />
              </button>
            </div>
            <button 
              onClick={syncRates}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              title="Sync current rates"
            >
              <RefreshCw className={`w-3 md:w-3.5 h-3 md:h-3.5 ${isSyncing ? 'animate-spin text-brand-accent' : 'text-brand-muted'}`} />
            </button>
          </div>
        </header>

        {/* Dashboard Summary */}
        <section className="bg-brand-card p-4 md:p-10 rounded-2xl md:rounded-[40px] border border-white/5 relative overflow-hidden mb-4 md:mb-10 shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none scale-150">
            <TrendingUp className="w-48 h-48 md:w-64 md:h-64" />
          </div>
          
          <div className="flex flex-row items-center justify-between gap-4 md:gap-8 relative z-10">
            <div className="flex-1 text-left overflow-hidden">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-muted block mb-1 md:mb-2">Monthly Target</label>
              <div className="text-3xl md:text-7xl lg:text-8xl font-black text-brand-accent tracking-tighter leading-none mb-4 md:mb-6 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(stats.totalNeeded, settings.localCurrencySymbol)}
              </div>
              
              <div className="flex justify-start gap-6 md:gap-12">
                <div>
                  <span className="text-[9px] md:text-xs text-brand-muted uppercase font-bold tracking-widest block mb-1">Left</span>
                  <span className="text-sm md:text-2xl font-black text-white">{formatCurrency(stats.remaining, settings.localCurrencySymbol)}</span>
                </div>
                <div className="border-l border-white/10 pl-6 md:pl-12">
                  <span className="text-[9px] md:text-xs text-brand-muted uppercase font-bold tracking-widest block mb-1">Paid</span>
                  <span className="text-sm md:text-2xl font-black text-white/50">{formatCurrency(stats.totalPaid, settings.localCurrencySymbol)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center p-2 md:p-6 bg-brand-black/10 rounded-2xl md:rounded-[40px] border border-white/5">
              <CircularProgress 
                percentage={stats.progress} 
                size={progressSize} 
                strokeWidth={progressStroke} 
              />
            </div>
          </div>

          <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-white/5 flex items-center justify-between text-[9px] md:text-xs font-bold uppercase tracking-wider text-brand-muted">
             <div className="flex items-center space-x-3 md:space-x-4">
               <span>{expenses.length} ITEMS</span>
               <span className="text-brand-accent font-black tracking-widest">{Math.round(stats.progress)}% DONE</span>
             </div>
             <span className="hidden sm:flex items-center space-x-1">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
               <span className="uppercase tracking-widest">Live Budgeting</span>
             </span>
          </div>
        </section>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 md:mb-6 px-1">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-brand-muted">Schedule</h2>
          {lastSync && (
             <div className="text-[8px] md:text-[10px] font-bold text-brand-muted opacity-60">
               UPDATED {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          )}
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4">
          {expenses.length === 0 ? (
            <div className="col-span-full text-center py-16 md:py-24 bg-brand-card/20 rounded-2xl border border-dashed border-white/5">
              <Wallet className="w-10 h-10 md:w-12 md:h-12 text-brand-muted mx-auto mb-3 opacity-20" />
              <p className="text-xs md:text-sm text-brand-muted font-bold uppercase tracking-widest">No expenses listed</p>
            </div>
          ) : (
            expenses.map(expense => (
              <ExpenseItem 
                key={expense.id} 
                expense={expense} 
                rates={rates}
                localCurrencySymbol={settings.localCurrencySymbol}
                isNext={expense.id === nextPaymentId}
                onTogglePaid={togglePaid}
                onDelete={deleteExpense}
              />
            ))
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-brand-accent text-brand-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus className="w-8 h-8 md:w-8 md:h-8 stroke-[3]" />
      </button>

      {isModalOpen && (
        <AddExpenseModal 
          onAdd={addExpense} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      <CurrencyPickerModal 
        isOpen={isHomeCurrencyPickerOpen}
        onClose={() => setIsHomeCurrencyPickerOpen(false)}
        selectedCurrency={settings.localCurrencySymbol}
        onSelect={handleSetHomeCurrency}
        title="Base Currency"
      />
    </div>
  );
};

export default App;
