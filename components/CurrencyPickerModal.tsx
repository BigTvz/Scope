
import React, { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { CURRENCY_LIST } from '../constants';
import { getCurrencySymbol } from '../services/utils';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  title?: string;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCurrency,
  onSelect,
  title = "Select Currency"
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    return CURRENCY_LIST.filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-brand-card w-full max-w-lg rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 overflow-hidden shadow-2xl h-[90vh] md:h-auto md:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-brand-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-brand-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
        </div>

        <div className="p-4 border-b border-white/5 bg-brand-black/20">
          <div className="relative">
            <input 
              autoFocus
              type="text"
              placeholder="Search code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-all placeholder:text-brand-muted/50"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-muted" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-brand-black/10">
          {filteredCurrencies.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onSelect(c.code);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all border ${
                selectedCurrency === c.code 
                  ? 'bg-brand-accent/10 border-brand-accent/30' 
                  : 'hover:bg-white/5 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-brand-black flex items-center justify-center border border-white/5 text-lg font-bold text-brand-accent">
                   {getCurrencySymbol(c.code)}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold ${selectedCurrency === c.code ? 'text-brand-accent' : 'text-white'}`}>
                    {c.code}
                  </span>
                  <span className="text-[10px] text-brand-muted uppercase tracking-wider font-medium">
                    {c.name}
                  </span>
                </div>
              </div>
              {selectedCurrency === c.code && (
                <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                  <Check className="w-3.5 h-3.5 text-brand-black stroke-[3]" />
                </div>
              )}
            </button>
          ))}
          {filteredCurrencies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <Search className="w-10 h-10 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">No results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
