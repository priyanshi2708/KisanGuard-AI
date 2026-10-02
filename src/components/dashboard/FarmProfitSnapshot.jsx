import React from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmSummary } from '../../services/farmBookService';

export const FarmProfitSnapshot = ({ totals = null, year = 2026 }) => {
  const { t } = useLanguage();
  
  const summary = totals ? {
    totalExpenses: totals.total || 0,
    totalIncome: totals.revenue || 0,
    netProfit: totals.netProfit || 0,
    status: (totals.netProfit || 0) >= 0 ? "PROFIT" : "LOSS"
  } : getFarmSummary(year);

  const revenue = summary.totalIncome || 0;
  const total = summary.totalExpenses || 0;
  const netProfit = summary.netProfit || 0;
  const expensePercent = revenue > 0 ? Math.min(Math.round((total / revenue) * 100), 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-forest-green" />
            <span>💰 {t('farmBook.yourFarmResult')}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">Year {year} Financial Overview</p>
        </div>

        <Link
          to="/farm-book"
          className="inline-flex items-center gap-1 text-xs font-bold text-forest-green hover:text-leaf-green transition-colors"
        >
          <span>{t('farmBook.pageTitle')} →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-1">
          <div className="text-xs text-earth-brown font-semibold">{t('farmBook.totalIncome')}</div>
          <div className="text-2xl font-extrabold font-serif text-forest-green">₹{revenue.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-1">
          <div className="text-xs text-earth-brown font-semibold">{t('farmBook.totalExpenses')}</div>
          <div className="text-2xl font-extrabold font-serif text-deep-forest">₹{total.toLocaleString('en-IN')}</div>
        </div>

        <div className={`p-4 rounded-2xl ${netProfit >= 0 ? 'bg-gradient-to-r from-forest-green to-leaf-green' : 'bg-gradient-to-r from-red-600 to-orange-600'} text-white shadow space-y-1`}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-light-leaf">
              {netProfit >= 0 ? t('farmBook.estimatedProfit') : t('farmBook.estimatedLoss')}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              {netProfit >= 0 ? t('farmBook.statusProfit') : t('farmBook.statusLoss')}
            </span>
          </div>
          <div className="text-2xl font-extrabold font-serif">₹{Math.abs(netProfit).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Expense vs Revenue Progress Visual */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-xs text-earth-brown font-semibold">
          <span>Expenses represent {expensePercent}% of income</span>
          <span className="text-forest-green font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Margin: {summary.marginPercentage || '0.0%'}
          </span>
        </div>
        <div className="w-full h-3.5 bg-light-leaf/60 rounded-full overflow-hidden flex">
          <div className="h-full bg-forest-green transition-all duration-500" style={{ width: `${expensePercent}%` }} />
          <div className="h-full bg-golden-wheat flex-1 transition-all duration-500" />
        </div>
      </div>

    </div>
  );
};

export default FarmProfitSnapshot;
