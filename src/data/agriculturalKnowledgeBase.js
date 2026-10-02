/**
 * KisanGuard AI — Agricultural Knowledge Base Dataset
 * 
 * Production-ready modular knowledge store containing structured agricultural advisories,
 * cultivation practices, fertilizer schedules, irrigation guidance, pest/disease management,
 * and soil health recommendations across major Indian crops.
 * 
 * Source Types:
 * - GENERAL_AGRICULTURAL_KNOWLEDGE: Standard agronomy practices & extension principles
 * - OFFICIAL_SOURCE: State Agriculture Departments & KVK verified guidelines
 * - RESEARCH_SOURCE: ICAR & Agricultural University research publications
 */

export const KNOWLEDGE_DOCUMENTS = [
  // --- COTTON (કપાસ) ---
  {
    id: "doc_cotton_cultivation_01",
    title: "Cotton Sowing & Soil Preparation Advisory (કપાસ વાવણી અને જમીન તૈયારી)",
    crop: "Cotton",
    cropGu: "કપાસ",
    cropHi: "कपास",
    category: "cultivation",
    categoryLabel: "Cultivation & Sowing",
    language: "en",
    source: "Gujarat Agricultural University Extension Advisory",
    sourceType: "OFFICIAL_SOURCE",
    keywords: [
      "cotton", "sowing", "soil", "black cotton soil", "spacing", "seed rate", "monsoon",
      "કપાસ", "વાવણી", "જમીન", "કાળી જમીન", "અંતર", "બીજનો દર", "ચોમાસું"
    ],
    content: "Cotton grows best in deep black cotton soils (Vertisols) or well-drained medium loam soil with pH 6.0 to 8.0. Sowing should commence after receiving 75-100 mm of monsoon rainfall when soil temperature stabilizes above 20°C. Recommended seed rate for Bt cotton is 1.5 to 2.0 kg/acre with spacing of 4 x 1.5 feet or 5 x 1 feet depending on soil fertility. Deep plowing in summer helps destroy soil-borne pest pupae."
  },
  {
    id: "doc_cotton_fertilizer_02",
    title: "Cotton NPK & Micro-nutrient Schedule (કપાસ ખાતર વ્યવસ્થાપન)",
    crop: "Cotton",
    cropGu: "કપાસ",
    cropHi: "कपास",
    category: "fertilizer",
    categoryLabel: "Fertilizer & Nutrition",
    language: "en",
    source: "ICAR Cotton Research & Soil Nutrition Guide",
    sourceType: "RESEARCH_SOURCE",
    keywords: [
      "cotton", "fertilizer", "npk", "urea", "dap", "potash", "zinc", "nitrogen", "khatar",
      "કપાસ", "ખાતર", "યુરિયા", "ડીએપી", "પોટાશ", "ઝીંક", "નાઇટ્રોજન"
    ],
    content: "Recommended NPK dosage for rainfed Bt cotton is 120:60:60 kg/ha (48:24:24 kg/acre). Apply 100% Phosphorus (DAP/SSP) and Potash (MOP) as basal dose during sowing. Split Nitrogen (Urea) into 3 equal doses: 30 days after sowing (vegetative), 60 days (squaring/flowering), and 90 days (boll development). Apply Zinc Sulphate 10 kg/acre if soil shows zinc deficiency. Avoid excessive nitrogen late in season as it increases vegetative growth and attracts sucking pests."
  },
  {
    id: "doc_cotton_pests_03",
    title: "Cotton Whitefly & Pink Bollworm IPM Advisory (કપાસ સફેદ માખી અને ગુલાબી ઈયળ નિયંત્રણ)",
    crop: "Cotton",
    cropGu: "કપાસ",
    cropHi: "कपास",
    category: "pests",
    categoryLabel: "Pest & Disease Control",
    language: "en",
    source: "Central Institute for Cotton Research (CICR) Advisory",
    sourceType: "OFFICIAL_SOURCE",
    keywords: [
      "cotton", "whitefly", "pink bollworm", "safed makhi", "gulabi eyal", "pesticide", "neem oil", "sticky traps", "ipm",
      "કપાસ", "સફેદ માખી", "ગુલાબી ઈયળ", "જીવાત", "દવા", "લીમડાનું તેલ", "પીળા પટ્ટા"
    ],
    content: "Whitefly (Bemisia tabaci) causes yellowing of cotton leaves and secretes honeydew leading to soot mold. IPM Strategy: Install yellow sticky traps (10-15 per acre) at canopy level. Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm at initial ETL (5-10 whiteflies/leaf). For Pink Bollworm: Install pheromone traps (5/acre) for monitoring. Release Trichogramma egg parasitoids 60 days after sowing. Avoid synthetic pyrethroids early in season to preserve beneficial natural predator insects."
  },
  {
    id: "doc_cotton_irrigation_04",
    title: "Cotton Irrigation Management & Rain Guard (કપાસ પિયત વ્યવસ્થાપન)",
    crop: "Cotton",
    cropGu: "કપાસ",
    cropHi: "कपास",
    category: "irrigation",
    categoryLabel: "Irrigation & Water",
    language: "en",
    source: "Gujarat State Irrigation & Agronomy Advisory",
    sourceType: "GENERAL_AGRICULTURAL_KNOWLEDGE",
    keywords: [
      "cotton", "irrigation", "water", "drip", "monsoon rain", "drainage", "flowering", "piyat",
      "કપાસ", "પિયત", "પાણી", "ટપક પિયત", "વરસાદ", "નિતાર", "ફૂલ બેસવા"
    ],
    content: "Critical water requirement stages for cotton are peak flowering (60-75 days) and boll development (85-110 days). Moisture stress during flowering causes flower and boll dropping. Drip irrigation saves 40-50% water and improves yield by 25%. In case of heavy monsoon rainfall, ensure immediate field drainage to prevent waterlogging and root rot. If rain probability is over 60%, postpone scheduled irrigation."
  },

  // --- WHEAT (ઘઉં) ---
  {
    id: "doc_wheat_cultivation_01",
    title: "Wheat Sowing & Rabi Management (ઘઉં વાવણી અને રવિ વ્યવસ્થાપન)",
    crop: "Wheat",
    cropGu: "ઘઉં",
    cropHi: "गेहूं",
    category: "cultivation",
    categoryLabel: "Cultivation & Sowing",
    language: "en",
    source: "Indian Institute of Wheat & Barley Research",
    sourceType: "OFFICIAL_SOURCE",
    keywords: [
      "wheat", "sowing", "rabi", "temperature", "seed rate", "spacing", "ghau",
      "ઘઉં", "વાવણી", "રવિ પાક", "તાપમાન", "બીજનો દર", "અંતર"
    ],
    content: "Optimal wheat sowing temperature is 20°C to 25°C daily average (typically mid-November in Gujarat/North India). Seed rate is 40-45 kg/acre for timely sowing and 50 kg/acre for late sowing. Treat seeds with Carboxin + Thiram (2g/kg seed) or Trichoderma viride (4g/kg seed) to prevent seed-borne rust and smut diseases. Line sowing with row spacing of 20-22.5 cm improves light penetration and tillering."
  },
  {
    id: "doc_wheat_irrigation_02",
    title: "Wheat Critical Irrigation Stages (ઘઉં પિયત તબક્કા)",
    crop: "Wheat",
    cropGu: "ઘઉં",
    cropHi: "गेहूं",
    category: "irrigation",
    categoryLabel: "Irrigation & Water",
    language: "en",
    source: "National Agronomy & Irrigation Guide",
    sourceType: "RESEARCH_SOURCE",
    keywords: [
      "wheat", "irrigation", "cri stage", "crown root initiation", "tillering", "flowering", "milking", "piyat",
      "ઘઉં", "પિયત", "મુગટ મૂળ", "ફૂટ તબક્કો", "દૂધિયા તબક્કો"
    ],
    content: "Wheat requires 4 to 6 irrigations depending on soil texture. Crown Root Initiation (CRI) stage at 20-25 days after sowing is the MOST CRITICAL irrigation stage; missing water at CRI reduces yield by 25-30%. Subsequent critical stages: Tillering (40-45 days), Jointing (60-65 days), Flowering (80-85 days), and Milking/Dough stage (100-105 days). Avoid irrigation during high winds to prevent crop lodging."
  },

  // --- RICE / PADDY (ડાંગર / ચોખા) ---
  {
    id: "doc_rice_pests_01",
    title: "Rice Stem Borer & Leaf Folder Control (ડાંગર કુંભી / થડની ઈયળ નિયંત્રણ)",
    crop: "Rice",
    cropGu: "ડાંગર",
    cropHi: "धान",
    category: "pests",
    categoryLabel: "Pest & Disease Control",
    language: "en",
    source: "National Rice Research Institute (NRRI) Advisory",
    sourceType: "RESEARCH_SOURCE",
    keywords: [
      "rice", "paddy", "stem borer", "leaf folder", "dead heart", "white head", "dangar", "jivat",
      "ડાંગર", "ચોખા", "ઈયળ", "થડની ઈયળ", "મધિયા", "દવા"
    ],
    content: "Yellow Stem Borer causes 'Dead Heart' during vegetative stage and 'White Head' during panicle stage. Control: Install pheromone traps (8/acre) for stem borer moths. Release Trichogramma japonicum egg parasitoids at 30 and 37 days after transplanting. For Chemical Control if ETL exceeds 5% dead hearts: Apply Cartap Hydrochloride 4G @ 8 kg/acre or Chlorantraniliprole 0.4% GR @ 4 kg/acre with standing water."
  },

  // --- GROUNDNUT (મગફળી) ---
  {
    id: "doc_groundnut_nutrition_01",
    title: "Groundnut Gypsum & Calcium Application (મગફળી જિપ્સમ અને ખાતર આપવાની રીત)",
    crop: "Groundnut",
    cropGu: "મગફળી",
    cropHi: "मूंगफली",
    category: "fertilizer",
    categoryLabel: "Fertilizer & Nutrition",
    language: "en",
    source: "Directorate of Groundnut Research (DGR) Junagadh",
    sourceType: "OFFICIAL_SOURCE",
    keywords: [
      "groundnut", "gypsum", "calcium", "sulfur", "pod filling", "magfali", "khatar",
      "મગફળી", "જિપ્સમ", "કેલ્શિયમ", "સલ્ફર", "દાણા ભરાવા", "ખાતર"
    ],
    content: "Gypsum is vital for groundnut pod formation and kernel filling. Apply Gypsum @ 200 kg/acre (500 kg/ha) at pegging stage (40-45 days after sowing) near crop rows. Gypsum provides Calcium needed for seed coat development and Sulphur for oil synthesis. Apply Rhizobium bio-fertilizer seed treatment before sowing to boost atmospheric Nitrogen fixation."
  },
  {
    id: "doc_groundnut_diseases_02",
    title: "Groundnut Tikka Leaf Spot & Stem Rot Disease Management (મગફળી ગેરુ અને ટપકાં રોગ)",
    crop: "Groundnut",
    cropGu: "મગફળી",
    cropHi: "मूंगफली",
    category: "diseases",
    categoryLabel: "Pest & Disease Control",
    language: "en",
    source: "Junagadh Agricultural University Plant Pathology Guide",
    sourceType: "RESEARCH_SOURCE",
    keywords: [
      "groundnut", "tikka leaf spot", "stem rot", "fungicide", "mandra", "magfali rog",
      "મગફળી", "ટપકાનો રોગ", "ગેરુ", "થડનો કોહવારો", "ફૂગનાશક"
    ],
    content: "Tikka Leaf Spot (Cercospora) creates dark circular spots on leaves leading to premature leaf drop. Stem Rot (Sclerotium rolfsii) causes wilting near soil line. Control: Spray Mancozeb 75% WP @ 2g/liter or Hexaconazole 5% EC @ 1.5 ml/liter water at first appearance of spots (35-40 days). Soil application of Trichoderma harzianum mixed with farmyard manure reduces stem rot."
  },

  // --- GENERAL FERTILIZER & SOIL HEALTH ---
  {
    id: "doc_general_soil_01",
    title: "Integrated Soil Health & Organic Carbon Improvement (જમીન આરોગ્ય અને સેન્દ્રિય કાર્બન)",
    crop: "General",
    cropGu: "સામાન્ય ખેતી",
    cropHi: "सामान्य कृषि",
    category: "soil_health",
    categoryLabel: "Soil Health & Carbon",
    language: "en",
    source: "Soil Health Card Scheme & Agronomy Guidelines",
    sourceType: "GENERAL_AGRICULTURAL_KNOWLEDGE",
    keywords: [
      "soil health", "organic carbon", "fym", "compost", "green manure", "ph", "jamin",
      "જમીન", "સેન્દ્રિય કાર્બન", "છાણિયું ખાતર", "લીલો પડવાશ", "પીએચ"
    ],
    content: "Healthy soil should contain at least 0.5% to 0.75% Organic Carbon. Apply Farmyard Manure (FYM) or Vermicompost @ 4-5 tonnes/acre before sowing. Practice green manuring with Sunnhemp or Dhaincha plowed back into soil at 45 days. Soil test recommendations should dictate chemical NPK applications to prevent soil salinity and acidity accumulation."
  }
];

export default KNOWLEDGE_DOCUMENTS;
