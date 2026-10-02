import express from 'express';
import FarmBook from '../models/FarmBook.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/farmbook
 * Returns all financial and note records for the authenticated user, optionally filtered by year.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const query = { userId: req.user.userId };
    if (year && !isNaN(Number(year))) {
      query.year = Number(year);
    }

    const records = await FarmBook.find(query).sort({ date: -1, createdAt: -1 });

    const expenses = [];
    const income = [];
    const notes = [];

    records.forEach(r => {
      const formatted = {
        id: r._id.toString(),
        _id: r._id.toString(),
        type: r.type,
        year: r.year,
        date: r.date,
        crop: r.crop,
        notes: r.notes || '',
        createdAt: r.createdAt
      };

      if (r.type === 'expense') {
        expenses.push({
          ...formatted,
          category: r.category,
          amount: r.amount
        });
      } else if (r.type === 'income') {
        income.push({
          ...formatted,
          quantity: r.quantity,
          unit: r.unit,
          pricePerUnit: r.pricePerUnit,
          totalAmount: r.totalAmount,
          buyer: r.buyer || ''
        });
      } else if (r.type === 'note') {
        notes.push({
          ...formatted,
          title: r.title || '',
          content: r.content || ''
        });
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalIncome = income.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const hasData = expenses.length > 0 || income.length > 0;

    let status = 'NO_DATA';
    if (hasData) {
      if (netProfit > 0) status = 'PROFIT';
      else if (netProfit < 0) status = 'LOSS';
      else status = 'BREAK_EVEN';
    }

    return res.json({
      success: true,
      data: {
        expenses,
        income,
        notes,
        summary: {
          year: year ? Number(year) : 2026,
          hasData,
          totalIncome,
          totalExpenses,
          netProfit,
          status,
          totalExpensesCount: expenses.length,
          totalIncomeCount: income.length
        }
      }
    });
  } catch (err) {
    console.error('[FarmBook GET] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve Farm Book records.' });
  }
});

/**
 * POST /api/farmbook/expense
 * Adds an expense record for the authenticated user.
 */
router.post('/expense', requireAuth, async (req, res) => {
  try {
    const { year, date, category = 'other', amount = 0, crop = 'Cotton', notes = '' } = req.body || {};

    const expense = new FarmBook({
      userId: req.user.userId,
      type: 'expense',
      year: Number(year || 2026),
      date: date || new Date().toISOString().split('T')[0],
      category: String(category).toLowerCase(),
      amount: Number(amount || 0),
      crop: String(crop).trim() || 'Cotton',
      notes: String(notes || '').trim()
    });
    await expense.save();

    return res.status(201).json({
      success: true,
      record: {
        id: expense._id.toString(),
        type: 'expense',
        year: expense.year,
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        crop: expense.crop,
        notes: expense.notes
      }
    });
  } catch (err) {
    console.error('[FarmBook Expense POST] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add expense.' });
  }
});

/**
 * POST /api/farmbook/income
 * Adds an income record for the authenticated user.
 */
router.post('/income', requireAuth, async (req, res) => {
  try {
    const { year, date, crop = 'Cotton', quantity = 0, unit = 'kg', pricePerUnit = 0, totalAmount = 0, buyer = '', notes = '' } = req.body || {};

    const qty = Number(quantity || 0);
    const price = Number(pricePerUnit || 0);
    const calculatedTotal = (qty > 0 && price > 0) ? (qty * price) : Number(totalAmount || 0);

    const income = new FarmBook({
      userId: req.user.userId,
      type: 'income',
      year: Number(year || 2026),
      date: date || new Date().toISOString().split('T')[0],
      crop: String(crop).trim() || 'Cotton',
      quantity: qty,
      unit: String(unit).trim() || 'kg',
      pricePerUnit: price,
      totalAmount: calculatedTotal,
      buyer: String(buyer || '').trim(),
      notes: String(notes || '').trim()
    });
    await income.save();

    return res.status(201).json({
      success: true,
      record: {
        id: income._id.toString(),
        type: 'income',
        year: income.year,
        date: income.date,
        crop: income.crop,
        quantity: income.quantity,
        unit: income.unit,
        pricePerUnit: income.pricePerUnit,
        totalAmount: income.totalAmount,
        buyer: income.buyer,
        notes: income.notes
      }
    });
  } catch (err) {
    console.error('[FarmBook Income POST] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add income.' });
  }
});

/**
 * POST /api/farmbook/note
 * Adds a note record for the authenticated user.
 */
router.post('/note', requireAuth, async (req, res) => {
  try {
    const { year, date, title = '', content = '', crop = 'Cotton' } = req.body || {};

    const note = new FarmBook({
      userId: req.user.userId,
      type: 'note',
      year: Number(year || 2026),
      date: date || new Date().toISOString().split('T')[0],
      title: String(title || '').trim(),
      content: String(content || '').trim(),
      crop: String(crop).trim() || 'Cotton'
    });
    await note.save();

    return res.status(201).json({
      success: true,
      record: {
        id: note._id.toString(),
        type: 'note',
        year: note.year,
        date: note.date,
        title: note.title,
        content: note.content,
        crop: note.crop
      }
    });
  } catch (err) {
    console.error('[FarmBook Note POST] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add note.' });
  }
});

/**
 * PUT /api/farmbook/:id
 * Updates an existing record ensuring ownership by req.user.userId.
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    delete updates.userId; // Prevent userId tampering
    delete updates._id;

    const updated = await FarmBook.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found or access denied.' });
    }

    return res.json({ success: true, record: updated });
  } catch (err) {
    console.error('[FarmBook PUT] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update record.' });
  }
});

/**
 * DELETE /api/farmbook/:id
 * Deletes an existing record ensuring ownership by req.user.userId.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await FarmBook.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found or access denied.' });
    }

    return res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('[FarmBook DELETE] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

export default router;
