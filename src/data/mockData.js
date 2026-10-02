export const landSizes = [
  { id: '1', label: '< 1 acre', icon: '🌱' },
  { id: '2', label: '1–2 acres', icon: '🌾' },
  { id: '3', label: '2–5 acres', icon: '🌻' },
  { id: '4', label: '5–10 acres', icon: '🚜' },
  { id: '5', label: '10+ acres', icon: '🏞️' }
];

export const cropsList = [
  { id: 'wheat', name: 'Wheat', hindi: 'गेहूं', gujarati: 'ઘઉં', icon: '🌾' },
  { id: 'rice', name: 'Rice', hindi: 'चावल / धान', gujarati: 'ડાંગર', icon: '🌾' },
  { id: 'maize', name: 'Maize', hindi: 'मक्का', gujarati: 'મકાઈ', icon: '🌽' },
  { id: 'cotton', name: 'Cotton', hindi: 'कपास', gujarati: 'કપાસ', icon: '🌱' },
  { id: 'groundnut', name: 'Groundnut', hindi: 'मूंगफली', gujarati: 'મગફળી', icon: '🥜' },
  { id: 'onion', name: 'Onion', hindi: 'प्याज', gujarati: 'ડુંગળી', icon: '🧅' },
  { id: 'vegetables', name: 'Vegetables', hindi: 'सब्‍जियां', gujarati: 'શાકભાજી', icon: '🍅' },
  { id: 'other', name: 'Other', hindi: 'अन्य', gujarati: 'અન્ય', icon: '🌱' }
];

export const seasonOutcomes = [
  { id: 'good', label: 'Good profit', emoji: '😊' },
  { id: 'small', label: 'Small profit', emoji: '🙂' },
  { id: 'even', label: 'Break even', emoji: '😐' },
  { id: 'loss', label: 'Loss', emoji: '😟' },
  { id: 'heavy_loss', label: 'Large loss', emoji: '😔' }
];

export const affectedCauses = [
  { id: 'heavy_rain', label: 'Too much rain', emoji: '🌧️' },
  { id: 'drought', label: 'Lack of rain', emoji: '☀️' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'pests', label: 'Pests', emoji: '🐛' },
  { id: 'disease', label: 'Crop disease', emoji: '🧪' },
  { id: 'market', label: 'Low market price', emoji: '💰' },
  { id: 'water', label: 'Water problems', emoji: '💧' },
  { id: 'yield', label: 'Poor yield', emoji: '🌱' }
];

export const defaultExpenses = {
  seeds: 4500,
  fertilizer: 7200,
  water: 2000,
  medicine: 3500,
  labour: 8000
};

export const sampleDashboardData = {
  location: "Anand, Gujarat",
  temperature: "29°C",
  humidity: "64%",
  weatherCondition: "Partly Cloudy with soft evening showers",
  rainProbability: "60%",
  fireRiskLevel: "LOW",
  fireRiskIndex: "12%",
  soilMoisture: "Optimal (42%)",
  recommendedCrop: "Groundnut / Cotton rotate",
  totalExpense: 25200,
  projectedRevenue: 55000,
  netProfit: 29800
};
