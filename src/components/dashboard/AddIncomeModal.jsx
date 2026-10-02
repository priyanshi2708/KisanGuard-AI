import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CircleDollarSign, Calendar, Tag, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AddIncomeModal = ({ isOpen, onClose, onSave, editingIncome = null, activeYear = 2026 }) => {
  const { t } = useLanguage();
  
  const [crop, setCrop] = useState('Cotton');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingIncome) {
      setCrop(editingIncome.crop || 'Cotton');
      setQuantity(editingIncome.quantity ? String(editingIncome.quantity) : '');
      setUnit(editingIncome.unit || 'kg');
      setPricePerUnit(editingIncome.pricePerUnit ? String(editingIncome.pricePerUnit) : '');
      setDate(editingIncome.date || new Date().toISOString().split('T')[0]);
      setBuyer(editingIncome.buyer || '');
      setNotes(editingIncome.notes || '');
    } else {
      setCrop('Cotton');
      setQuantity('');
      setUnit('kg');
      setPricePerUnit('');
      setDate(new Date().toISOString().split('T')[0]);
      setBuyer('');
      setNotes('');
    }
    setError('');
  }, [editingIncome, isOpen]);

  // Dynamic calculation: Quantity x Price = Total
  const calculatedTotal = (Number(quantity || 0) * Number(pricePerUnit || 0)).toLocaleString('en-IN');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!crop.trim()) {
      setError(t('farmBook.valCropRequired'));
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError(t('farmBook.valAmountRequired'));
      return;
    }
    if (!pricePerUnit || Number(pricePerUnit) <= 0) {
      setError(t('farmBook.valAmountRequired'));
      return;
    }
    if (!date) {
      setError(t('farmBook.valDateRequired'));
      return;
    }

    onSave({
      ...(editingIncome ? { id: editingIncome.id } : {}),
      year: activeYear,
      crop: crop.trim(),
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      totalAmount: Number(quantity) * Number(pricePerUnit),
      date,
      buyer: buyer.trim(),
      notes: notes.trim()
    });

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
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-green/10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-deep-forest">
                  {editingIncome ? t('farmBook.editIncomeTitle') : t('farmBook.addIncomeTitle')}
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
            
            {/* Crop Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.cropLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
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

            {/* Quantity & Unit Row */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-7 space-y-1.5">
                <label className="block font-bold text-deep-forest">
                  {t('farmBook.quantitySold')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 800"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
                />
              </div>

              <div className="col-span-5 space-y-1.5">
                <label className="block font-bold text-deep-forest">
                  {t('farmBook.unitLabel')}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
                >
                  <option value="kg">{t('farmBook.unitKg')}</option>
                  <option value="quintal">{t('farmBook.unitQuintal')}</option>
                  <option value="ton">{t('farmBook.unitTon')}</option>
                  <option value="liter">{t('farmBook.unitLiter')}</option>
                  <option value="piece">{t('farmBook.unitPiece')}</option>
                  <option value="other">{t('farmBook.unitOther')}</option>
                </select>
              </div>
            </div>

            {/* Price Per Unit */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.sellingPrice')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 65"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Total Calculated Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t('farmBook.totalAmountCalculated')}:</span>
              </div>
              <span className="text-lg font-black font-serif text-emerald-700">
                ₹{calculatedTotal}
              </span>
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
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Buyer / Market */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.buyerLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g. APMC Market"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.notesLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g. Harvest sale batch"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green focus:ring-1 focus:ring-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
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
                {t('farmBook.saveIncomeBtn')}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddIncomeModal;
