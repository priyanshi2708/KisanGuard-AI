/**
 * KisanGuard AI - Farm Book & Profit / Loss Tracker Service
 * 
 * Manages financial tracking, expense categorizations, crop income records,
 * profit/loss calculations, expense breakdowns, crop profitability rankings, and multi-year comparisons.
 * 
 * Integrates with MongoDB backend (/api/farmbook) and maintains local cache for instant UI rendering.
 */

import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

const INITIAL_EXPENSES = [];
const INITIAL_INCOME = [];
const INITIAL_NOTES = [];

const getUserId = () => {
  try {
    if (typeof localStorage === 'undefined') return 'default_farmer';
    const acc = localStorage.getItem('kisanguard_account');
    if (acc) {
      const parsed = JSON.parse(acc);
      if (parsed.id || parsed._id) return parsed.id || parsed._id;
      if (parsed.phone || parsed.email) return parsed.phone || parsed.email;
    }
  } catch (e) {}
  return 'default_farmer';
};

const getStorageKey = (key) => `kisanguard_farmbook_${getUserId()}_${key}`;

/**
 * Fetches remote farm book records from MongoDB backend and syncs local cache
 */
export const fetchRemoteFarmBook = async (year = null) => {
  try {
    const params = year ? { year } : {};
    const res = await apiGet('/api/farmbook', params);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const { expenses, income, notes } = data.data;
        if (Array.isArray(expenses)) localStorage.setItem(getStorageKey('expenses'), JSON.stringify(expenses));
        if (Array.isArray(income)) localStorage.setItem(getStorageKey('income'), JSON.stringify(income));
        if (Array.isArray(notes)) localStorage.setItem(getStorageKey('notes'), JSON.stringify(notes));
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[FarmBookService] Remote fetch notice:', err.message);
  }
  return null;
};

/**
 * Expense CRUD & Storage
 */
export const getExpenses = (year = 2026, filters = {}) => {
  let list = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('expenses'));
      if (saved) {
        list = JSON.parse(saved);
      }
    }
  } catch (e) {
    console.error("Error reading farm expenses:", e);
  }

  let filtered = list.filter(item => Number(item.year || 2026) === Number(year));

  if (filters.crop && filters.crop !== 'all') {
    filtered = filtered.filter(item => (item.crop || '').toLowerCase() === filters.crop.toLowerCase());
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => (item.category || '').toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      (item.notes || '').toLowerCase().includes(q) ||
      (item.crop || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  }

  return filtered;
};

