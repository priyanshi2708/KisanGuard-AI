/**
 * KisanGuard AI — Official Government Agricultural Schemes & Subsidies Dataset
 * 
 * Production-ready modular dataset containing verified Indian Central and Gujarat State
 * Government Agricultural Welfare Schemes, Subsidies, Insurance, and Assistance Policies.
 * 
 * Source Types:
 * - OFFICIAL_GOVERNMENT_SOURCE: Central & State Agriculture Departments, i-Khedut Portal, GGRC
 */

export const GOVERNMENT_SCHEMES = [
  {
    id: "scheme_pmksy_drip_01",
    schemeName: "PMKSY Micro-Irrigation & Drip Subsidy (ડ્રિપ સિંચાઈ સબસિડી)",
    schemeNameGu: "પીએમ કેએસવાવાય ડ્રિપ સિંચાઈ સબસિડી યોજના (જીજીઆરસી / આઈ-ખેડૂત)",
    schemeNameHi: "प्रधानमंत्री कृषि सिंचाई योजना - ड्रिप सब्सिडी",
    category: "irrigation",
    categoryLabel: "Irrigation & Water Subsidies",
    state: "Gujarat",
    targetCrops: ["Cotton", "Groundnut", "Sugarcane", "Banana", "Vegetables", "All Crops"],
    description: "Financial subsidy for installing water-saving Drip and Sprinkler irrigation systems to improve crop yields and reduce groundwater usage.",
    benefits: "70% to 80% subsidy for Small & Marginal Farmers (up to 2 hectares); 50% to 60% subsidy for General Farmers via GGRC (Gujarat Green Revolving Fund).",
    eligibility: [
      "Must own agricultural land in Gujarat state",
      "Valid 7/12 & 8-A land records required",
      "Available for all field and horticultural crops"
    ],
    documents: [
      "Aadhaar Card",
      "7/12 and 8-A Land Record Copy",
      "Bank Account Passbook Copy",
      "Passport Size Photograph",
      "Mobile Number linked with Aadhaar"
    ],
    applicationProcess: "1. Apply online on Gujarat i-Khedut Portal (ikhedut.gujarat.gov.in) or GGRC website.\n2. Submit physical document copies to District Agriculture/Horticulture Office.\n3. Authorized GGRC vendor conducts field survey and completes installation.",
    officialSource: "Gujarat Green Revolving Fund (GGRC) & Dept of Agriculture Gujarat",
    sourceType: "OFFICIAL_GOVERNMENT_SOURCE",
    officialUrl: "https://ikhedut.gujarat.gov.in",
    lastUpdated: "2026-01-15",
    keywords: ["drip", "sprinkler", "irrigation", "subsidy", "ikhedut", "ggrc", "pmksy", "ડ્રિપ", "સિંચાઈ", "સબસિડી", "આઈ ખેડૂત", "પાણી"]
  },
  {
    id: "scheme_pm_kisan_02",
    schemeName: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    schemeNameGu: "પીએમ કિસાન સન્માન નિધિ યોજના (₹૬,૦૦૦ વાર્ષિક સહાય)",
    schemeNameHi: "प्रधानमंत्री किसान सम्मान निधि योजना",
    category: "income_support",
    categoryLabel: "Income Support & Financial Welfare",
    state: "All India",
    targetCrops: ["All Crops"],
    description: "Central Sector Direct Benefit Transfer (DBT) scheme providing ₹6,000 per year income support to all cultivable landholding farmer families across India.",
    benefits: "₹6,000 per year transferred directly into farmer bank accounts in 3 equal installments of ₹2,000 every 4 months (April-July, August-November, December-March).",
    eligibility: [
      "Farmer family holding cultivable land in their name",
      "Must complete e-KYC (Aadhaar OTP or Biometric)",
      "Bank account must be seeded with Aadhaar",
      "Institutional landholders and high-income tax payers are excluded"
    ],
    documents: [
      "Aadhaar Card",
      "Land Ownership Record (7/12 & 8-A or Khatauni)",
      "Aadhaar-seeded Bank Passbook",
      "Mobile Number"
    ],
    applicationProcess: "1. Register on PM-KISAN Portal (pmkisan.gov.in) or via local CSC (Common Service Center).\n2. Upload land ownership record and Aadhaar details.\n3. Verify e-KYC online via OTP or CSC biometric scanner.",
    officialSource: "Ministry of Agriculture & Farmers Welfare, Govt of India",
    sourceType: "OFFICIAL_GOVERNMENT_SOURCE",
    officialUrl: "https://pmkisan.gov.in",
    lastUpdated: "2026-02-01",
    keywords: ["pm kisan", "income support", "6000", "dbt", "samman nidhi", "પીએમ કિસાન", "સહાય", "હપ્તો", "બેંક"]
  },
  {
    id: "scheme_ikhedut_machinery_03",
    schemeName: "i-Khedut Tractor & Farm Equipment Subsidy (SMAM)",
    schemeNameGu: "આઈ-ખેડૂત પોર્ટલ ટ્રેક્ટર અને ખેત ઓજારો સબસિડી (એસએમએએમ)",
    schemeNameHi: "आई-किसान ट्रैक्टर एवं कृषि यंत्र सब्सिडी योजना",
    category: "equipment",
    categoryLabel: "Farm Machinery & Equipment",
    state: "Gujarat",
    targetCrops: ["All Crops"],
    description: "Gujarat State Government scheme offering financial subsidy on tractors, rotavators, power tillers, threshers, and sprayers to promote mechanization.",
    benefits: "40% to 50% financial subsidy on purchase of authorized tractors (up to ₹45,000-₹60,000 max) and implements (rotavator, thresher, seed drill).",
    eligibility: [
      "Farmer resident of Gujarat owning agricultural land",
      "Must apply during active application windows on i-Khedut portal",
      "One tractor subsidy per farmer family allowed once in 7 years"
    ],
    documents: [
      "Aadhaar Card",
      "7/12 & 8-A Land Records",
      "Caste Certificate (for SC/ST higher subsidy percentage)",
      "Bank Passbook Copy",
      "Proforma Invoice from authorized tractor dealer"
    ],
    applicationProcess: "1. Submit online application during opening window on i-Khedut Portal (ikhedut.gujarat.gov.in).\n2. Computerized luck draw selects beneficiaries.\n3. Selected farmers purchase approved machinery and submit physical bills for subsidy release.",
    officialSource: "Directorate of Agriculture, Government of Gujarat",
    sourceType: "OFFICIAL_GOVERNMENT_SOURCE",
    officialUrl: "https://ikhedut.gujarat.gov.in",
    lastUpdated: "2026-01-20",
    keywords: ["tractor", "rotavator", "equipment", "machinery", "ikhedut", "smam", "ટ્રેક્ટર", "ઓજાર", "સબસિડી", "આઈ ખેડૂત"]
  },
  {
    id: "scheme_pm_kusum_solar_04",
    schemeName: "PM-KUSUM Solar Agriculture Pump Scheme",
    schemeNameGu: "પીએમ કુસુમ સૌર ઉર્જા પંપ યોજના (સોલર પંપ સબસિડી)",
    schemeNameHi: "पीएम-कुसुम सौर ऊर्जा पंप योजना",
    category: "solar",
    categoryLabel: "Solar Energy & Renewable Irrigation",
    state: "Gujarat",
    targetCrops: ["All Crops"],
    description: "Scheme for installing standalone off-grid solar agriculture pumps (3 HP, 5 HP, 7.5 HP) to ensure reliable daytime irrigation for farmers.",
    benefits: "Up to 60% to 90% combined subsidy (30% Central Govt + 30-50% State Govt + bank loan support). Farmer pays only 10% to 20% of total cost.",
    eligibility: [
      "Farmer owning agricultural land with borewell/open well source",
      "No existing grid electricity connection at the pump site",
      "Valid land record proof"
    ],
    documents: [
      "Aadhaar Card",
      "7/12 and 8-A Land Record Proof",
      "Water Source Availability Certificate",
      "Bank Account Details"
    ],
    applicationProcess: "1. Apply online via GEDA (Gujarat Energy Development Agency) / i-Khedut portal.\n2. Site feasibility verification by solar vendor.\n3. Farmer deposits beneficiary share (10-20%) for pump installation.",
    officialSource: "Ministry of New and Renewable Energy (MNRE) & GEDA Gujarat",
    sourceType: "OFFICIAL_GOVERNMENT_SOURCE",
    officialUrl: "https://pmkusum.mnre.gov.in",
    lastUpdated: "2026-01-10",
    keywords: ["kusum", "solar", "pump", "geda", "solar pump", "સોલર", "પંપ", "સૌર ઉર્જા", "સબસિડી", "બોરવેલ"]
  },
  {
    id: "scheme_cm_kisan_sahay_05",
    schemeName: "Mukhya Mantri Kisan Sahay Yojana (Gujarat Crop Damage Relief)",
    schemeNameGu: "મુખ્યમંત્રી કિસાન સહાય યોજના (કુદરતી આપત્તિ પાક નુકસાન સહાય)",
    schemeNameHi: "मुख्यमंत्री किसान सहाय योजना",
    category: "insurance",
    categoryLabel: "Crop Insurance & Rain Disaster Relief",
    state: "Gujarat",
    targetCrops: ["Cotton", "Groundnut", "Paddy", "Maize", "All Kharif Crops"],
    description: "Gujarat State relief scheme offering financial assistance to Kharif crop farmers in case of drought, excess rain, or unseasonal rainfall (mavthu) without requiring any insurance premium.",
    benefits: "₹20,000/hectare (up to 4 ha) for 33% to 60% crop damage; ₹25,000/hectare (up to 4 ha) for crop damage exceeding 60%. Zero premium cost for farmers.",
    eligibility: [
      "All registered landholding farmers in notified drought/heavy rain affected Gujarat Talukas",
      "No premium payment required from farmer"
    ],
    documents: [
      "Aadhaar Card",
      "7/12 and 8-A Land Proof",
      "Bank Account Details (Aadhaar linked)",
      "Talati Crop Survey / Damage Report"
    ],
    applicationProcess: "1. State government declares affected districts/talukas based on rainfall data.\n2. Affected farmers apply via i-Khedut portal or e-Gram center.\n3. Financial assistance deposited directly into bank account via DBT.",
    officialSource: "Revenue & Agriculture Department, Government of Gujarat",
    sourceType: "OFFICIAL_GOVERNMENT_SOURCE",
    officialUrl: "https://ikhedut.gujarat.gov.in",
    lastUpdated: "2025-11-30",
    keywords: ["kisan sahay", "crop damage", "rain relief", "mavthu", "drought", "મુખ્યમંત્રી", "કિસાન સહાય", "નુકસાન", "વરસાદ", "માવઠું"]
  }
];

export default GOVERNMENT_SCHEMES;
