import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Never return passwordHash in regular queries
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    language: {
      type: String,
      enum: ['en', 'gu', 'hi', 'english', 'gujarati', 'hindi'],
      default: 'gu'
    },
    role: {
      type: String,
      enum: ['farmer', 'expert', 'admin'],
      default: 'farmer'
    }
  },
  {
    timestamps: true
  }
);

// Method to return safe sanitized user object without sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    language: this.language || 'gu',
    role: this.role || 'farmer',
    createdAt: this.createdAt
  };
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
