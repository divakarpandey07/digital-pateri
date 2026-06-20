const MandiRate = require('../models/MandiRate');
const { fetchMandiRatesFromAPI } = require('../services/mandiService');

// Helper for local agricultural responses when Gemini is offline or fails
const getLocalAgriResponse = (query) => {
  const normalized = query.toLowerCase().trim();
  if (/wheat|gehun|gehu/i.test(normalized)) {
    return "Gehun (Wheat) ki buwai Kaimur me 15 November se 10 December ke beech sabse acchi mani jaati hai. Certified beej PBW 343 ya HD 2967 ka use karein. Seed treatment ke liye Carbendazim (2g/kg beej) prayog karein. Pehli irrigation 21 din par (CRI stage) zaroor karein.";
  }
  if (/paddy|dhan|rice/i.test(normalized)) {
    return "Dhan (Paddy) ki ropai July me karein. Beej variety Swarna (MTU 7029) ya Samba Mahsuri Pateri ke liye perfect hai. Rog control ke liye land preparation me Zinc Sulphate (25 kg/ha) apply karein. AWD method se water save karein.";
  }
  if (/mustard|sarso|sarson/i.test(normalized)) {
    return "Sarso (Mustard) ki buwai October se mid-November tak karein. Pusa Bold variety best yield deti hai. Aphids/insect attack ke liye Dimethoate 30 EC spray karein.";
  }
  if (/potato|aloo|alu/i.test(normalized)) {
    return "Aloo (Potato) ki bone ka sahi samay November hai. Proper row spacing rakhein. Soil testing ke aadhar par Potash fertilizer apply karein, isse quality acchi hoti hai.";
  }
  if (/tomato|tamatar/i.test(normalized)) {
    return "Tamatar (Tomato) me leaf curling aur damping-off major diseases hain. Nursery stage se hi line spacing aur proper drainage rakhein. Whitefly control ke liye yellow sticky traps lagayein.";
  }
  
  return "Smart Krishi Hub Advisory: Pateri block me Rabi season me Gehun, Sarso, Aloo aur Chana ki kheti mukhya roop se hoti hai. Kharif me Dhan (Paddy) major crop hai. Beej upchar (seed treatment) ke bina buwai na karein, aur beej/mandi rates ki details ke liye Krishi Hub dropdowns check karein.";
};

