import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, X, Search, Sparkles, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ChatHistorySidebar = ({
  sessions = [],
  activeSessionId = null,
  onSelectSession = null,
  onNewChat = null,
  isOpen = false,
  onClose = null,
  isOpenMobile = false,
  onCloseMobile = null
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter((sess) =>
    (sess.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarTitle = language === 'gu' ? 'વાતચીતનો ઈતિહાસ' : language === 'hi' ? 'बातचीत का इतिहास' : 'Chat history';
  const searchPlaceholder = language === 'gu' ? 'શોધો...' : language === 'hi' ? 'खोजें...' : 'Search...';
  const createNewText = language === 'gu' ? '＋ નવી વાતચીત' : language === 'hi' ? '＋ नई बातचीत' : '＋ Create new chat';

  const content = (
    <div className="flex flex-col h-full font-sans text-xs bg-white rounded-3xl p-4 shadow-xl border border-gray-100">
      
      {/* Header & Search */}
      <div className="space-y-3 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
            {sidebarTitle}
          </h3>
          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[11px]">
            {sessions.length}
          </span>
        </div>

        {/* Search Input Bar (SETO Style) */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200/80 focus:border-forest-green focus:bg-white outline-none text-xs font-medium text-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-0.5 custom-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center text-gray-400 font-medium text-xs space-y-2">
            <Sparkles className="w-6 h-6 mx-auto text-gray-300 animate-pulse" />
            <p>{language === 'gu' ? 'કોઈ ચેટ મળી નથી' : 'No chats found'}</p>
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const isActive = activeSessionId === sess.id;
            const lastMsg = sess.messages && sess.messages.length > 0 ? sess.messages[sess.messages.length - 1] : null;
            const previewText = lastMsg ? (lastMsg.text || lastMsg.responseObj?.text || '') : '';

            return (
              <button
                key={sess.id}
                onClick={() => onSelectSession && onSelectSession(sess.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all border flex items-start gap-2.5 group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/80'
                }`}
              >
                {/* Icon avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'bg-forest-green text-white shadow-sm'
                    : 'bg-emerald-100/70 text-forest-green'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs truncate font-bold ${isActive ? 'text-forest-green' : 'text-gray-800'}`}>
                      {sess.title || (language === 'gu' ? 'નવી વાતચીત' : 'New Chat')}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      {sess.createdAt || 'Today'}
                    </span>
                  </div>
                  {previewText && (
                    <p className="text-[11px] text-gray-400 truncate font-normal mt-0.5">
                      {previewText}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Button (SETO Dark Button Style) */}
      <div className="pt-3 border-t border-gray-100 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full py-3 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{createNewText}</span>
        </button>
      </div>

    </div>
  );

  const activeIsOpen = isOpen || isOpenMobile;
  const activeOnClose = onClose || onCloseMobile;

  return (
    <AnimatePresence>
      {activeIsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 sm:w-96 h-full p-4 relative"
          >
            <button
              onClick={activeOnClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-xl bg-gray-100 text-gray-600 hover:text-black cursor-pointer shadow-sm"
              title="Close history"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-full">
              {content}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChatHistorySidebar;