export const addExpense = (expenseData) => {
  try {
    const saved = localStorage.getItem(getStorageKey('expenses'));
    const current = saved ? JSON.parse(saved) : [];

    const newItem = {
      id: `exp-${Date.now()}`,
      year: Number(expenseData.year || 2026),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      category: expenseData.category || 'other',
      amount: Number(expenseData.amount || 0),
      crop: expenseData.crop || 'Cotton',
      notes: expenseData.notes || ''
    };

    const updated = [newItem, ...current];
    localStorage.setItem(getStorageKey('expenses'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiPost('/api/farmbook/expense', newItem).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error adding expense:", e);
    return [];
  }
};

export const updateExpense = (id, updatedData) => {
  try {
    const saved = localStorage.getItem(getStorageKey('expenses'));
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.map(item => item.id === id ? { ...item, ...updatedData, amount: Number(updatedData.amount) } : item);
    localStorage.setItem(getStorageKey('expenses'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiPut(`/api/farmbook/${id}`, updatedData).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error updating expense:", e);
    return [];
  }
};

export const deleteExpense = (id) => {
  try {
    const saved = localStorage.getItem(getStorageKey('expenses'));
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(getStorageKey('expenses'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiDelete(`/api/farmbook/${id}`).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error deleting expense:", e);
    return [];
  }
};

/**
 * Income CRUD & Storage
 */
export const getIncome = (year = 2026, filters = {}) => {
  let list = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('income'));
      if (saved) {
        list = JSON.parse(saved);
      }
    }
  } catch (e) {
    console.error("Error reading farm income:", e);
  }

  let filtered = list.filter(item => Number(item.year || 2026) === Number(year));

  if (filters.crop && filters.crop !== 'all') {
    filtered = filtered.filter(item => (item.crop || '').toLowerCase() === filters.crop.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      (item.buyer || '').toLowerCase().includes(q) ||
      (item.crop || '').toLowerCase().includes(q) ||
      (item.notes || '').toLowerCase().includes(q)
    );
  }

  return filtered;
};

export const addIncome = (incomeData) => {
  try {
    const saved = localStorage.getItem(getStorageKey('income'));
    const current = saved ? JSON.parse(saved) : [];

    const qty = Number(incomeData.quantity || 0);
    const price = Number(incomeData.pricePerUnit || 0);
    const total = qty > 0 && price > 0 ? qty * price : Number(incomeData.totalAmount || 0);

    const newItem = {
      id: `inc-${Date.now()}`,
      year: Number(incomeData.year || 2026),
      date: incomeData.date || new Date().toISOString().split('T')[0],
      crop: incomeData.crop || 'Cotton',
      quantity: qty,
      unit: incomeData.unit || 'kg',
      pricePerUnit: price,
      totalAmount: total > 0 ? total : Number(incomeData.totalAmount || 0),
      buyer: incomeData.buyer || '',
      notes: incomeData.notes || ''
    };

    const updated = [newItem, ...current];
    localStorage.setItem(getStorageKey('income'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiPost('/api/farmbook/income', newItem).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error adding income:", e);
    return [];
  }
};

export const updateIncome = (id, updatedData) => {
  try {
    const saved = localStorage.getItem(getStorageKey('income'));
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.map(item => {
      if (item.id === id) {
        const qty = Number(updatedData.quantity !== undefined ? updatedData.quantity : item.quantity);
        const price = Number(updatedData.pricePerUnit !== undefined ? updatedData.pricePerUnit : item.pricePerUnit);
        const total = qty > 0 && price > 0 ? qty * price : Number(updatedData.totalAmount || item.totalAmount);
        return { ...item, ...updatedData, quantity: qty, pricePerUnit: price, totalAmount: total };
      }
      return item;
    });
    localStorage.setItem(getStorageKey('income'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiPut(`/api/farmbook/${id}`, updatedData).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error updating income:", e);
    return [];
  }
};

export const deleteIncome = (id) => {
  try {
    const saved = localStorage.getItem(getStorageKey('income'));
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(getStorageKey('income'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiDelete(`/api/farmbook/${id}`).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error deleting income:", e);
    return [];
  }
};

/**
 * Notes CRUD & Storage
 */
export const getNotes = (year = 2026) => {
  let list = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('notes'));
      if (saved) {
        list = JSON.parse(saved);
      }
    }
  } catch (e) {
    console.error("Error reading farm notes:", e);
  }
  return list.filter(item => Number(item.year || 2026) === Number(year));
};

export const addNote = (noteData) => {
  try {
    const saved = localStorage.getItem(getStorageKey('notes'));
    const current = saved ? JSON.parse(saved) : [];

    const newItem = {
      id: `note-${Date.now()}`,
      year: Number(noteData.year || 2026),
      date: noteData.date || new Date().toISOString().split('T')[0],
      title: noteData.title || '',
      crop: noteData.crop || 'Cotton',
      content: noteData.content || ''
    };

    const updated = [newItem, ...current];
    localStorage.setItem(getStorageKey('notes'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiPost('/api/farmbook/note', newItem).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error adding note:", e);
    return [];
  }
};

export const deleteNote = (id) => {
  try {
    const saved = localStorage.getItem(getStorageKey('notes'));
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(getStorageKey('notes'), JSON.stringify(updated));

    // Sync to backend MongoDB
    apiDelete(`/api/farmbook/${id}`).catch(() => {});

    return updated;
  } catch (e) {
    console.error("Error deleting note:", e);
    return [];
  }
};

/**
 * Primary Farm Summary Metrics
 */
export const getFarmSummary = (year = 2026) => {
  const expensesList = getExpenses(year);
  const incomeList = getIncome(year);

  const totalExpenses = expensesList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalIncome = incomeList.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const hasData = expensesList.length > 0 || incomeList.length > 0;

  let status = "NO_DATA";
  if (hasData) {
    if (netProfit > 0) status = "PROFIT";
    else if (netProfit < 0) status = "LOSS";
    else status = "BREAK_EVEN";
  }

  const marginPercentage = (hasData && totalIncome > 0) ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  // Compute breakdown for highest expense and best crop
  const breakdown = getExpenseBreakdown(year);
  const highestExpenseCategory = breakdown.length > 0 && breakdown[0].total > 0 ? breakdown[0].name : null;

  const cropProfits = getCropProfitability(year);
  const bestCrop = cropProfits.length > 0 ? cropProfits[0].crop : null;

  return {
    year: Number(year),
    hasData,
    totalIncome,
    totalExpenses,
    netProfit,
    status,
    marginPercentage: `${marginPercentage}%`,
    highestExpenseCategory,
    bestCrop,
    totalExpensesCount: expensesList.length,
    totalIncomeCount: incomeList.length
  };
};

/**
 * Expense Breakdown by Category
 */
export const getExpenseBreakdown = (year = 2026) => {
  const expensesList = getExpenses(year);
  const totalExpenses = expensesList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const categoryMap = {
    seeds: { id: "seeds", name: "Seeds", icon: "Sprout", total: 0 },
    water: { id: "water", name: "Water", icon: "Droplets", total: 0 },
    fertilizer: { id: "fertilizer", name: "Fertilizer", icon: "FlaskConical", total: 0 },
    medicine: { id: "medicine", name: "Medicine", icon: "Pill", total: 0 },
    labour: { id: "labour", name: "Labour", icon: "Users", total: 0 },
    machinery: { id: "machinery", name: "Machinery", icon: "Tractor", total: 0 },
    fuel: { id: "fuel", name: "Fuel", icon: "Fuel", total: 0 },
    other: { id: "other", name: "Other", icon: "Package", total: 0 }
  };

  expensesList.forEach(item => {
    const cat = (item.category || 'other').toLowerCase();
    if (categoryMap[cat]) {
      categoryMap[cat].total += Number(item.amount || 0);
    } else {
      categoryMap.other.total += Number(item.amount || 0);
    }
  });

  const categoriesArray = Object.values(categoryMap).map(cat => ({
    ...cat,
    percentage: totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0
  }));

  // Sort by highest expenditure
  return categoriesArray.sort((a, b) => b.total - a.total);
};

/**
 * Crop Profitability Analysis & Loss Detection
 */
export const getCropProfitability = (year = 2026) => {
  const expensesList = getExpenses(year);
  const incomeList = getIncome(year);

  const cropMap = {};

  expensesList.forEach(item => {
    const crop = item.crop || 'Cotton';
    if (!cropMap[crop]) {
      cropMap[crop] = { crop, income: 0, expenses: 0, highestExpenseCat: 'Labour' };
    }
    cropMap[crop].expenses += Number(item.amount || 0);
  });

  incomeList.forEach(item => {
    const crop = item.crop || 'Cotton';
    if (!cropMap[crop]) {
      cropMap[crop] = { crop, income: 0, expenses: 0, highestExpenseCat: 'Labour' };
    }
    cropMap[crop].income += Number(item.totalAmount || 0);
  });

  const cropList = Object.values(cropMap).map(item => {
    const profit = item.income - item.expenses;
    let status = "BREAK_EVEN";
    if (profit > 0) status = "PROFIT";
    else if (profit < 0) status = "LOSS";

    return {
      ...item,
      profit,
      status,
      isLoss: profit < 0
    };
  });

  // Sort crops by highest profit
  return cropList.sort((a, b) => b.profit - a.profit);
};

/**
 * Year-to-Year Performance Comparison
 */
export const getYearComparison = () => {
  const years = [2024, 2025, 2026];
  return years.map(yr => {
    const summary = getFarmSummary(yr);
    return {
      year: yr,
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      profit: summary.netProfit,
      status: summary.status
    };
  });
};

/**
 * Export for AI Crop Recommendation integration
 */
export const getFarmerFinancialHistory = () => {
  const summary2026 = getFarmSummary(2026);
  const cropProfits = getCropProfitability(2026);
  const comparison = getYearComparison();

  return {
    currentYear: 2026,
    totalIncome: summary2026.totalIncome,
    totalExpenses: summary2026.totalExpenses,
    netProfit: summary2026.netProfit,
    bestCrop: summary2026.bestCrop,
    cropProfits,
    comparison
  };
};

export default {
  fetchRemoteFarmBook,
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
  getYearComparison,
  getFarmerFinancialHistory
};
