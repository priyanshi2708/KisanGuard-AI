import mongoose from 'mongoose';

const cropHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    crop: {
      type: String,
      required: true
    },
    season: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    profitLoss: {
      type: String,
      enum: ['Profit', 'Loss', 'Break-even'],
      default: 'Profit'
    },
    lossCause: {
      type: String,
      default: 'None'
    }
  },
  {
    timestamps: true
  }
);

export const CropHistory = mongoose.models.CropHistory || mongoose.model('CropHistory', cropHistorySchema);
export default CropHistory;
