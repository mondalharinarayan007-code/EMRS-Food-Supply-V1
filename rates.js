// Food Supply Rate Chart
const RATES = [
  {
    "id": "1_01",
    "item": "আতপ চাল",
    "unit": "Kg",
    "rate": 32,
    "category": "Grocery"
  },
  {
    "id": "1_02",
    "item": "সঃ তেল",
    "unit": "Kg",
    "rate": 205,
    "category": "Grocery"
  },
  {
    "id": "1_03",
    "item": "সাদা তেল",
    "unit": "Kg",
    "rate": 160,
    "category": "Grocery"
  },
  {
    "id": "1_04",
    "item": "বিউলীর ডাল",
    "unit": "Kg",
    "rate": 132,
    "category": "Grocery"
  },
  {
    "id": "1_05",
    "item": "মুগ ডাল",
    "unit": "Kg",
    "rate": 165,
    "category": "Grocery"
  },
  {
    "id": "1_06",
    "item": "মুসুর ডাল",
    "unit": "Kg",
    "rate": 138,
    "category": "Grocery"
  },
  {
    "id": "1_07",
    "item": "ছোলার ডাল",
    "unit": "Kg",
    "rate": 110,
    "category": "Grocery"
  },
  {
    "id": "1_08",
    "item": "চিনি",
    "unit": "Kg",
    "rate": 50,
    "category": "Grocery"
  },
  {
    "id": "1_09",
    "item": "পোস্ত",
    "unit": "Kg",
    "rate": 1850,
    "category": "Grocery"
  },
  {
    "id": "1_10",
    "item": "ববরবটি কলাই",
    "unit": "Kg",
    "rate": 95,
    "category": "Grocery"
  },
  {
    "id": "1_11",
    "item": "বাদাম",
    "unit": "Kg",
    "rate": 160,
    "category": "Grocery"
  },
  {
    "id": "1_12",
    "item": "গোটা ছোলা",
    "unit": "Kg",
    "rate": 95,
    "category": "Grocery"
  },
  {
    "id": "1_13",
    "item": "চিঁড়ে",
    "unit": "Kg",
    "rate": 40,
    "category": "Grocery"
  },
  {
    "id": "1_14",
    "item": "কাবলি ছোলা",
    "unit": "Kg",
    "rate": 140,
    "category": "Grocery"
  },
  {
    "id": "1_15",
    "item": "দুধ LIQ",
    "unit": "Ltr",
    "rate": 62,
    "category": "Grocery"
  },
  {
    "id": "1_16",
    "item": "বাটার",
    "unit": "Kg",
    "rate": 490,
    "category": "Grocery"
  },
  {
    "id": "1_17",
    "item": "টক দই",
    "unit": "Kg",
    "rate": 120,
    "category": "Grocery"
  },
  {
    "id": "1_18",
    "item": "পাউরুটি",
    "unit": "Pac",
    "rate": 44,
    "category": "Grocery"
  },
  {
    "id": "1_19",
    "item": "কালো জীরে",
    "unit": "Kg",
    "rate": 350,
    "category": "Grocery"
  },
  {
    "id": "1_20",
    "item": "সুজি",
    "unit": "Kg",
    "rate": 60,
    "category": "Grocery"
  },
  {
    "id": "1_21",
    "item": "চা ctc",
    "unit": "Kg",
    "rate": 420,
    "category": "Grocery"
  },
  {
    "id": "1_22",
    "item": "বিস্কুট (মেরী)",
    "unit": "pac",
    "rate": 55,
    "category": "Grocery"
  },
  {
    "id": "1_23",
    "item": "সরষে সাদা",
    "unit": "Kg",
    "rate": 120,
    "category": "Grocery"
  },
  {
    "id": "1_24",
    "item": "সরষে কালো",
    "unit": "Kg",
    "rate": 120,
    "category": "Grocery"
  },
  {
    "id": "1_25",
    "item": "আটা",
    "unit": "Kg",
    "rate": 48,
    "category": "Grocery"
  },
  {
    "id": "1_26",
    "item": "ময়দা",
    "unit": "Kg",
    "rate": 42,
    "category": "Grocery"
  },
  {
    "id": "1_27",
    "item": "কাজু বাদাম",
    "unit": "Kg",
    "rate": 1060,
    "category": "Grocery"
  },
  {
    "id": "1_28",
    "item": "কিসমিস",
    "unit": "Kg",
    "rate": 550,
    "category": "Grocery"
  },
  {
    "id": "1_29",
    "item": "সয়াবিন",
    "unit": "Kg",
    "rate": 168,
    "category": "Grocery"
  },
  {
    "id": "1_30",
    "item": "সাদা মটর",
    "unit": "Kg",
    "rate": 70,
    "category": "Grocery"
  },
  {
    "id": "1_31",
    "item": "হলুদ গুঁড়ো",
    "unit": "Kg",
    "rate": 295,
    "category": "Grocery"
  },
  {
    "id": "1_32",
    "item": "ধনে গুঁড়ো",
    "unit": "Kg",
    "rate": 310,
    "category": "Grocery"
  },
  {
    "id": "1_33",
    "item": "জিরে গুঁড়ো",
    "unit": "Kg",
    "rate": 620,
    "category": "Grocery"
  },
  {
    "id": "1_34",
    "item": "মরিচ গুঁড়ো",
    "unit": "Kg",
    "rate": 300,
    "category": "Grocery"
  },
  {
    "id": "1_35",
    "item": "লবণ",
    "unit": "Kg",
    "rate": 30,
    "category": "Grocery"
  },
  {
    "id": "1_36",
    "item": "চানাচুর",
    "unit": "Kg",
    "rate": 260,
    "category": "Grocery"
  },
  {
    "id": "1_37",
    "item": "গুড়",
    "unit": "Kg",
    "rate": 75,
    "category": "Grocery"
  },
  {
    "id": "1_38",
    "item": "মুড়ি",
    "unit": "Kg",
    "rate": 62,
    "category": "Grocery"
  },
  {
    "id": "1_39",
    "item": "কেক",
    "unit": "Pcs",
    "rate": 10,
    "category": "Grocery"
  },
  {
    "id": "1_40",
    "item": "চিঁড়ে ভাজা",
    "unit": "Pac",
    "rate": 10,
    "category": "Grocery"
  },
  {
    "id": "1_41",
    "item": "বিস্কুট (ছোট)",
    "unit": "pac",
    "rate": 5,
    "category": "Grocery"
  },
  {
    "id": "1_42",
    "item": "চালভাজা",
    "unit": "Pcs",
    "rate": 12,
    "category": "Grocery"
  },
  {
    "id": "1_43",
    "item": "তেজপাতা",
    "unit": "Kg",
    "rate": 200,
    "category": "Grocery"
  },
  {
    "id": "1_44",
    "item": "কারী মশলা",
    "unit": "Kg",
    "rate": 320,
    "category": "Grocery"
  },
  {
    "id": "1_45",
    "item": "বড়ি",
    "unit": "Kg",
    "rate": 195,
    "category": "Grocery"
  },
  {
    "id": "1_46",
    "item": "পাঁচ ফোড়ন",
    "unit": "Kg",
    "rate": 320,
    "category": "Grocery"
  },
  {
    "id": "1_47",
    "item": "শুকনো লঙ্কা",
    "unit": "Kg",
    "rate": 290,
    "category": "Grocery"
  },
  {
    "id": "1_48",
    "item": "দারচিনি",
    "unit": "Kg",
    "rate": 600,
    "category": "Grocery"
  },
  {
    "id": "1_49",
    "item": "লবঙ্গ",
    "unit": "Kg",
    "rate": 600,
    "category": "Grocery"
  },
  {
    "id": "1_50",
    "item": "এলাচ",
    "unit": "Kg",
    "rate": 4300,
    "category": "Grocery"
  },
  {
    "id": "1_51",
    "item": "গরম মশলা",
    "unit": "Kg",
    "rate": 2200,
    "category": "Grocery"
  },
  {
    "id": "1_52",
    "item": "গোটা জিরে",
    "unit": "Kg",
    "rate": 350,
    "category": "Grocery"
  },
  {
    "id": "1_53",
    "item": "গোটা ধনে",
    "unit": "Kg",
    "rate": 150,
    "category": "Grocery"
  },
  {
    "id": "1_54",
    "item": "রাঁধুনি",
    "unit": "Kg",
    "rate": 350,
    "category": "Grocery"
  },
  {
    "id": "1_55",
    "item": "টমেটো সস",
    "unit": "Kg",
    "rate": 158,
    "category": "Grocery"
  },
  {
    "id": "1_56",
    "item": "পনীর",
    "unit": "Kg",
    "rate": 480,
    "category": "Grocery"
  },
  {
    "id": "1_57",
    "item": "কস্তূরী মেথি",
    "unit": "Kg",
    "rate": 900,
    "category": "Grocery"
  },
  {
    "id": "1_58",
    "item": "কর্নফ্লাওয়ার",
    "unit": "Kg",
    "rate": 135,
    "category": "Grocery"
  },
  {
    "id": "1_59",
    "item": "ঘি",
    "unit": "Kg",
    "rate": 1000,
    "category": "Grocery"
  },
  {
    "id": "1_60",
    "item": "ছোলার ছাতু",
    "unit": "Kg",
    "rate": 175,
    "category": "Grocery"
  },
  {
    "id": "1_61",
    "item": "তেঁতুল",
    "unit": "Kg",
    "rate": 150,
    "category": "Grocery"
  },
  {
    "id": "1_62",
    "item": "পাঁপড় (Round)",
    "unit": "Kg",
    "rate": 280,
    "category": "Grocery"
  },
  {
    "id": "1_63",
    "item": "মৌরী",
    "unit": "Kg",
    "rate": 220,
    "category": "Grocery"
  },
  {
    "id": "2_01",
    "item": "আলু",
    "unit": "Kg",
    "rate": 27,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_02",
    "item": "আদা",
    "unit": "Kg",
    "rate": 240,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_03",
    "item": "পেঁয়াজ",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_04",
    "item": "রসুন",
    "unit": "Kg",
    "rate": 320,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_05",
    "item": "মটরশুঁটি",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_06",
    "item": "কাঁচালঙ্কা",
    "unit": "Kg",
    "rate": 98,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_07",
    "item": "কুমড়ো",
    "unit": "Kg",
    "rate": 37,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_08",
    "item": "লাউ",
    "unit": "Kg",
    "rate": 37,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_09",
    "item": "এঁচোড়",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_10",
    "item": "বেগুণ",
    "unit": "Kg",
    "rate": 50,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_11",
    "item": "গাজর",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_12",
    "item": "লাফা",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_13",
    "item": "মুলো",
    "unit": "Kg",
    "rate": 40,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_14",
    "item": "টমেটো",
    "unit": "Kg",
    "rate": 65,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_15",
    "item": "পাট শাক",
    "unit": "Kg",
    "rate": 20,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_16",
    "item": "পালং শাক",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_17",
    "item": "পুঁই শাক",
    "unit": "Kg",
    "rate": 40,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_18",
    "item": "কাগজি লেবু",
    "unit": "Pcs",
    "rate": 6,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_19",
    "item": "ঢ্যাঁড়শ",
    "unit": "kg",
    "rate": 55,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_20",
    "item": "কাঁচাকলা",
    "unit": "Dzn",
    "rate": 78,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_21",
    "item": "কলা (পাকা)",
    "unit": "Dzn",
    "rate": 78,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_22",
    "item": "পটল",
    "unit": "Kg",
    "rate": 65,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_23",
    "item": "ঝিঙে",
    "unit": "Kg",
    "rate": 65,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_24",
    "item": "বাঁধাকপি",
    "unit": "Kg",
    "rate": 35,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_25",
    "item": "ফুলকপি",
    "unit": "Pcs",
    "rate": 27,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_26",
    "item": "শিম",
    "unit": "Kg",
    "rate": 45,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_27",
    "item": "সজনে ডাঁটা",
    "unit": "Kg",
    "rate": 100,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_28",
    "item": "খেঁড়ো",
    "unit": "Kg",
    "rate": 40,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_29",
    "item": "লাল ডাঁটা",
    "unit": "Kg",
    "rate": 30,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_30",
    "item": "কাঁচা আম",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_31",
    "item": "পাকা আম",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_32",
    "item": "ধনেপাতা",
    "unit": "Kg",
    "rate": 90,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_33",
    "item": "বিনস",
    "unit": "Kg",
    "rate": 120,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_34",
    "item": "কচু",
    "unit": "Kg",
    "rate": 40,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_35",
    "item": "কাপ্সিকাম",
    "unit": "Kg",
    "rate": 120,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_36",
    "item": "আমড়া",
    "unit": "Kg",
    "rate": 30,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_37",
    "item": "শসা",
    "unit": "Kg",
    "rate": 60,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_38",
    "item": "পেঁপে",
    "unit": "Kg",
    "rate": 45,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_39",
    "item": "করলা",
    "unit": "Kg",
    "rate": 70,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_40",
    "item": "কমলালেবু",
    "unit": "Pcs",
    "rate": 15,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_41",
    "item": "আপেল",
    "unit": "Kg",
    "rate": 140,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_42",
    "item": "আঙ্গুর",
    "unit": "Kg",
    "rate": 140,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_43",
    "item": "তরমুজ",
    "unit": "Kg",
    "rate": 30,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_44",
    "item": "জিলিপি",
    "unit": "Kg",
    "rate": 160,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_45",
    "item": "মিষ্টি",
    "unit": "Pcs",
    "rate": 8,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_46",
    "item": "লাড্ডু",
    "unit": "Pcs",
    "rate": 7,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_47",
    "item": "খেজুর",
    "unit": "Kg",
    "rate": 200,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_48",
    "item": "ব্রকলি",
    "unit": "Kg",
    "rate": 30,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_49",
    "item": "বড় কেক",
    "unit": "Pac",
    "rate": 30,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_50",
    "item": "বান পাউরুটি",
    "unit": "Pac",
    "rate": 12,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_51",
    "item": "মাছ চারাপোনা",
    "unit": "Kg",
    "rate": 220,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_52",
    "item": "রুই মাছ",
    "unit": "Kg",
    "rate": 220,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_53",
    "item": "কুচো চিংড়ি",
    "unit": "Kg",
    "rate": 500,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_54",
    "item": "মুরগীর মাংস",
    "unit": "Kg",
    "rate": 235,
    "category": "Vegetable & Othrs."
  },
  {
    "id": "2_55",
    "item": "ডিম",
    "unit": "Pcs",
    "rate": 7.2,
    "category": "Vegetable & Othrs."
  }
];

if (typeof module !== 'undefined' && module.exports) module.exports = RATES;
