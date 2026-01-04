
import React, { useState, useRef, useEffect } from 'react';
import { X, Globe, DollarSign, Calendar, ChevronRight, Repeat, Zap } from 'lucide-react';
import { Expense, Currency } from '../types';
import { CATEGORIES, POPULAR_BRANDS } from '../constants';
import { CurrencyPickerModal } from './CurrencyPickerModal';
import { getCurrencySymbol } from '../services/utils';

interface AddExpenseModalProps {
  onAdd: (expense: Omit<Expense, 'id' | 'isPaid'>) => void;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [type, setType] = useState<'one-time' | 'recurring'>('recurring');
  
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const brandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = brandsRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          behavior: 'auto'
        });
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAdd({
      name,
      domain,
      amount: parseFloat(amount),
      currency,
      dueDay: parseInt(dueDay),
      category,
      type
    });
    onClose();
  };

  const selectBrand = (brand: { name: string; domain: string }) => {
    setName(brand.name);
    setDomain(brand.domain);
    setType('recurring');
    const lowerName = brand.name.toLowerCase();
    if (lowerName.includes('adobe') || lowerName.includes('figma') || lowerName.includes('vercel') || lowerName.includes('slack')) {
      setCategory('saas');
    } else if (lowerName.includes('netflix') || lowerName.includes('spotify') || lowerName.includes('amazon')) {
      setCategory('other');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-brand-card w-full max-w-lg rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 overflow-hidden shadow-2xl max-h-[95vh] flex flex-col transition-all relative">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-white/5 bg-brand-card/50 sticky top-0 backdrop-blur-md z-10">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold">New Expense</h3>
              <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">Plan Your Target</span>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-brand-muted hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto no-scrollbar">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Quick Brands</label>
              <div 
                ref={brandsRef}
                className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar touch-pan-x"
              >
                {POPULAR_BRANDS.map(brand => (
                  <button
                    key={brand.domain}
                    type="button"
                    onClick={() => selectBrand(brand)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                      name === brand.name ? 'bg-brand-accent text-brand-black border-brand-accent' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Expense Type</label>
                <div className="flex p-1 bg-brand-black rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setType('recurring')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all ${
                      type === 'recurring' ? 'bg-brand-card text-brand-accent shadow-lg' : 'text-brand-muted hover:text-white'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Monthly</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('one-time')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all ${
                      type === 'one-time' ? 'bg-brand-card text-brand-accent shadow-lg' : 'text-brand-muted hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>One-time</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Identity</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Grocery"
                    className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    required
                  />
                  <div className="relative">
                    <input 
                      type="text" 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="domain.com (opt)"
                      className="w-full bg-brand-black border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    />
                    <Globe className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Cost</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-brand-black border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-accent transition-colors"
                      required
                    />
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Currency</label>
                  <button
                    type="button"
                    onClick={() => setIsCurrencyPickerOpen(true)}
                    className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-left flex items-center justify-between focus:outline-none hover:border-brand-accent/50 transition-all h-[46px]"
                  >
                    <span className="text-brand-accent">{getCurrencySymbol(currency)} {currency}</span>
                    <ChevronRight className="w-4 h-4 text-brand-muted" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Category</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent appearance-none transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none opacity-40">
                      <ChevronRight className="w-3 h-3 rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-1">Due Day (1-31)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="1" 
                      max="31"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      placeholder="e.g., 15"
                      className="w-full bg-brand-black border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    />
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-brand-accent text-brand-black font-black uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all mt-4 mb-4 shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
            >
              Add Expense
            </button>
          </form>
        </div>

        <CurrencyPickerModal 
          isOpen={isCurrencyPickerOpen}
          onClose={() => setIsCurrencyPickerOpen(false)}
          selectedCurrency={currency}
          onSelect={setCurrency}
          title="Select Expense Currency"
        />
      </div>
    </div>
  );
};
