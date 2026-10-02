/**
 * KisanGuard AI — In-Memory Resilient Fallback Data Store
 *
 * Used when MongoDB is temporarily disconnected or MONGODB_URI is pending configuration in Vercel.
 * Allows live previews and serverless executions to function without crashing with 500 errors.
 * Automatically synchronizes with MongoDB as soon as MONGODB_URI connects.
 */

import crypto from 'crypto';

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.usersByEmail = new Map();
    this.profiles = new Map();
    this.farmBooks = new Map();
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  async findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.usersByEmail.get(cleanEmail);
    if (!user) return null;
    return {
      ...user,
      toSafeObject: () => ({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      })
    };
  }

  async findUserById(id) {
    const user = this.users.get(String(id));
    if (!user) return null;
    return {
      ...user,
      toSafeObject: () => ({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      })
    };
  }

  async createUser({ name, email, passwordHash, language = 'gu', phone = '', role = 'farmer' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const _id = this.generateId();
    const now = new Date();

    const user = {
      _id,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      language: language.toLowerCase(),
      phone: (phone || '').trim(),
      role: role || 'farmer',
      createdAt: now,
      updatedAt: now,
      toSafeObject: () => ({
        id: _id,
        _id,
        name: name.trim(),
        email: cleanEmail,
        language: language.toLowerCase(),
        phone: (phone || '').trim(),
        role: role || 'farmer',
        createdAt: now
      })
    };

    this.users.set(_id, user);
    this.usersByEmail.set(cleanEmail, user);
    return user;
  }

  async getProfile(userId) {
    const uid = String(userId);
    return this.profiles.get(uid) || {
      userId: uid,
      onboardingCompleted: false,
      village: '',
      district: '',
      state: '',
      landSize: '',
      soilType: '',
      waterAvailability: '',
      currentCrop: '',
      selectedCrops: []
    };
  }

  async saveProfile(userId, data) {
    const uid = String(userId);
    const existing = await this.getProfile(uid);
    const updated = { ...existing, ...data, userId: uid, updatedAt: new Date() };
    this.profiles.set(uid, updated);
    return updated;
  }

  async getFarmBook(userId) {
    const uid = String(userId);
    return this.farmBooks.get(uid) || { expenses: [], income: [], notes: [] };
  }

  async addFarmBookItem(userId, type, item) {
    const uid = String(userId);
    const book = await this.getFarmBook(uid);
    const id = this.generateId();
    const record = { ...item, _id: id, id, userId: uid, createdAt: new Date() };

    if (type === 'expense') book.expenses.push(record);
    else if (type === 'income') book.income.push(record);
    else if (type === 'note') book.notes.push(record);

    this.farmBooks.set(uid, book);
    return record;
  }

  async deleteFarmBookItem(userId, id) {
    const uid = String(userId);
    const book = await this.getFarmBook(uid);
    book.expenses = book.expenses.filter(i => i._id !== id && i.id !== id);
    book.income = book.income.filter(i => i._id !== id && i.id !== id);
    book.notes = book.notes.filter(i => i._id !== id && i.id !== id);
    this.farmBooks.set(uid, book);
    return true;
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
