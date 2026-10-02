import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, ArrowRight } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import { useLanguage } from '../../context/LanguageContext';
import { getExpenses, addExpense } from '../../services/farmBookService';

export const FarmBookPreview = ({ expensesList = null, onExpenseAdded = null }) => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const displayList = expensesList || getExpenses(2026);
  const total = displayList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const categoryLabelMap = {
    seeds: t('farmBook.catSeeds'),
    water: t('farmBook.catWater'),
    fertilizer: t('farmBook.catFertilizer'),
    medicine: t('farmBook.catMedicine'),
    labour: t('farmBook.catLabour'),
    machinery: t('farmBook.catMachinery'),
    fuel: t('farmBook.catFuel'),
    other: t('farmBook.catOther')
  };

  const handleExpenseSave = (expensePayload) => {
    const updated = addExpense(expensePayload);
    if (onExpenseAdded) onExpenseAdded(updated);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forest-green" />
            <span>📒 {t('farmBook.bannerTitle')}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">{t('farmBook.bannerSub')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-forest-green text-white font-bold text-xs shadow hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>{t('farmBook.addExpenseBtn')}</span>
          </button>

          <Link
            to="/farm-book"
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-forest-green/20 text-deep-forest font-bold text-xs hover:bg-light-leaf/40 transition-colors"
          >
            <span>{t('farmBook.pageTitle')} →</span>
          </Link>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3 font-mono text-sm">
        {displayList.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-dashed border-forest-green/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-brown font-sans font-semibold">
                {categoryLabelMap[item.category] || item.category || 'Expense'}
              </span>
              {item.crop && (
                <span className="px-2 py-0.5 rounded-full bg-light-leaf/50 text-[10px] font-sans font-bold text-forest-green">
                  {item.crop}
                </span>
              )}
              <span className="text-[10px] text-earth-brown/60 font-sans italic hidden sm:inline">
                ({item.notes || 'No note'})
              </span>
            </div>
            <span className="text-forest-green/30 px-2 font-sans text-xs hidden sm:inline">..............................</span>
            <span className="font-bold text-deep-forest">₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2 text-base font-sans font-bold text-deep-forest border-t border-forest-green/20">
          <span>{t('farmBook.totalExpenses')}</span>
          <span className="text-forest-green font-mono">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activeYear={2026}
        onExpenseAdded={handleExpenseSave}
      />

    </div>
  );
};

export default FarmBookPreview;
