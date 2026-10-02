const INITIAL_EXPENSES = [
  { id: '1', type: 'seeds', amount: 4500, date: '2026-07-10', notes: 'Quality hybrid seeds' },
  { id: '2', type: 'fertilizer', amount: 7200, date: '2026-07-18', notes: 'Organic compost & NPK' },
  { id: '3', type: 'water', amount: 2000, date: '2026-07-25', notes: 'Pumping & tube-well' },
  { id: '4', type: 'medicine', amount: 3500, date: '2026-08-01', notes: 'Biopesticide spray' },
  { id: '5', type: 'labour', amount: 8000, date: '2026-08-05', notes: 'Weeding & field prep' }
];

export const getExpenses = () => {
  const saved = localStorage.getItem('kisanguard_expenses');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_EXPENSES;
    }
  }
  localStorage.setItem('kisanguard_expenses', JSON.stringify(INITIAL_EXPENSES));
  return INITIAL_EXPENSES;
};

export const addExpense = (newExpense) => {
  const current = getExpenses();
  const item = {
    id: Date.now().toString(),
    ...newExpense,
    amount: Number(newExpense.amount)
  };
  const updated = [item, ...current];
  localStorage.setItem('kisanguard_expenses', JSON.stringify(updated));
  return updated;
};

export const calculateTotals = (expensesList) => {
  const total = expensesList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const revenue = 55000;
  const netProfit = revenue - total;
  return { total, revenue, netProfit };
};