// @desc    Get latest mandi rates
// @route   GET /api/v1/agriculture/mandi-rates
// @access  Public
exports.getMandiRates = async (req, res, next) => {
  try {
    const { market, commodity } = req.query;
    
    // Find the latest arrival date in the DB to filter on today's/latest date
    const latest = await MandiRate.findOne({ district: 'Kaimur' }).sort({ arrivalDate: -1 });
    if (!latest) {
      return res.status(200).json({
        success: true,
        data: { records: [], topGainers: [], topLosers: [], lastUpdated: null }
      });
    }

    const latestDate = new Date(latest.arrivalDate);
    latestDate.setHours(0, 0, 0, 0);

    const query = {
      arrivalDate: { $gte: latestDate },
      district: 'Kaimur'
    };

    if (market) query.market = market;
    if (commodity) query.commodity = commodity;

    const records = await MandiRate.find(query).sort({ commodity: 1, market: 1 });

    // Calculate Top Gainers / Losers compared to the day before
    // We fetch rates from the day before the latest date
    const dayBeforeDate = new Date(latestDate);
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
    
    const dayBeforeRecords = await MandiRate.find({
      arrivalDate: { $gte: dayBeforeDate, $lt: latestDate },
      district: 'Kaimur'
    });

    // Create a price map for the day before: market-commodity -> price
    const oldPriceMap = {};
    dayBeforeRecords.forEach(r => {
      oldPriceMap[`${r.market}-${r.commodity}`] = r.modalPrice;
    });

    const priceChanges = [];
    records.forEach(r => {
      const oldPrice = oldPriceMap[`${r.market}-${r.commodity}`];
      if (oldPrice) {
        const change = r.modalPrice - oldPrice;
        priceChanges.push({
          market: r.market,
          commodity: r.commodity,
          currentPrice: r.modalPrice,
          change,
          percentChange: ((change / oldPrice) * 100).toFixed(1)
        });
      }
    });

    // Sort changes to get top gainers and losers
    const topGainers = priceChanges
      .filter(c => c.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);

    const topLosers = priceChanges
      .filter(c => c.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        records,
        topGainers,
        topLosers,
        lastUpdated: latest.arrivalDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price history for chart
// @route   GET /api/v1/agriculture/price-history
// @access  Public
exports.getPriceHistory = async (req, res, next) => {
  try {
    const { commodity, market } = req.query;

    if (!commodity) {
      return res.status(400).json({
        success: false,
        message: 'Commodity parameter is required',
        errorCode: 'BAD_REQUEST'
      });
    }

    const query = {
      commodity,
      district: 'Kaimur'
    };

    if (market) {
      query.market = market;
    } else {
      query.market = 'Bhabhua'; // Default market
    }

    // Get the last 30 price points sorted chronologically
    const history = await MandiRate.find(query)
      .sort({ arrivalDate: 1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bihar farming advisories
// @route   GET /api/v1/agriculture/advisories
// @access  Public
exports.getFarmingAdvisories = async (req, res, next) => {
  try {
    const advisories = {
      seasons: {
        Kharif: {
          period: 'June - October (Monsoon season)',
          crops: 'Dhan (Paddy), Maize, Bajra, Urad',
          description: 'Monsoon season main cultivation. Highly dependent on rain cycles.',
          tips: [
            'Dhan nursery should be prepared in early June using certified high-yielding seeds.',
            'Maintain water levels of 5-10cm in transplantation fields.',
            'Apply nitrogen fertilizers in split doses (basal, tillering, panicle initiation).'
          ]
        },
        Rabi: {
          period: 'November - April (Winter season)',
          crops: 'Gehun (Wheat), Chana (Gram), Sarso (Mustard), Peas',
          description: 'Sown in winter and harvested in spring. Irrigation is key.',
          tips: [
            'Sow Gehun between Nov 15 and Dec 10 for optimum grain yield.',
            'Ensure crown root initiation (CRI) stage irrigation (21 days after sowing).',
            'Spray copper oxychloride to prevent rust diseases in wheat fields.'
          ]
        },
        Zaid: {
          period: 'March - June (Summer season)',
          crops: 'Moong, Watermelon, Cucumber, Sunflowers',
          description: 'Short summer season between Rabi and Kharif.',
          tips: [
            'Use short-duration Moong varieties (SML-668) to harvest before monsoon.',
            'Frequent light irrigations every 7-10 days due to high heat.',
            'Watch for whiteflies and spray organic neem oil extract pesticides.'
          ]
        }
      },
      categories: {
        'Seed Selection': [
          { crop: 'Paddy (Dhan)', recommendedVarieties: ['MTU 7029 (Swarna)', 'BPT 5204 (Samba Mahsuri)', 'Rajendra Sweta'], description: 'Select high-yielding certified seeds from government hubs. Swarna is highly suitable for clay soils.' },
          { crop: 'Wheat (Gehun)', recommendedVarieties: ['PBW 343', 'HD 2967', 'K 307 (Shatabdi)'], description: 'Treat seeds with Carbendazim (2g/kg) before sowing to avoid seed-borne fungal infections.' },
          { crop: 'Mustard (Sarso)', recommendedVarieties: ['Pusa Bold', 'Rajendra Sarson-1'], description: 'Use yellow mustard varieties for higher oil content yield.' }
        ],
        'Fertilizer Guide': [
          { practice: 'N-P-K Ratio', guidelines: 'For Paddy: 120:60:40 kg/ha, For Wheat: 150:60:40 kg/ha.', details: 'Get soil tested at Bhabhua Soil Lab to customize dosage.' },
          { practice: 'Zinc Application', guidelines: 'Apply Zinc Sulphate (25 kg/ha) during land preparation to prevent Khaira disease in Paddy.', details: 'Khaira causes leaf bronzing and stunted tillering.' }
        ],
        'Pest Control': [
          { pest: 'Stem Borer (Paddy)', remedy: 'Apply Cartap Hydrochloride 4G (25 kg/ha) or spray Chlorpyriphos 20 EC.', timing: 'Early vegetative stage.' },
          { pest: 'Aphids (Mustard)', remedy: 'Spray Dimethoate 30 EC or organic neem oil extract (1500ppm).', timing: 'At flowering initiation.' }
        ],
        'Water Management': [
          { method: 'Alternate Wetting & Drying (AWD)', description: 'Saves water in Paddy cultivation by allowing soil to dry slightly before re-irrigation.', savings: 'Reduces water usage by 30% without affecting crop yield.' },
          { method: 'Drip & Sprinkler Systems', description: 'Highly recommended for Rabi pulses and summer vegetables in Kudra/Mohania sandy-loam soils.', savings: 'Subsidies up to 80% available under PM Krishi Sinchayee Yojana.' }
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: advisories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual refresh of Mandi rates (Admin only)
// @route   POST /api/v1/agriculture/refresh
// @access  Private (Admin)
exports.refreshMandiRates = async (req, res, next) => {
  try {
    const result = await fetchMandiRatesFromAPI();
    
    if (result && result.error) {
      return res.status(502).json({
        success: false,
        message: 'API refresh finished with warnings, fallback mock applied.',
        error: result.error,
        source: result.source
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mandi rates refreshed successfully.',
      source: result.source
    });
  } catch (error) {
    next(error);
  }
};

const CropAlert = require('../models/CropAlert');
const FarmerProduct = require('../models/FarmerProduct');
const AgriConsultation = require('../models/AgriConsultation');

// @desc    Get crop alerts
// @route   GET /api/v1/agriculture/alerts
// @access  Public
exports.getCropAlerts = async (req, res, next) => {
  try {
    const alerts = await CropAlert.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a crop alert
// @route   POST /api/v1/agriculture/alerts
// @access  Private (Admin only)
exports.createCropAlert = async (req, res, next) => {
  try {
    const { title, content, crop, severity } = req.body;
    if (!title || !content || !crop) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and crop fields are required'
      });
    }

    const alert = await CropAlert.create({
      villageId: req.body.villageId || '6664d999f999f999f999f999',
      title,
      content,
      crop,
      severity: severity || 'Medium'
    });

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get P2P farmer products
// @route   GET /api/v1/agriculture/products
// @access  Public
exports.getFarmerProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;

    const products = await FarmerProduct.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post product to P2P marketplace
// @route   POST /api/v1/agriculture/products
// @access  Private
exports.createFarmerProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, unit, farmerName, contactMobile, villageId } = req.body;
    if (!title || !category || !price || !unit || !farmerName || !contactMobile) {
      return res.status(400).json({
        success: false,
        message: 'All fields except description are required'
      });
    }

    const product = await FarmerProduct.create({
      villageId: villageId || '6664d999f999f999f999f999',
      farmerName,
      contactMobile,
      title,
      description: description || '',
      category,
      price,
      unit,
      postedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agricultural expert consultations
// @route   GET /api/v1/agriculture/consultations
// @access  Private
exports.getConsultations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user) {
      const isExpertOrAdmin = req.user.roles.some(r => ['Super Admin', 'Panchayat Admin', 'Volunteer'].includes(r));
      query = isExpertOrAdmin ? {} : { farmerId: req.user._id };
    } else {
      // Guest view: see all questions and advice
      query = {};
    }

    const consultations = await AgriConsultation.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: consultations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask a question to agricultural experts
// @route   POST /api/v1/agriculture/consultations
// @access  Private
exports.createConsultation = async (req, res, next) => {
  try {
    const { question, description, photoUrl, farmerName, villageId } = req.body;
    if (!question || !farmerName) {
      return res.status(400).json({
        success: false,
        message: 'Question and Farmer Name are required'
      });
    }

    const consultation = await AgriConsultation.create({
      villageId: villageId || '6664d999f999f999f999f999',
      farmerName,
      farmerId: req.user._id,
      question,
      description: description || '',
      photoUrl: photoUrl || ''
    });

    res.status(201).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a farmer consultation
// @route   PATCH /api/v1/agriculture/consultations/:id/reply
// @access  Private (Admin / Volunteer / Expert only)
exports.replyConsultation = async (req, res, next) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({
        success: false,
        message: 'Reply is required'
      });
    }

    const consultation = await AgriConsultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    consultation.reply = reply;
    consultation.repliedBy = req.user._id;
    consultation.isResolved = true;
    await consultation.save();

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Chatbot for agriculture questions
// @route   POST /api/v1/agriculture/ai-ask
// @access  Public
exports.aiAsk = async (req, res, next) => {
  const { query } = req.body;
  try {
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        success: true,
        reply: getLocalAgriResponse(query)
      });
    }

    const prompt = `
      You are an expert Agricultural AI Assistant for Kaimur district, Bihar, helping Pateri village farmers.
      
      LANGUAGE RULES:
      1. Always respond in the EXACT same language/style used by the user.
      2. If they write in Hinglish (Roman script Hindi/Hinglish, e.g. "kheti ke bare me btao", "wheat bone ka time"), you MUST reply in Hinglish.
      3. If they write in English, reply in English.
      4. If they write in Devanagari Hindi, reply in Devanagari Hindi.
      5. Never switch to another language unless explicitly requested.
      
      Answer the farmer's question in a clear, detailed, and extremely practical way.
      Incorporate local Kaimur sowing times, soil types, and regional practices where relevant.
      Provide clear recommendations for seeds, irrigation, fertilizer dosages (in kg/acre or standard bags), and pest/disease controls.
      
      Farmer's Question: "${query}"
      Detailed response:
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (data.error || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
      throw new Error(data.error?.message || 'Gemini response empty/invalid');
    }
    const reply = data.candidates[0].content.parts[0].text.trim();

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('AI Ask Error:', error);
    res.status(200).json({
      success: true,
      reply: getLocalAgriResponse(query)
    });
  }
};

// @desc    AI Crop Disease Doctor
// @route   POST /api/v1/agriculture/crop-doctor
// @access  Public
exports.cropDoctor = async (req, res, next) => {
  try {
    const { description, image } = req.body;
    if (!description && !image) {
      return res.status(400).json({ success: false, message: 'Description or Image is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        success: true,
        data: {
          diseaseName: 'Mock Rust Disease',
          confidenceScore: '90%',
          symptoms: ['Yellow spots on leaves', 'Powdery texture'],
          causes: ['Excess humidity', 'Fungal spores'],
          prevention: ['Keep fields clean', 'Ensure row spacing'],
          treatment: ['Spray copper oxychloride fungicide', 'Remove infected leaves'],
          fertilizerSuggestions: 'Apply Potash to boost structural immunity. Reduce excess Nitrogen.',
          irrigationAdvice: 'AWD (Alternate Wetting and Drying). Avoid water stagnation.',
          yieldImpact: 'Could reduce crop yield by 15-20% if left untreated.'
        }
      });
    }

    const prompt = `
      You are an expert AI Crop Doctor for Kaimur district, Bihar.
      Analyze the crop disease or issue described.
      Describe the probable disease, explain key symptoms, identify possible causes, suggest preventive measures, detail treatment options, provide fertilizer suggestions, recommend irrigation advice, and estimate yield impact.
      Return your analysis as a strict JSON object structure:
      {
        "diseaseName": "Name of the disease",
        "confidenceScore": "percentage (e.g. 85%)",
        "symptoms": ["Symptom 1", "Symptom 2"],
        "causes": ["Cause 1", "Cause 2"],
        "prevention": ["Prevention method 1", "Prevention method 2"],
        "treatment": ["Treatment option 1", "Treatment option 2"],
        "fertilizerSuggestions": "Recommended fertilizer dose/schedule adjustment",
        "irrigationAdvice": "Watering changes or requirements",
        "yieldImpact": "Estimated impact on crop production (e.g. 20-30% loss)"
      }
      Do not include any markdown format like \`\`\`json or other text besides the JSON.
      
      Farmer's issue description: "${description || 'Please analyze this image.'}"
      JSON response:
    `;

    const contentsPayload = {
      parts: [{ text: prompt }]
    };

    if (image) {
      contentsPayload.parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: image.split(',')[1] || image
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [contentsPayload]
      })
    });

    const data = await response.json();
    let replyText = '';
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      replyText = data.candidates[0].content.parts[0].text.trim();
    }

    let parsedData = {};
    try {
      const cleaned = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', replyText);
      parsedData = {
        diseaseName: 'Unknown Fungal Disease',
        confidenceScore: '50%',
        symptoms: ['Unable to parse details dynamically.'],
        causes: ['Description unclear.'],
        prevention: ['Keep fields clean and well ventilated.'],
        treatment: ['Contact local Agriculture Officer.'],
        fertilizerSuggestions: 'Soil test recommended.',
        irrigationAdvice: 'Avoid over-irrigation.',
        yieldImpact: 'Undetermined.'
      };
    }

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('Crop Doctor Error:', error);
    res.status(200).json({
      success: true,
      data: {
        diseaseName: 'Fungal Rust / Leaf Spot (Offline Fallback)',
        confidenceScore: '80%',
        symptoms: ['Yellowish-brown spots on leaves', 'Leaf wilting and drying'],
        causes: ['High air humidity', 'Water logging in the field'],
        prevention: ['Maintain proper crop spacing', 'Ensure clean weeding'],
        treatment: ['Spray Copper Oxychloride or Carbendazim fungicide', 'Remove infected plant residues'],
        fertilizerSuggestions: 'Apply balanced NPK. Avoid excess Urea/Nitrogen.',
        irrigationAdvice: 'Avoid water stagnation. Irrigate moderately.',
        yieldImpact: 'May reduce yield by 10-15% if untreated.'
      }
    });
  }
};
