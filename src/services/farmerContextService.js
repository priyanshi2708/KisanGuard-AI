/**
 * KisanGuard AI - Farmer Context Service
 * 
 * Aggregates all available farmer context across KisanGuard AI modules:
 * - Farmer profile & location (Profile/Onboarding)
 * - Current crop, previous crop, land size, water availability
 * - Live Weather (`weatherService.js`)
 * - Fire Risk (`fireRiskService.js`)
 * - Financial Profit/Loss history & Farm Book records (`farmBookService.js`)
 * - Crop recommendations (`cropRecommendationService.js`)
 * 
 * Provides unified, decoupled context for AI reasoning and UI context panel display.
 */

import { getCurrentWeather, getFarmerLocation } from './weatherService.js';
import { getFireRisk } from './fireRiskService.js';
import { getFarmSummary, getExpenses, getIncome, getNotes, getCropProfitability } from './farmBookService.js';
import { getCropRecommendations } from './cropRecommendationService.js';
import { getFarmerProfile, getCropHistory } from './farmerProfileService.js';

export const getFarmerContext = (year = 2026) => {
  const profile = getFarmerProfile();
  const cropHistory = getCropHistory();

  // Retrieve Location & Weather
  const location = getFarmerLocation();
  const weather = getCurrentWeather(location);

  // Retrieve Fire Risk
  const fireRisk = getFireRisk(location);

  // Retrieve Farm Book Financial Summary
  const financialSummary = getFarmSummary(year);
  const expenses = getExpenses(year);
  const income = getIncome(year);
  const farmNotes = getNotes(year);
  const cropProfitability = getCropProfitability(year);

  // Retrieve Crop Recommendations
  const cropRecommendations = getCropRecommendations({
    season: 'Kharif',
    soilType: 'Black Soil',
    waterAvailability: profile.waterAvailability
  });

  return {
    profile,
    cropHistory,
    location,
    weather,
    fireRisk,
    financialSummary,
    expenses,
    income,
    farmNotes,
    cropProfitability,
    cropRecommendations,
    year
  };
};

export default {
  getFarmerContext
};
