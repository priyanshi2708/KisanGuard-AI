import mongoose from 'mongoose';

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: 'Gujarat'
    },
    landSize: {
      type: String,
      trim: true,
      default: ''
    },
    soilType: {
      type: String,
      trim: true,
      default: ''
    },
    waterAvailability: {
      type: String,
      trim: true,
      default: ''
    },
    currentCrop: {
      type: String,
      trim: true,
      default: 'Cotton'
    },
    selectedCrops: {
      type: [String],
      default: ['Cotton']
    },
    farmingExperience: {
      type: String,
      default: ''
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const FarmerProfile = mongoose.models.FarmerProfile || mongoose.model('FarmerProfile', farmerProfileSchema);
export default FarmerProfile;
