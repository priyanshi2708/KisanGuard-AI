export const gujaratDistrictsAndVillages = [
  {
    district: "Anand",
    villages: ["Anand", "Petlad", "Borsad", "Khambhat", "Umreth", "Sojitra", "Tarapur", "Anklav", "Vasad", "Chikhodra", "Mogri", "Karamsad", "Vallabh Vidyanagar", "Bakrol", "Adas"]
  },
  {
    district: "Rajkot",
    villages: ["Rajkot", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan", "Kotda Sangani", "Lodhika", "Paddhari", "Vinchhiya", "Shapar", "Bedi", "Virpur", "Kankot"]
  },
  {
    district: "Ahmedabad",
    villages: ["Ahmedabad", "Sanand", "Dholka", "Bavla", "Dhandhuka", "Viramgam", "Mandal", "Detroj", "Ranpur", "Dholera", "Aslali", "Bareja", "Bhadaj", "Changodar"]
  },
  {
    district: "Vadodara",
    villages: ["Vadodara", "Padra", "Karjan", "Dabhoi", "Savli", "Waghodia", "Sinor", "Desar", "Por", "Shinor", "Bhayli", "Vajiriya", "Sankheda"]
  },
  {
    district: "Bhavnagar",
    villages: ["Bhavnagar", "Mahuva", "Palitana", "Talaja", "Sihor", "Gadhada", "Gariadhar", "Umrala", "Vallabhipur", "Ghogha", "Alang", "Koliak"]
  },
  {
    district: "Junagadh",
    villages: ["Junagadh", "Keshod", "Manavadar", "Vanthali", "Mendarda", "Visavadar", "Bhesan", "Maliya Hatina", "Shapur", "Bilkha"]
  },
  {
    district: "Surat",
    villages: ["Surat", "Kamrej", "Bardoli", "Mandvi", "Olpad", "Mangrol", "Palsana", "Mahuva", "Umarpada", "Chalthan", "Katosan", "Kadodara"]
  },
  {
    district: "Amreli",
    villages: ["Amreli", "Dhari", "Babra", "Savarkundla", "Rajula", "Jafrabad", "Khambha", "Lathi", "Lilia", "Kunkavav", "Bagasara"]
  },
  {
    district: "Kheda",
    villages: ["Nadiad", "Kheda", "Kapadvanj", "Matar", "Mahudha", "Thasra", "Galteshwar", "Vaso", "Kathlal", "Dakore"]
  },
  {
    district: "Mehsana",
    villages: ["Mehsana", "Visnagar", "Unjha", "Kadi", "Vadnagar", "Vijapur", "Becharaji", "Satlasana", "Jotana", "Gozaria"]
  },
  {
    district: "Patan",
    villages: ["Patan", "Siddhpur", "Chanasma", "Harij", "Radhanpur", "Sami", "Sankheshwar", "Jantral", "Ranuj"]
  },
  {
    district: "Jamnagar",
    villages: ["Jamnagar", "Lalpur", "Kalavad", "Jamjodhpur", "Jodiya", "Dhrol", "Sikka", "Bed", "Aliabada"]
  },
  {
    district: "Sabarkantha",
    villages: ["Himatnagar", "Idar", "Khedbrahma", "Vadali", "Talod", "Prantij", "Vijayangar"]
  },
  {
    district: "Banaskantha",
    villages: ["Palanpur", "Deesa", "Dantiwada", "Dhanera", "Tharad", "Vav", "Kankrej", "Deodar", "Bhabhar", "Ambaji"]
  },
  {
    district: "Bharuch",
    villages: ["Bharuch", "Ankleshwar", "Jambusar", "Hansot", "Vagra", "Amod", "Valia", "Jhagadia"]
  },
  {
    district: "Navsari",
    villages: ["Navsari", "Gandevi", "Chikhli", "Jalalpore", "Vansda", "Khergam", "Bilimora"]
  },
  {
    district: "Valsad",
    villages: ["Valsad", "Vapi", "Pardi", "Umbergaon", "Dharampur", "Kaprada"]
  },
  {
    district: "Kutch",
    villages: ["Bhuj", "Gandhidham", "Anjar", "Mandvi", "Mundra", "Nakhatrana", "Abdasa", "Rapar", "Bhachau", "Dayapar"]
  },
  {
    district: "Gandhinagar",
    villages: ["Gandhinagar", "Kalol", "Dehgam", "Mansa", "Pethapur", "Kudasan", "Raysan", "Chala"]
  },
  {
    district: "Surendranagar",
    villages: ["Wadhwan", "Surendranagar", "Chotila", "Limbdi", "Dhrangadhra", "Halvad", "Sayla", "Muli", "Dasada", "Lakhtar"]
  },
  {
    district: "Morbi",
    villages: ["Morbi", "Tankara", "Wankaner", "Maliya", "Halvad"]
  },
  {
    district: "Gir Somnath",
    villages: ["Veraval", "Somnath", "Talala", "Una", "Kodinar", "Sutrapada", "Gir Gadhada"]
  },
  {
    district: "Botad",
    villages: ["Botad", "Gadhada", "Barwala", "Ranpur", "Salangpur"]
  },
  {
    district: "Porbandar",
    villages: ["Porbandar", "Ranavav", "Kutiyana", "Madhavpur"]
  },
  {
    district: "Devbhumi Dwarka",
    villages: ["Dwarka", "Khambhalia", "Kalyanpur", "Bhanvad", "Okha"]
  }
];

export const searchLocations = (query = "") => {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  const results = [];

  gujaratDistrictsAndVillages.forEach((item) => {
    // Check district match
    if (item.district.toLowerCase().includes(q)) {
      results.push({
        village: item.district,
        district: item.district,
        state: "Gujarat",
        display: `${item.district} (District)`
      });
    }

    // Check village matches
    item.villages.forEach((v) => {
      if (v.toLowerCase().includes(q) && v.toLowerCase() !== item.district.toLowerCase()) {
        results.push({
          village: v,
          district: item.district,
          state: "Gujarat",
          display: `${v}, ${item.district}`
        });
      }
    });
  });

  return results.slice(0, 8); // top 8 matches
};
