import express from 'express';
import mongoose from 'mongoose';
import FarmBook from '../models/FarmBook.js';
import memoryStore from '../models/memoryStore.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/farmbook
 * Returns all financial and note records for the authenticated user, optionally filtered by year.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const isMongo = mongoose.connection.readyState === 1;

    let expenses = [];
    let income = [];
    let notes = [];

    if (isMongo) {
      try {
        const query = { userId: req.user.userId };
        if (year && !isNaN(Number(year))) {
          query.year = Number(year);
        }

        const records = await FarmBook.find(query).sort({ date: -1, createdAt: -1 });

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
            expenses.push({ ...formatted, category: r.category, amount: r.amount });
          } else if (r.type === 'income') {
            income.push({ ...formatted, quantity: r.quantity, unit: r.unit, pricePerUnit: r.pricePerUnit, totalAmount: r.totalAmount, buyer: r.buyer || '' });
          } else if (r.type === 'note') {
            notes.push({ ...formatted, title: r.title || '', content: r.content || '' });
          }
        });
      } catch (e) {
        const book = await memoryStore.getFarmBook(req.user.userId);
        expenses = book.expenses;
        income = book.income;
        notes = book.notes;
      }
    } else {
      const book = await memoryStore.getFarmBook(req.user.userId);
      expenses = book.expenses;
      income = book.income;
      notes = book.notes;
    }

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
    const isMongo = mongoose.connection.readyState === 1;

    const payload = {
      type: 'expense',
      year: Number(year || 2026),
      date: date || new Date().toISOString().split('T')[0],
      category: String(category).toLowerCase(),
      amount: Number(amount || 0),
      crop: String(crop).trim() || 'Cotton',
      notes: String(notes || '').trim()
    };

    let record = null;
    if (isMongo) {
      try {
        const expense = new FarmBook({ ...payload, userId: req.user.userId });
        await expense.save();
        record = { ...payload, id: expense._id.toString(), _id: expense._id.toString() };
      } catch (e) {
        record = await memoryStore.addFarmBookItem(req.user.userId, 'expense', payload);
      }
    } else {
      record = await memoryStore.addFarmBookItem(req.user.userId, 'expense', payload);
    }

    return res.status(201).json({ success: true, record });
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
    const isMongo = mongoose.connection.readyState === 1;

    const qty = Number(quantity || 0);
    const price = Number(pricePerUnit || 0);
    const calculatedTotal = (qty > 0 && price > 0) ? (qty * price) : Number(totalAmount || 0);

    const payload = {
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
    };

    let record = null;
    if (isMongo) {
      try {
        const income = new FarmBook({ ...payload, userId: req.user.userId });
        await income.save();
        record = { ...payload, id: income._id.toString(), _id: income._id.toString() };
      } catch (e) {
        record = await memoryStore.addFarmBookItem(req.user.userId, 'income', payload);
      }
    } else {
      record = await memoryStore.addFarmBookItem(req.user.userId, 'income', payload);
    }

    return res.status(201).json({ success: true, record });
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
    const isMongo = mongoose.connection.readyState === 1;

    const payload = {
      type: 'note',
      year: Number(year || 2026),
      date: date || new Date().toISOString().split('T')[0],
      title: String(title || '').trim(),
      content: String(content || '').trim(),
      crop: String(crop).trim() || 'Cotton'
    };

    let record = null;
    if (isMongo) {
      try {
        const note = new FarmBook({ ...payload, userId: req.user.userId });
        await note.save();
        record = { ...payload, id: note._id.toString(), _id: note._id.toString() };
      } catch (e) {
        record = await memoryStore.addFarmBookItem(req.user.userId, 'note', payload);
      }
    } else {
      record = await memoryStore.addFarmBookItem(req.user.userId, 'note', payload);
    }

    return res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('[FarmBook Note POST] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add note.' });
  }
});

/**
 * DELETE /api/farmbook/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isMongo = mongoose.connection.readyState === 1;

    if (isMongo) {
      try {
        await FarmBook.findOneAndDelete({ _id: id, userId: req.user.userId });
      } catch (e) {
        await memoryStore.deleteFarmBookItem(req.user.userId, id);
      }
    } else {
      await memoryStore.deleteFarmBookItem(req.user.userId, id);
    }

    return res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('[FarmBook DELETE] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

export default router;
