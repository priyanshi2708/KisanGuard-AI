import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, CircleDollarSign, TrendingUp, TrendingDown,
  Calendar, Search, Filter, Trash2, Edit3, ArrowRight,
  Sparkles, ShieldCheck, Upload, FileText, CheckCircle2, ChevronRight, AlertCircle, Info, Award
} from 'lucide-react';

import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AddExpenseModal from '../../components/dashboard/AddExpenseModal';
import AddIncomeModal from '../../components/dashboard/AddIncomeModal';
import AddNoteModal from '../../components/dashboard/AddNoteModal';
import ConfirmDeleteModal from '../../components/dashboard/ConfirmDeleteModal';

import { useLanguage } from '../../context/LanguageContext';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
  getNotes,
  addNote,
  deleteNote,
  getFarmSummary,
  getExpenseBreakdown,
  getCropProfitability,
  getYearComparison
} from '../../services/farmBookService';

export const FarmBookPage = () => {
  const { language, setLanguage, t } = useLanguage();

  // State Management
  const [selectedYear, setSelectedYear] = useState(2026);
  const [availableYears, setAvailableYears] = useState([2026, 2025, 2024]);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'income' | 'notes'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit / Delete target items
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Paper notebook photo state
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Data state
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0, status: 'PROFIT', marginPercentage: '0%' });
  const [breakdown, setBreakdown] = useState([]);
  const [cropProfits, setCropProfits] = useState([]);
  const [yearComparison, setYearComparison] = useState([]);

  const loadData = () => {
    const filters = {
      crop: selectedCropFilter,
      category: selectedCategoryFilter,
      search: searchQuery
    };

    const expList = getExpenses(selectedYear, filters);
    const incList = getIncome(selectedYear, filters);
    const noteList = getNotes(selectedYear);

    const sum = getFarmSummary(selectedYear);
    const breakD = getExpenseBreakdown(selectedYear);
    const cropP = getCropProfitability(selectedYear);
    const comp = getYearComparison();

    setExpenses(expList);
    setIncome(incList);
    setNotes(noteList);
    setSummary(sum);
    setBreakdown(breakD);
    setCropProfits(cropP);
    setYearComparison(comp);
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedCropFilter, selectedCategoryFilter, searchQuery]);

  const handleAddNewYear = () => {
    const nextYear = Math.max(...availableYears) + 1;
    setAvailableYears([nextYear, ...availableYears]);
    setSelectedYear(nextYear);
  };

  // Handlers for Save
  const handleSaveExpense = (payload) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
      setEditingExpense(null);
    } else {
      addExpense(payload);
    }
    loadData();
  };

  const handleSaveIncome = (payload) => {
    if (editingIncome) {
      updateIncome(editingIncome.id, payload);
      setEditingIncome(null);
    } else {
      addIncome(payload);
    }
    loadData();
  };

  const handleSaveNote = (payload) => {
    addNote(payload);
    loadData();
  };

  // Handlers for Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'expense') {
      deleteExpense(deleteTarget.item.id);
    } else if (deleteTarget.type === 'income') {
      deleteIncome(deleteTarget.item.id);
    } else if (deleteTarget.type === 'note') {
      deleteNote(deleteTarget.item.id);
    }
    setDeleteTarget(null);
    loadData();
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotos(prev => [{ id: Date.now(), url: reader.result, name: file.name, date: new Date().toLocaleDateString() }, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multilingual Resolvers
  const getCategoryIcon = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'seeds': return '🌱';
      case 'water': return '💧';
      case 'fertilizer': return '🧪';
      case 'medicine': return '💊';
      case 'labour': return '👨‍🌾';
      case 'machinery': return '🚜';
      case 'fuel': return '⛽';
      case 'other': default: return '📦';
    }
  };

  const getCategoryName = (catId) => {
    switch ((catId || '').toLowerCase()) {
      case 'seeds': return t('farmBook.catSeeds');
      case 'water': return t('farmBook.catWater');
      case 'fertilizer': return t('farmBook.catFertilizer');
      case 'medicine': return t('farmBook.catMedicine');
      case 'labour': return t('farmBook.catLabour');
      case 'machinery': return t('farmBook.catMachinery');
      case 'fuel': return t('farmBook.catFuel');
      case 'other': default: return t('farmBook.catOther');
    }
  };

  const getCropName = (cropStr) => {
    switch ((cropStr || '').toLowerCase()) {
      case 'cotton': return t('farmBook.cropCotton');
      case 'groundnut': return t('farmBook.cropGroundnut');
      case 'wheat': return t('farmBook.cropWheat');
      case 'rice': return t('farmBook.cropRice');
      case 'castor': return t('farmBook.cropCastor');
      case 'mustard': return t('farmBook.cropMustard');
      case 'sugarcane': return t('farmBook.cropSugarcane');
      case 'vegetables': return t('farmBook.cropVegetables');
      default: return cropStr || t('farmBook.cropOther');
    }
  };

  const getUnitName = (unitStr) => {
    switch ((unitStr || '').toLowerCase()) {
      case 'kg': return t('farmBook.unitKg');
      case 'quintal': return t('farmBook.unitQuintal');
      case 'ton': return t('farmBook.unitTon');
      case 'liter': return t('farmBook.unitLiter');
      case 'piece': return t('farmBook.unitPiece');
      default: return unitStr || t('farmBook.unitOther');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans pb-16 max-w-7xl mx-auto">
        
        {/* 1. Page Banner & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest-green/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-deep-forest">
                {t('farmBook.pageTitle')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-light-leaf/60 text-forest-green text-[10px] font-bold uppercase tracking-wider">
                {t('farmBook.bannerBadge')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-earth-brown mt-1">
              {t('farmBook.pageSubtitle')}
            </p>
          </div>

          {/* 2. YEAR SELECTOR */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-forest-green/20 shadow-sm self-start md:self-auto">
            <span className="text-xs font-bold text-earth-brown px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-green" />
              <span>{t('farmBook.farmYear')}:</span>
            </span>

            {availableYears.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedYear === yr
                    ? 'bg-forest-green text-white shadow-md'
                    : 'text-earth-brown hover:bg-forest-green/10'
                }`}
              >
                {yr}
              </button>
            ))}

            <button
              onClick={handleAddNewYear}
              className="px-2.5 py-1.5 rounded-xl border border-forest-green/20 text-forest-green font-bold text-xs hover:bg-forest-green hover:text-white transition-colors"
              title="Add New Farm Year"
            >
              {t('farmBook.addNewYear')}
            </button>
          </div>
        </div>

        {/* 3. FARM BOOK HERO SUMMARY CARD */}
        <div className="rounded-3xl bg-gradient-to-br from-deep-forest via-forest-green to-leaf-green text-white p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-golden-wheat">
                📒
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif">
                  {selectedYear} {t('farmBook.bannerTitle')}
                </h2>
                <p className="text-xs text-light-leaf/80">{t('farmBook.heroSubText')}</p>
              </div>
            </div>

            {/* Dynamic Status Badge */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-md border ${
              summary.status === 'PROFIT'
                ? 'bg-emerald-500 text-white border-emerald-300'
                : summary.status === 'LOSS'
                ? 'bg-red-600 text-white border-red-300'
                : 'bg-amber-500 text-white border-amber-300'
            }`}>
              {summary.status === 'PROFIT' && t('farmBook.statusProfit')}
              {summary.status === 'LOSS' && t('farmBook.statusLoss')}
              {summary.status === 'BREAK_EVEN' && t('farmBook.statusBreakEven')}
            </span>
          </div>

          {/* 3 Metrics: Income, Expenses, Profit/Loss */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
            
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-light-leaf font-semibold">{t('farmBook.totalIncome')}</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-warm-cream">
                ₹{summary.totalIncome.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-light-leaf/70">
                {t('farmBook.salesRecordsCount', { count: summary.totalIncomeCount })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="text-xs text-light-leaf font-semibold">{t('farmBook.totalExpenses')}</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-200">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-light-leaf/70">
                {t('farmBook.expenseItemsCount', { count: summary.totalExpensesCount })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 space-y-1">
              <div className="text-xs font-bold text-warm-cream">
                {summary.netProfit >= 0 ? t('farmBook.estimatedProfit') : t('farmBook.estimatedLoss')}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-serif text-white">
                ₹{Math.abs(summary.netProfit).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-200 font-bold">
                {t('farmBook.profitMargin')}: {summary.marginPercentage}
              </div>
            </div>

          </div>

          <div className="pt-2 text-xs text-light-leaf/80 flex items-center justify-between border-t border-white/15 relative z-10">
            <span>🏆 {t('farmBook.bestCropLabel')}: <strong className="text-white">{getCropName(summary.bestCrop)}</strong></span>
            <span>📌 {t('farmBook.highestExpenseLabel')}: <strong className="text-white">{getCategoryName(summary.highestExpenseCategory)}</strong></span>
          </div>

        </div>

        {/* 4. PRIMARY ACTION BUTTONS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-sm border border-forest-green/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-forest-green hover:bg-deep-forest text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('farmBook.addExpenseBtn')}</span>
            </button>

            <button
              onClick={() => {
                setEditingIncome(null);
                setIncomeModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('farmBook.addIncomeBtn')}</span>
            </button>

            <button
              onClick={() => setNoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('farmBook.addNoteBtn')}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-earth-brown/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('farmBook.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-forest-green/20 focus:border-forest-green outline-none text-xs bg-warm-cream/50 font-medium text-deep-forest"
            />
          </div>
        </div>

        {/* 5. EXPENSE CATEGORIES GRID (8 CARDS) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-deep-forest flex items-center gap-2">
            <span>🧪 {t('farmBook.expenseHistoryTitle')} Categories</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {breakdown.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 text-center ${
                  selectedCategoryFilter === cat.id
                    ? 'border-forest-green bg-light-leaf/40 shadow-md scale-105'
                    : 'border-forest-green/10 bg-white hover:border-forest-green/30'
                }`}
              >
                <div className="text-xl">{getCategoryIcon(cat.id)}</div>
                <div className="text-[11px] font-bold text-deep-forest truncate">{getCategoryName(cat.id)}</div>
                <div className="text-xs font-black text-forest-green">₹{cat.total.toLocaleString('en-IN')}</div>
                <div className="text-[9px] text-earth-brown/60 font-mono">{cat.percentage}% {t('farmBook.totalSpent')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. TABBED RECORDS SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
          
          {/* Tabs & Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-green/10 pb-4">
            
            <div className="flex items-center gap-2 border-b sm:border-b-0 border-forest-green/10 pb-2 sm:pb-0">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-forest-green text-white shadow-md'
                    : 'text-earth-brown hover:bg-forest-green/10'
                }`}
              >
                {t('farmBook.expenseTab')} ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'income'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-earth-brown hover:bg-forest-green/10'
                }`}
              >
                {t('farmBook.incomeTab')} ({income.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'notes'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-earth-brown hover:bg-forest-green/10'
                }`}
              >
                {t('farmBook.notesTab')} ({notes.length})
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-forest-green/20 text-deep-forest font-bold bg-warm-cream/50 outline-none"
              >
                <option value="all">{t('farmBook.allCrops')}</option>
                <option value="Cotton">{t('farmBook.cropCotton')}</option>
                <option value="Groundnut">{t('farmBook.cropGroundnut')}</option>
                <option value="Wheat">{t('farmBook.cropWheat')}</option>
              </select>
            </div>

          </div>

          {/* TAB 1: EXPENSE RECORDS LIST */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-warm-cream/40 rounded-2xl border border-forest-green/10">
                  <div className="text-3xl">📒</div>
                  <div className="font-bold text-deep-forest text-sm">{t('farmBook.emptyStateTitle')}</div>
                  <p className="text-xs text-earth-brown max-w-sm mx-auto">{t('farmBook.noExpenseRecords')}</p>
                  <button
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-forest-green text-white font-bold text-xs"
                  >
                    {t('farmBook.addExpenseBtn')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-forest-green/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-forest-green/20 flex items-center justify-center text-lg shadow-sm">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-deep-forest capitalize">
                              {getCategoryName(item.category)}
                            </span>
                            {item.crop && (
                              <span className="px-2.5 py-0.5 rounded-full bg-light-leaf/60 text-forest-green text-[10px] font-bold">
                                {getCropName(item.crop)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-earth-brown italic mt-0.5">
                            "{item.notes || 'No notes'}"
                          </p>
                          <span className="text-[10px] text-earth-brown/60 font-mono">{item.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto">
                        <span className="text-lg font-black font-serif text-deep-forest">
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingExpense(item);
                              setExpenseModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-earth-brown/70 hover:text-forest-green hover:bg-forest-green/10 transition-colors"
                            title={t('farmBook.editBtn')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'expense', item });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-earth-brown/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title={t('farmBook.deleteBtn')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOME RECORDS LIST */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              {income.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-warm-cream/40 rounded-2xl border border-forest-green/10">
                  <div className="text-3xl">🌾</div>
                  <div className="font-bold text-deep-forest text-sm">{t('farmBook.emptyStateTitle')}</div>
                  <p className="text-xs text-earth-brown max-w-sm mx-auto">{t('farmBook.noIncomeRecords')}</p>
                  <button
                    onClick={() => setIncomeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    {t('farmBook.addIncomeBtn')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {income.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-lg shadow-sm text-emerald-600">
                          🌾
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-emerald-900">
                              {getCropName(item.crop)}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                              {item.quantity} {getUnitName(item.unit)} × ₹{item.pricePerUnit}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 italic mt-0.5">
                            "{item.buyer ? `Buyer: ${item.buyer} • ` : ''}{item.notes || 'Crop sale'}"
                          </p>
                          <span className="text-[10px] text-emerald-700/70 font-mono">{item.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto">
                        <span className="text-lg font-black font-serif text-emerald-700">
                          + ₹{Number(item.totalAmount).toLocaleString('en-IN')}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingIncome(item);
                              setIncomeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition-colors"
                            title={t('farmBook.editBtn')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'income', item });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title={t('farmBook.deleteBtn')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FARM NOTES LIST */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-warm-cream/40 rounded-2xl border border-forest-green/10">
                  <div className="text-3xl">📖</div>
                  <div className="font-bold text-deep-forest text-sm">{t('farmBook.noNotesFound')}</div>
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
                  >
                    {t('farmBook.addNoteBtn')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-950 font-serif">{note.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-800">{note.date}</span>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'note', item: note });
                              setDeleteModalOpen(true);
                            }}
                            className="text-amber-800 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                        {getCropName(note.crop)}
                      </span>
                      <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                        "{note.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 7. EXPENSE BREAKDOWN & WHERE DID MY MONEY GO? */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Expense Breakdown Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
            <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2 border-b border-forest-green/10 pb-3">
              <span>{t('farmBook.whereMoneyWent')}</span>
            </h2>

            <div className="space-y-3">
              {breakdown.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-deep-forest">
                    <span className="flex items-center gap-1.5">
                      <span>{getCategoryIcon(cat.id)}</span>
                      <span>{getCategoryName(cat.id)}</span>
                    </span>
                    <span>₹{cat.total.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-warm-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-green rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {breakdown.length > 0 && (
              <div className="p-4 rounded-2xl bg-light-leaf/40 border border-leaf-green/30 text-xs font-bold text-deep-forest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-green" />
                <span>"{t('farmBook.largestExpenseInsight', { category: getCategoryName(breakdown[0].id), percent: breakdown[0].percentage })}"</span>
              </div>
            )}
          </div>

          {/* Right Crop Profitability Ranking & Loss Detection */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
            <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2 border-b border-forest-green/10 pb-3">
              <span>{t('farmBook.cropProfitabilityTitle')}</span>
            </h2>

            <div className="space-y-3">
              {cropProfits.map((cp, idx) => (
                <div
                  key={cp.crop}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    cp.isLoss ? 'bg-red-50/60 border-red-200' : 'bg-warm-cream border-forest-green/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-deep-forest flex items-center gap-1.5">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <span>{getCropName(cp.crop)}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cp.isLoss ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {cp.isLoss ? t('farmBook.statusLoss') : t('farmBook.statusProfit')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-earth-brown/70 font-medium">{t('farmBook.totalIncome')}:</span>
                      <div className="font-bold text-forest-green">₹{cp.income.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <span className="text-earth-brown/70 font-medium">{t('farmBook.totalExpenses')}:</span>
                      <div className="font-bold text-deep-forest">₹{cp.expenses.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <span className="text-earth-brown/70 font-medium">Net Profit:</span>
                      <div className={`font-extrabold ${cp.isLoss ? 'text-red-600' : 'text-emerald-700'}`}>
                        ₹{Math.abs(cp.profit).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {cp.isLoss && (
                    <div className="text-[10px] text-red-700 font-medium italic pt-1 border-t border-red-200">
                      "{t('farmBook.lossExplanation')}"
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* 8. YEAR-TO-YEAR COMPARISON CHART (2024, 2025, 2026) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-green" />
                <span>{t('farmBook.yearlyPerformanceTitle')}</span>
              </h2>
              <p className="text-xs text-earth-brown mt-0.5">3-Year Farm Profitability Comparison</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {yearComparison.map((yc) => (
              <div key={yc.year} className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold font-serif text-deep-forest">{yc.year}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {yc.status === 'PROFIT' ? t('farmBook.statusProfit') : yc.status === 'LOSS' ? t('farmBook.statusLoss') : t('farmBook.statusBreakEven')}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-earth-brown">{t('farmBook.totalIncome')}:</span>
                    <span className="font-bold text-forest-green">₹{yc.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-brown">{t('farmBook.totalExpenses')}:</span>
                    <span className="font-bold text-deep-forest">₹{yc.expenses.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-forest-green/10 font-bold">
                    <span>{t('farmBook.estimatedProfit')}:</span>
                    <span className="text-emerald-700">₹{yc.profit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-light-leaf/40 border border-leaf-green/30 text-xs font-bold text-deep-forest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-green" />
            <span>"{t('farmBook.yearlyComparisonInsight')}"</span>
          </div>
        </div>

        {/* 9. PAPER NOTEBOOK PHOTO UPLOAD PREVIEW */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                <Upload className="w-5 h-5 text-forest-green" />
                <span>{t('farmBook.uploadNotebookTitle')}</span>
              </h2>
              <p className="text-xs text-earth-brown mt-0.5">
                {t('farmBook.uploadNotebookSub')}
              </p>
            </div>

            <label className="px-4 py-2.5 rounded-xl bg-forest-green hover:bg-deep-forest text-white font-bold text-xs cursor-pointer shadow-md transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{t('farmBook.uploadPhotoBtn')}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {uploadedPhotos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-warm-cream/50 border border-dashed border-forest-green/20 text-center text-xs text-earth-brown">
              {t('farmBook.noPhotosYet')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="p-2 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-1">
                  <img src={photo.url} alt={photo.name} className="w-full h-32 object-cover rounded-xl" />
                  <div className="text-[10px] text-earth-brown font-bold truncate">{photo.name}</div>
                  <div className="text-[9px] text-earth-brown/60">{photo.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10. DISCLAIMER FOOTER */}
        <div className="bg-warm-cream p-5 rounded-3xl border border-forest-green/10 text-xs text-earth-brown leading-relaxed font-medium space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-deep-forest">
            <ShieldCheck className="w-4 h-4 text-forest-green" />
            <span>
              {language === 'gu'
                ? 'મહત્વપૂર્ણ નોંધ (DISCLAIMER)'
                : language === 'hi'
                ? 'महत्वपूर्ण सूचना (DISCLAIMER)'
                : 'Important Note (DISCLAIMER)'}
            </span>
          </div>
          <p>"{t('farmBook.disclaimerNote')}"</p>
        </div>

        {/* MODALS */}
        <AddExpenseModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          activeYear={selectedYear}
          editingExpense={editingExpense}
          onSaveService={handleSaveExpense}
        />

        <AddIncomeModal
          isOpen={incomeModalOpen}
          onClose={() => setIncomeModalOpen(false)}
          activeYear={selectedYear}
          editingIncome={editingIncome}
          onSave={handleSaveIncome}
        />

        <AddNoteModal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          activeYear={selectedYear}
          onSave={handleSaveNote}
        />

        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemTitle={deleteTarget?.item?.notes || deleteTarget?.item?.title || deleteTarget?.item?.crop}
        />

      </div>
    </DashboardLayout>
  );
};

export default FarmBookPage;
