/**
 * KISANGUARD AI — DEMO / TEST DATASET
 * 
 * IMPORTANT CLASSIFICATION:
 * 🔵 DEMO DATASET / TEST DATA ONLY
 * ⚠️ NOT REAL FARMER PRODUCTION DATA
 * 
 * This module exports standardized test scenarios (Farmers A–H) used for
 * repeatable verification of recommendations, crop risks, market prices,
 * weather integration, and multilingual voice/text flows.
 */

export const DEMO_DATASET_METADATA = {
  isDemoData: true,
  datasetVersion: "1.0.0",
  classification: "DEMO_TEST_DATASET_ONLY",
  purpose: "Automated regression, demo scenarios, & system verification",
  createdDate: "2026-09-27"
};

export const DEMO_FARMERS = {
  // Farmer A — Low-water cotton farmer (Kharif season)
  FARMER_A: {
    id: "demo_farmer_a",
    name: "Kishorbhai Patel (કિશોરભાઈ પટેલ)",
    district: "Anand",
    village: "Mogri",
    state: "Gujarat",
    landSizeAcres: 2.0,
    landSizeCategory: "2–5 acres",
    soilType: "Loamy / Black Soil",
    waterAvailability: "low", // Limited seasonal rain & borewell
    season: "Kharif",
    currentCrop: "Cotton",
    previousCrops: ["Cotton", "Wheat"],
    farmingHistory: [
      { year: 2024, crop: "Cotton", outcome: "loss", profitLossAmount: -12000, lossCauses: ["Pink bollworm", "Water shortage"] },
      { year: 2023, crop: "Wheat", outcome: "small", profitLossAmount: 8000, lossCauses: [] }
    ],
    languagePreference: "gu",
    voiceFirst: false
  },

  // Farmer B — High-water paddy/wheat farmer
  FARMER_B: {
    id: "demo_farmer_b",
    name: "Rameshbhai Parmar (રમેશભાઈ પરમાર)",
    district: "Kheda",
    village: "Nadiad",
    state: "Gujarat",
    landSizeAcres: 5.5,
    landSizeCategory: "5–10 acres",
    soilType: "Alluvial / Deep Clay",
    waterAvailability: "high", // Canal irrigation active
    season: "Kharif",
    currentCrop: "Paddy (Rice)",
    previousCrops: ["Paddy", "Wheat"],
    farmingHistory: [
      { year: 2024, crop: "Paddy", outcome: "good", profitLossAmount: 45000, lossCauses: [] },
      { year: 2023, crop: "Wheat", outcome: "good", profitLossAmount: 38000, lossCauses: [] }
    ],
    languagePreference: "gu",
    voiceFirst: false
  },

  // Farmer C — Previous crop loss farmer
  FARMER_C: {
    id: "demo_farmer_c",
    name: "Bhavna Ben (ભાવનાબેન)",
    district: "Rajkot",
    village: "Gondal",
    state: "Gujarat",
    landSizeAcres: 3.0,
    landSizeCategory: "2–5 acres",
    soilType: "Medium Black Soil",
    waterAvailability: "medium",
    season: "Kharif",
    currentCrop: "Groundnut",
    previousCrops: ["Groundnut", "Sesame"],
    farmingHistory: [
      { year: 2024, crop: "Groundnut", outcome: "heavy_loss", profitLossAmount: -25000, lossCauses: ["White grub pest", "Unseasonal rain"] }
    ],
    languagePreference: "gu",
    voiceFirst: true
  },

  // Farmer D — Rabi season cumin farmer
  FARMER_D: {
    id: "demo_farmer_d",
    name: "Manishbhai Chaudhari (મનીષભાઈ ચૌધરી)",
    district: "Junagadh",
    village: "Keshod",
    state: "Gujarat",
    landSizeAcres: 4.0,
    landSizeCategory: "2–5 acres",
    soilType: "Black Clay Soil",
    waterAvailability: "medium",
    season: "Rabi",
    currentCrop: "Cumin",
    previousCrops: ["Cotton", "Cumin"],
    farmingHistory: [
      { year: 2024, crop: "Cumin", outcome: "good", profitLossAmount: 62000, lossCauses: [] }
    ],
    languagePreference: "gu",
    voiceFirst: false
  },

  // Farmer E — Vegetable/Mustard farmer
  FARMER_E: {
    id: "demo_farmer_e",
    name: "Girishbhai Thakor (ગિરીશભાઈ ઠાકોર)",
    district: "Mehsana",
    village: "Visnagar",
    state: "Gujarat",
    landSizeAcres: 1.5,
    landSizeCategory: "1–2 acres",
    soilType: "Sandy Loam Soil",
    waterAvailability: "low",
    season: "Rabi",
    currentCrop: "Mustard",
    previousCrops: ["Bajra", "Mustard"],
    farmingHistory: [
      { year: 2024, crop: "Mustard", outcome: "small", profitLossAmount: 14000, lossCauses: [] }
    ],
    languagePreference: "gu",
    voiceFirst: false
  },

  // Farmer F — Incomplete profile farmer (Testing empty state / prompts)
  FARMER_F: {
    id: "demo_farmer_f",
    name: "New Demo User (નવો ખેડૂત)",
    district: "",
    village: "",
    state: "Gujarat",
    landSizeAcres: 0,
    landSizeCategory: "",
    soilType: "",
    waterAvailability: "unknown",
    season: "",
    currentCrop: "none",
    previousCrops: [],
    farmingHistory: [],
    languagePreference: "gu",
    voiceFirst: false
  },

  // Farmer G — Multilingual farmer
  FARMER_G: {
    id: "demo_farmer_g",
    name: "Rajesh Sharma (રાજેશ શર્મા)",
    district: "Anand",
    village: "Anand Town",
    state: "Gujarat",
    landSizeAcres: 3.5,
    landSizeCategory: "2–5 acres",
    soilType: "Loam Soil",
    waterAvailability: "medium",
    season: "Kharif",
    currentCrop: "Maize",
    previousCrops: ["Maize", "Wheat"],
    farmingHistory: [
      { year: 2024, crop: "Maize", outcome: "small", profitLossAmount: 11000, lossCauses: [] }
    ],
    languagePreference: "hi", // Hindi test primary
    voiceFirst: false
  },

  // Farmer H — Voice-first farmer
  FARMER_H: {
    id: "demo_farmer_h",
    name: "Dineshbhai Rabari (દિનેશભાઈ રબારી)",
    district: "Banaskantha",
    village: "Palanpur",
    state: "Gujarat",
    landSizeAcres: 8.0,
    landSizeCategory: "5–10 acres",
    soilType: "Sandy Soil",
    waterAvailability: "low",
    season: "Kharif",
    currentCrop: "Castor",
    previousCrops: ["Castor", "Bajra"],
    farmingHistory: [
      { year: 2024, crop: "Castor", outcome: "good", profitLossAmount: 52000, lossCauses: [] }
    ],
    languagePreference: "gu",
    voiceFirst: true // Dedicated voice testing
  }
};

/**
 * Helper to retrieve a safe copy of a Demo Farmer Profile without mutating source
 */
export function getDemoFarmerProfile(farmerKey = 'FARMER_A') {
  const profile = DEMO_FARMERS[farmerKey] || DEMO_FARMERS.FARMER_A;
  return { ...profile, _isDemoProfile: true };
}

/**
 * Reset demo environment storage safely
 */
export function resetDemoStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('kisanguard_demo_active_user');
  }
  return { success: true, message: "Demo storage reset cleanly" };
}
