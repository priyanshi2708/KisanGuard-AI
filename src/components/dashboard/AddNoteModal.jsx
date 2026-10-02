import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AddNoteModal = ({ isOpen, onClose, onSave, activeYear = 2026 }) => {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('Cotton');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a note title.');
      return;
    }
    if (!content.trim()) {
      setError('Please enter note details.');
      return;
    }

    onSave({
      year: activeYear,
      title: title.trim(),
      crop,
      date,
      content: content.trim()
    });

    setTitle('');
    setContent('');
    setError('');
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
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-green/10 space-y-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-deep-forest">
                  {t('farmBook.addNoteBtn')}
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
            
            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.noteTitleLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rain came after 4 days"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-bold text-deep-forest">
                  {t('farmBook.cropLabel')}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
                >
                  <option value="Cotton">{t('farmBook.cropCotton')}</option>
                  <option value="Groundnut">{t('farmBook.cropGroundnut')}</option>
                  <option value="Wheat">{t('farmBook.cropWheat')}</option>
                  <option value="Rice">{t('farmBook.cropRice')}</option>
                  <option value="Other">{t('farmBook.cropOther')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-deep-forest">
                  {t('farmBook.dateLabel')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-deep-forest">
                {t('farmBook.noteDetailsLabel')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="e.g. Used organic fertilizer on Monday. Soil moisture is good."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none bg-warm-cream/50 text-deep-forest font-medium"
              />
            </div>

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
                {t('farmBook.saveNoteBtn')}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddNoteModal;
