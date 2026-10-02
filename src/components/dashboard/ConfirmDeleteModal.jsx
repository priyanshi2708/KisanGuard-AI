import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemTitle = '' }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-red-100 text-center space-y-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-deep-forest">
              {t('farmBook.confirmDeleteTitle')}
            </h3>
            <p className="text-xs text-earth-brown leading-relaxed font-medium">
              {t('farmBook.confirmDeleteMsg')}
            </p>
            {itemTitle && (
              <div className="text-xs font-bold text-red-700 pt-1 font-mono">
                "{itemTitle}"
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-earth-brown font-bold text-xs hover:bg-gray-50 transition-colors w-full"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md w-full flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('farmBook.deleteBtn')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
