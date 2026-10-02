import mongoose from 'mongoose';

const farmBookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['expense', 'income', 'note'],
      required: true,
      index: true
    },
    year: {
      type: Number,
      default: 2026,
      index: true
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    // Expense specific
    category: {
      type: String,
      default: 'other' // seeds, fertilizer, water, medicine, labour, machinery, fuel, other
    },
    amount: {
      type: Number,
      default: 0
    },
    // Income specific
    crop: {
      type: String,
      default: 'Cotton'
    },
    quantity: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: 'kg'
    },
    pricePerUnit: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    buyer: {
      type: String,
      trim: true,
      default: ''
    },
    // Note specific
    title: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const FarmBook = mongoose.models.FarmBook || mongoose.model('FarmBook', farmBookSchema);
export default FarmBook;
