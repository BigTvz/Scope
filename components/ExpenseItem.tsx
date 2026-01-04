
import React from 'react';
import { Trash2, CheckCircle2, Zap, Clock } from 'lucide-react';
import { Expense, ExchangeRates } from '../types';
import { formatCurrency, getLogoUrl, calculateConvertedAmount, getRelativeDueString, getOrdinal } from '../services/utils';

interface ExpenseItemProps {
  expense: Expense;
  rates: ExchangeRates;
  localCurrencySymbol: string;
  isNext: boolean;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  expense, 
  rates, 
  localCurrencySymbol,
  isNext,
  onTogglePaid, 
  onDelete 
}) => {
  const convertedAmount = calculateConvertedAmount(
    expense.amount, 
    expense.currency, 
    localCurrencySymbol, 
    rates
  );
  
  const isOneTime = expense.type === 'one-time';
  const relativeDate = getRelativeDueString(expense.dueDay);

  return (
    <div className={`
      relative flex items-center justify-between p-3 md:p-3.5 rounded-xl bg-brand-card border transition-all active:scale-[0.98]
      ${expense.isPaid ? 'opacity-30 grayscale' : 'hover:border-brand-accent/20'}
      ${isNext && !expense.isPaid ? 'ring-2 ring-brand-accent shadow-[0_0_20px_rgba(204,255,0,0.15)] z-10' : ''}
      ${isOneTime && !expense.isPaid ? 'border-l-4 border-l-brand-accent border-white/5' : 'border-white/5'}
    `}>
      {isNext && !expense.isPaid && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-brand-accent text-brand-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
          Next Up
        </div>
      )}

      <div className="flex items-center space-x-3 md:space-x-4 overflow-hidden flex-1">
        <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-lg bg-brand-black flex items-center justify-center border border-white/5 p-1.5 md:p-1.5 overflow-hidden">
          <img 
            src={getLogoUrl(expense.domain, expense.customLogoUrl)} 
            alt={expense.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${expense.name}&background=0B0E11&color=CCFF00&bold=true`;
            }}
          />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm md:text-sm text-white truncate leading-tight">
              {expense.name}
            </h4>
          </div>
          <div className="flex flex-col mt-0.5">
            <div className="flex items-center space-x-1 text-brand-muted">
              <Clock className="w-2.5 h-2.5" />
              <p className="text-[9px] md:text-[9px] truncate uppercase tracking-widest font-bold">
                {getOrdinal(expense.dueDay)} • <span className={!expense.isPaid && (relativeDate === 'Today' || relativeDate === 'Tomorrow') ? 'text-brand-accent' : ''}>{relativeDate}</span>
              </p>
            </div>
            {isOneTime && (
              <div className="mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-brand-accent text-[7px] font-black text-brand-black uppercase shadow-[0_0_10px_rgba(204,255,0,0.1)]">
                  <Zap className="w-2 h-2 mr-0.5 fill-current" />
                  Once
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 ml-2">
        <div className="text-right flex-shrink-0">
          <div className="text-sm md:text-base font-black text-white leading-none">
            {formatCurrency(convertedAmount, localCurrencySymbol)}
          </div>
          {expense.currency !== localCurrencySymbol && (
            <div className="text-[9px] md:text-[9px] text-brand-muted font-bold opacity-50 mt-1">
              {formatCurrency(expense.amount, expense.currency)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 border-l border-white/5 pl-2">
          <button 
            onClick={() => onTogglePaid(expense.id)}
            className={`p-2 md:p-2 rounded-lg transition-all ${
              expense.isPaid 
                ? 'bg-brand-accent text-brand-black' 
                : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 md:w-5 md:h-5" />
          </button>
          
          <button 
            onClick={() => onDelete(expense.id)}
            className="p-1.5 md:p-2 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
