import express from 'express';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import CropHistory from '../models/CropHistory.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Returns the profile of the authenticated farmer.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({ userId: req.user.userId });
    
    // Auto-create default profile if missing
    if (!profile) {
      profile = new FarmerProfile({
        userId: req.user.userId,
        onboardingCompleted: false
      });
      await profile.save();
    }

    const user = await User.findById(req.user.userId).select('name email language phone role');

    return res.json({
      success: true,
      profile: {
        id: profile._id,
        userId: profile.userId,
        farmerName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        language: user?.language || 'gu',
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || 'Gujarat',
        landSize: profile.landSize || '',
        soilType: profile.soilType || '',
        waterAvailability: profile.waterAvailability || '',
        currentCrop: profile.currentCrop || 'Cotton',
        selectedCrops: profile.selectedCrops || ['Cotton'],
        farmingExperience: profile.farmingExperience || '',
        onboardingCompleted: profile.onboardingCompleted || false
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

    // 1. Update user document if name or language changed
    const userUpdates = {};
    if (name && typeof name === 'string' && name.trim()) userUpdates.name = name.trim();
    if (language && ['en', 'gu', 'hi', 'english', 'gujarati', 'hindi'].includes(language.toLowerCase())) {
      userUpdates.language = language.toLowerCase();
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.userId, userUpdates);
    }

    // 2. Update profile document
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

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: profileUpdates },
      { new: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user.userId).select('name email language phone role');

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        id: profile._id,
        userId: profile.userId,
        farmerName: updatedUser?.name || '',
        email: updatedUser?.email || '',
        language: updatedUser?.language || 'gu',
        village: profile.village,
        district: profile.district,
        state: profile.state,
        landSize: profile.landSize,
        soilType: profile.soilType,
        waterAvailability: profile.waterAvailability,
        currentCrop: profile.currentCrop,
        selectedCrops: profile.selectedCrops,
        farmingExperience: profile.farmingExperience,
        onboardingCompleted: profile.onboardingCompleted
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

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { language: cleanLang },
      { new: true }
    ).select('-passwordHash');

    return res.json({
      success: true,
      user: user.toSafeObject()
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
    const history = await CropHistory.find({ userId: req.user.userId }).sort({ year: -1 });
    return res.json({
      success: true,
      history: history.map(h => ({
        id: h._id.toString(),
        crop: h.crop,
        season: h.season,
        year: h.year,
        profitLoss: h.profitLoss,
        lossCause: h.lossCause
      }))
    });
  } catch (err) {
    console.error('[User/CropHistory GET] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load crop history.' });
  }
});

/**
 * POST /api/user/crop-history
 * Adds a new crop history record.
 */
router.post('/crop-history', requireAuth, async (req, res) => {
  try {
    const { crop, season, year, profitLoss = 'Profit', lossCause = 'None' } = req.body || {};

    if (!crop || !season || !year) {
      return res.status(400).json({ success: false, message: 'Crop, season, and year are required.' });
    }

    const record = new CropHistory({
      userId: req.user.userId,
      crop: String(crop).trim(),
      season: String(season).trim(),
      year: Number(year),
      profitLoss,
      lossCause
    });
    await record.save();

    return res.status(201).json({
      success: true,
      record: {
        id: record._id.toString(),
        crop: record.crop,
        season: record.season,
        year: record.year,
        profitLoss: record.profitLoss,
        lossCause: record.lossCause
      }
    });
  } catch (err) {
    console.error('[User/CropHistory POST] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add crop history record.' });
  }
});

export default router;
