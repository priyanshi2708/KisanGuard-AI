import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Tag, CircleDollarSign } from 'lucide-react';
import { addExpense as addExpenseService } from '../../services/farmBookService';
import { useLanguage } from '../../context/LanguageContext';

export const AddExpenseModal = ({
  isOpen,
  onClose,
  onExpenseAdded,
  editingExpense = null,
  activeYear = 2026,
  onSaveService = null
}) => {
  const { t } = useLanguage();

  const [category, setCategory] = useState('fertilizer');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [crop, setCrop] = useState('Cotton');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category || 'fertilizer');
      setAmount(editingExpense.amount ? String(editingExpense.amount) : '');
      setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
      setCrop(editingExpense.crop || 'Cotton');
      setNotes(editingExpense.notes || '');
    } else {
      setCategory('fertilizer');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCrop('Cotton');
      setNotes('');
    }
    setError('');
  }, [editingExpense, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError(t('farmBook.valAmountRequired'));
      return;
    }
    if (!date) {
      setError(t('farmBook.valDateRequired'));
      return;
    }

    const payload = {
      ...(editingExpense ? { id: editingExpense.id } : {}),
      year: activeYear,
      category,
      amount: Number(amount),
      date,
      crop,
      notes: notes.trim()
    };

    if (onSaveService) {
      onSaveService(payload);
    } else {
      const updated = addExpenseService(payload);
      if (onExpenseAdded) onExpenseAdded(updated);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-green/10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-deep-forest">
                  {editingExpense ? t('farmBook.editExpenseTitle') : t('farmBook.addExpenseTitle')}
                </h3>
                <p className="text-xs text-earth-brown">{t('farmBook.farmYear')}: {activeYear}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-earth-brown/60 hover:text-deep-forest hover:bg-forest-green/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.expenseType')} <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              >
                <option value="seeds">{t('farmBook.catSeeds')}</option>
                <option value="water">{t('farmBook.catWater')}</option>
                <option value="fertilizer">{t('farmBook.catFertilizer')}</option>
                <option value="medicine">{t('farmBook.catMedicine')}</option>
                <option value="labour">{t('farmBook.catLabour')}</option>
                <option value="machinery">{t('farmBook.catMachinery')}</option>
                <option value="fuel">{t('farmBook.catFuel')}</option>
                <option value="other">{t('farmBook.catOther')}</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.amountLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Crop */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.cropLabel')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              >
                <option value="Cotton">{t('farmBook.cropCotton')}</option>
                <option value="Groundnut">{t('farmBook.cropGroundnut')}</option>
                <option value="Wheat">{t('farmBook.cropWheat')}</option>
                <option value="Rice">{t('farmBook.cropRice')}</option>
                <option value="Castor">{t('farmBook.cropCastor')}</option>
                <option value="Mustard">{t('farmBook.cropMustard')}</option>
                <option value="Sugarcane">{t('farmBook.cropSugarcane')}</option>
                <option value="Vegetables">{t('farmBook.cropVegetables')}</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.dateLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.notesLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g. First NPK dose application"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-green/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-earth-brown font-bold hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-forest-green hover:bg-deep-forest text-white font-bold transition-colors shadow-md"
              >
                {t('farmBook.saveExpenseBtn')}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddExpenseModal;
