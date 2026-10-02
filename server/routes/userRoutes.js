import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import CropHistory from '../models/CropHistory.js';
import memoryStore from '../models/memoryStore.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Returns the profile of the authenticated farmer.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const isMongo = mongoose.connection.readyState === 1;
    let profile = null;
    let user = null;

    if (isMongo) {
      try {
        profile = await FarmerProfile.findOne({ userId: req.user.userId });
        if (!profile) {
          profile = new FarmerProfile({
            userId: req.user.userId,
            onboardingCompleted: false
          });
          await profile.save().catch(() => {});
        }
        user = await User.findById(req.user.userId).select('name email language phone role');
      } catch (e) {
        profile = await memoryStore.getProfile(req.user.userId);
        user = await memoryStore.findUserById(req.user.userId);
      }
    } else {
      profile = await memoryStore.getProfile(req.user.userId);
      user = await memoryStore.findUserById(req.user.userId);
    }

    return res.json({
      success: true,
      profile: {
        id: profile?._id || req.user.userId,
        userId: req.user.userId,
        farmerName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        language: user?.language || 'gu',
        village: profile?.village || '',
        district: profile?.district || '',
        state: profile?.state || 'Gujarat',
        landSize: profile?.landSize || '',
        soilType: profile?.soilType || '',
        waterAvailability: profile?.waterAvailability || '',
        currentCrop: profile?.currentCrop || 'Cotton',
        selectedCrops: profile?.selectedCrops || ['Cotton'],
        farmingExperience: profile?.farmingExperience || '',
        onboardingCompleted: profile?.onboardingCompleted || false
      }
    });
  } catch (err) {
    console.error('[User/Profile GET] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
});

/**
 * PUT /api/user/profile
 * Updates the profile of the authenticated farmer.
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const {
      name,
      village,
      district,
      state,
      landSize,
      soilType,
      waterAvailability,
      currentCrop,
      selectedCrops,
      farmingExperience,
      onboardingCompleted,
      language
    } = req.body || {};

    const isMongo = mongoose.connection.readyState === 1;

    // 1. User updates
    const userUpdates = {};
    if (name && typeof name === 'string' && name.trim()) userUpdates.name = name.trim();
    if (language && ['en', 'gu', 'hi', 'english', 'gujarati', 'hindi'].includes(language.toLowerCase())) {
      userUpdates.language = language.toLowerCase();
    }

    // 2. Profile updates
    const profileUpdates = {};
    if (village !== undefined) profileUpdates.village = String(village).trim();
    if (district !== undefined) profileUpdates.district = String(district).trim();
    if (state !== undefined) profileUpdates.state = String(state).trim();
    if (landSize !== undefined) profileUpdates.landSize = String(landSize).trim();
    if (soilType !== undefined) profileUpdates.soilType = String(soilType).trim();
    if (waterAvailability !== undefined) profileUpdates.waterAvailability = String(waterAvailability).trim();
    if (currentCrop !== undefined) profileUpdates.currentCrop = String(currentCrop).trim();
    if (selectedCrops !== undefined && Array.isArray(selectedCrops)) profileUpdates.selectedCrops = selectedCrops;
    if (farmingExperience !== undefined) profileUpdates.farmingExperience = String(farmingExperience).trim();
    if (onboardingCompleted !== undefined) profileUpdates.onboardingCompleted = Boolean(onboardingCompleted);

    let profile = null;
    let updatedUser = null;

    if (isMongo) {
      try {
        if (Object.keys(userUpdates).length > 0) {
          await User.findByIdAndUpdate(req.user.userId, userUpdates);
        }
        profile = await FarmerProfile.findOneAndUpdate(
          { userId: req.user.userId },
          { $set: profileUpdates },
          { new: true, upsert: true }
        );
        updatedUser = await User.findById(req.user.userId).select('name email language phone role');
      } catch (e) {
        profile = await memoryStore.saveProfile(req.user.userId, profileUpdates);
        updatedUser = await memoryStore.findUserById(req.user.userId);
      }
    } else {
      profile = await memoryStore.saveProfile(req.user.userId, profileUpdates);
      updatedUser = await memoryStore.findUserById(req.user.userId);
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        id: profile?._id || req.user.userId,
        userId: req.user.userId,
        farmerName: updatedUser?.name || name || '',
        email: updatedUser?.email || '',
        language: updatedUser?.language || language || 'gu',
        village: profile?.village,
        district: profile?.district,
        state: profile?.state,
        landSize: profile?.landSize,
        soilType: profile?.soilType,
        waterAvailability: profile?.waterAvailability,
        currentCrop: profile?.currentCrop,
        selectedCrops: profile?.selectedCrops,
        farmingExperience: profile?.farmingExperience,
        onboardingCompleted: profile?.onboardingCompleted
      }
    });
  } catch (err) {
    console.error('[User/Profile PUT] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * PUT /api/user/language
 * Dedicated endpoint to update preferred language.
 */
router.put('/language', requireAuth, async (req, res) => {
  try {
    const { language } = req.body || {};
    const cleanLang = (language || '').toLowerCase().trim();

    if (!['en', 'gu', 'hi', 'english', 'gujarati', 'hindi'].includes(cleanLang)) {
      return res.status(400).json({ success: false, errorType: 'INVALID_LANGUAGE', message: 'Supported languages are: en, gu, hi.' });
    }

    const isMongo = mongoose.connection.readyState === 1;
    let user = null;

    if (isMongo) {
      try {
        user = await User.findByIdAndUpdate(
          req.user.userId,
          { language: cleanLang },
          { new: true }
        ).select('-passwordHash');
      } catch (e) {
        user = await memoryStore.findUserById(req.user.userId);
        if (user) user.language = cleanLang;
      }
    } else {
      user = await memoryStore.findUserById(req.user.userId);
      if (user) user.language = cleanLang;
    }

    return res.json({
      success: true,
      user: {
        id: req.user.userId,
        language: cleanLang
      }
    });
  } catch (err) {
    console.error('[User/Language PUT] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update language.' });
  }
});

/**
 * GET /api/user/crop-history
 * Returns the farming season history records for the authenticated farmer.
 */
router.get('/crop-history', requireAuth, async (req, res) => {
  try {
    const isMongo = mongoose.connection.readyState === 1;
    let history = [];
    if (isMongo) {
      try {
        const records = await CropHistory.find({ userId: req.user.userId }).sort({ year: -1 });
        history = records.map(h => ({
          id: h._id.toString(),
          crop: h.crop,
          season: h.season,
          year: h.year,
          profitLoss: h.profitLoss,
          lossCause: h.lossCause
        }));
      } catch (e) {}
    }
    return res.json({ success: true, history });
  } catch (err) {
    console.error('[User/CropHistory GET] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load crop history.' });
  }
});

export default router;
