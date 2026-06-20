const KnowledgeBase = require('../models/KnowledgeBase');
const BloodDonor = require('../models/BloodDonor');
const SiteConfig = require('../models/SiteConfig');
const Announcement = require('../models/Announcement');
const ChatHistory = require('../models/ChatHistory');
const Resident = require('../models/Resident');
const Volunteer = require('../models/Volunteer');
const Complaint = require('../models/Complaint');
const CertificateRequest = require('../models/CertificateRequest');
const Document = require('../models/Document');

// Point and Badge system helpers
const getReputationBadge = (points) => {
  if (points >= 500) return '🏆 Pateri Hero';
  if (points >= 300) return '🥇 Gold Citizen';
  if (points >= 150) return '🥈 Silver Citizen';
  if (points >= 50) return '🥉 Bronze Citizen';
  return 'Verified Resident';
};

// 14 crops detailed dataset for internal AI Crop search
const CROP_DB = {
  paddy: {
    name: 'Paddy (Rice / धान)',
    overview: 'Paddy is the primary Kharif crop of Pateri village, grown in clayey soils with high water requirements.',
    season: 'Kharif (Monsoon)',
    soilType: 'Clayey / Clayey Loam (high water retention)',
    seedRate: '6-8 kg/acre (for transplanting method)',
    fertilizerSchedule: 'NPK 50:25:16 kg/acre. Apply nitrogen in 3 split doses (basal, tillering, panicle initiation). Organic FYM 4-5 tonnes/acre.',
    irrigationSchedule: 'High. Keep 5-10cm standing water in the transplantation fields. Follow AWD (Alternate Wetting & Drying) to save water.',
    diseases: 'Khaira Disease (stunted growth, bronze spots on leaves) - treat with 10kg Zinc Sulphate + 2kg Lime spray per acre. Bacterial Leaf Blight - spray Streptocycline (6g) + Copper Oxychloride (200g).',
    pests: 'Stem Borer (dead hearts) - apply Cartap Hydrochloride 4G granules (10 kg/acre) or spray Chlorpyriphos 20 EC.',
    harvesting: 'Harvest when 90% panicles turn golden yellow and grains are hard (moisture 14-16%).',
    storage: 'Sun-dry to 12% moisture. Store in dry, rat-proof godown away from floors.'
  },
  wheat: {
    name: 'Wheat (गेहूँ)',
    overview: 'Wheat is the dominant Rabi crop in Pateri, sown in winter and harvested in spring.',
    season: 'Rabi (Winter)',
    soilType: 'Well-drained Loamy to Clay Loam soils',
    seedRate: '40-45 kg/acre',
    fertilizerSchedule: 'NPK 60:24:16 kg/acre. 3-4 tonnes compost during field preparation.',
    irrigationSchedule: 'Medium. Requires 4-6 critical irrigations. CRI (Crown Root Initiation) stage at 21 days after sowing is critical.',
    diseases: 'Yellow Rust (yellow powder stripes on leaves) - spray Propiconazole 25 EC (Tilt) @ 200 ml/acre. Loose Smut - seed treatment with Vitavax (2.5 g/kg seed).',
    pests: 'Termites (roots eaten away) - seed treatment with Chlorpyriphos 20 EC or soil Fipronil granules.',
    harvesting: 'Harvest when straw turns golden and dry, and grains give a metallic bite sound (moisture 12-14%).',
    storage: 'Sun-dry to <10% moisture. Store in dry steel bins with dried neem leaves.'
  },
  maize: {
    name: 'Maize (मक्का)',
    overview: 'Maize is grown as a dual Kharif/Rabi crop, yielding high grain and fodder biomass.',
    season: 'Kharif / Rabi',
    soilType: 'Sandy Loam to Clay Loam, rich in organic matter',
    seedRate: '8-10 kg/acre',
    fertilizerSchedule: 'NPK 50:20:15 kg/acre. 4 tonnes compost/acre.',
    irrigationSchedule: 'Medium. Regular soil moisture but avoid waterlogging.',
    diseases: 'Maydis Leaf Blight (brown spots) - spray Mancozeb @ 2g/liter of water.',
    pests: 'Fall Armyworm - spray Spinetoram 11.7 SC @ 0.5 ml/liter of water.',
    harvesting: 'Harvest when husk turns dry and white, grains hard (moisture 20%).',
    storage: 'Dry to 12% moisture. Store in well-ventilated cribs or bins.'
  },
  mustard: {
    name: 'Mustard (सरसों)',
    overview: 'Rabi oilseed crop grown with low water requirements, highly profitable in Kaimur district.',
    season: 'Rabi (Winter)',
    soilType: 'Sandy Loam to Loamy soils',
    seedRate: '2-2.5 kg/acre',
    fertilizerSchedule: 'NPK 30:15:15 kg/acre + Sulphur (essential for oil content).',
    irrigationSchedule: 'Low. 1-2 irrigations at flowering and pod filling.',
    diseases: 'White Rust - spray Metalaxyl + Mancozeb. Alternaria Blight.',
    pests: 'Aphids (green-black insects clustering on flowers) - spray Dimethoate 30 EC @ 1.5 ml/liter.',
    harvesting: 'Harvest when pods (siliquae) turn yellowish-paper color.',
    storage: 'Dry to 8% moisture to prevent seed rancidity.'
  },
  chickpea: {
    name: 'Gram (Chickpea / चना)',
    overview: 'Leguminous Rabi pulse crop that enriches soil nitrogen, grown extensively in Chand block.',
    season: 'Rabi',
    soilType: 'Medium to heavy soils, well-drained',
    seedRate: '30-35 kg/acre',
    fertilizerSchedule: 'NPK 10:20:10 kg/acre. Requires low nitrogen due to nitrogen-fixing nodules.',
    irrigationSchedule: 'Low. 1-2 light irrigations maximum.',
    diseases: 'Fusarium Wilt (stunted wilting) - treat seed with Trichoderma viride (4g/kg seed).',
    pests: 'Pod Borer (holes in pods) - spray Indoxacarb 14.5 SC @ 0.5 ml/liter.',
    harvesting: 'Harvest when leaves turn reddish-brown and shed, and pods rattle when shaken.',
    storage: 'Dry to 9-10% moisture. Store in airtight metal bins.'
  }
};

// Helper for fuzzy resident matching (handles typos like "yoges pandey", "achal singh")
const findMatchingResidents = async (cleanInputName) => {
  const normalizedInput = cleanInputName.toLowerCase().replace(/[^a-z\u0900-\u097F]/g, '');
  if (normalizedInput.length < 3) return [];
  
  // 1. Direct exact/case-insensitive regex match (very fast)
  let matched = await Resident.find({ name: new RegExp('^' + cleanInputName.trim() + '$', 'i'), isDeleted: false });
  if (matched.length > 0) return matched;
  
  // 2. Substring search based on the first word of input name
  const firstWord = cleanInputName.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length >= 3) {
    matched = await Resident.find({
      name: new RegExp(firstWord, 'i'),
      isDeleted: false
    });
  } else {
    matched = [];
  }
  
  // If we found some candidates, let's filter them using Levenshtein distance similarity
  if (matched.length > 0) {
    const scored = matched.map(r => {
      const dbNameNormalized = r.name.toLowerCase().replace(/[^a-z\u0900-\u097F]/g, '');
      
      // Calculate Levenshtein distance
      let track = Array(dbNameNormalized.length + 1).fill(null).map(() => Array(normalizedInput.length + 1).fill(null));
      for (let i = 0; i <= normalizedInput.length; i += 1) track[0][i] = i;
      for (let j = 0; j <= dbNameNormalized.length; j += 1) track[j][0] = j;
      for (let j = 1; j <= dbNameNormalized.length; j += 1) {
        for (let i = 1; i <= normalizedInput.length; i += 1) {
          const indicator = normalizedInput[i - 1] === dbNameNormalized[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
            track[j][i - 1] + 1,
            track[j - 1][i] + 1,
            track[j - 1][i - 1] + indicator
          );
        }
      }
      const distance = track[dbNameNormalized.length][normalizedInput.length];
      const maxLen = Math.max(normalizedInput.length, dbNameNormalized.length);
      const similarity = 1 - (distance / maxLen);
      return { resident: r, similarity };
    });
    
    const goodMatches = scored
      .filter(s => s.similarity >= 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .map(s => s.resident);
      
    if (goodMatches.length > 0) return goodMatches;
  }
  
  // 3. Fallback: scan all residents if input name doesn't match first word but might have typo on first name
  const allResidents = await Resident.find({ isDeleted: false }, 'name ward houseNo residentId verificationStatus dob education mobile relationType relativeName gender occupation reputationPoints');
  const scoredAll = allResidents.map(r => {
    const dbNameNormalized = r.name.toLowerCase().replace(/[^a-z\u0900-\u097F]/g, '');
    
    if (Math.abs(dbNameNormalized.length - normalizedInput.length) > 4) {
      return { resident: r, similarity: 0 };
    }
    
    let track = Array(dbNameNormalized.length + 1).fill(null).map(() => Array(normalizedInput.length + 1).fill(null));
    for (let i = 0; i <= normalizedInput.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= dbNameNormalized.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= dbNameNormalized.length; j += 1) {
      for (let i = 1; i <= normalizedInput.length; i += 1) {
        const indicator = normalizedInput[i - 1] === dbNameNormalized[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    const distance = track[dbNameNormalized.length][normalizedInput.length];
    const maxLen = Math.max(normalizedInput.length, dbNameNormalized.length);
    const similarity = 1 - (distance / maxLen);
    return { resident: r, similarity };
  });
  
  return scoredAll
    .filter(s => s.similarity >= 0.7)
    .sort((a, b) => b.similarity - a.similarity)
    .map(s => s.resident);
};

// Helper to extract candidate name from query
const extractNameFromQuery = (query) => {
  let text = query.toLowerCase().trim();
  
  // Remove common greetings
  text = text.replace(/^(hi+|hello+|hey+|namaste|pranam|namaskar|ram\s*ram|radhe\s*radhe|sunो|suno)\s+/i, '');
  text = text.replace(/\s+(hi+|hello+|hey+|namaste|pranam|namaskar|ram\s*ram|radhe\s*radhe)$/i, '');
  
  // Remove introducing phrases
  text = text.replace(/^(?:my name is|my name's|i am|i'm|mera naam|main|mein|mai|me|im)\s+/i, '');
  
  // Remove trailing aux verbs or suffixes like "hu", "hoon", "hai"
  text = text.replace(/\s+(?:hai|hoon|hu|huu|ji|here|shree|mr|ms|mrs|he)$/i, '');
  
  // Handle ending with "hu mai" or similar
  text = text.replace(/\s+(?:hu|hoon|hai)\s+(?:mai|main|mein|me)$/i, '');
  text = text.replace(/^(?:im|i am)\s+/i, '');
  
  return text.trim();
};

// Helper for fallback answers when Gemini is offline or unavailable
const getLocalFallbackResponse = (query) => {
  const normalized = query.toLowerCase().trim();
  
  if (/crop|fasal|farming|kheti|dhan|rice|wheat|gehun|maize|makka|mustard|sarso|gram|chana|lentil|masoor|pigeon|arhar|moong|potato|aloo|tomato|tamatar|onion|pyaz|cauliflower|gobhi|brinjal|baingan|sugarcane|ganna/i.test(normalized)) {
    return "Aap kheti-baari (crops/crop diseases) ke baare me pooch rahe hain. Kripya Krishi Hub (/agriculture) section me check karein jahan crop guidelines, dynamic Mandi rates aur AI Crop Doctor features bina login ke bhi available hain.";
  }
  if (/mandi|price|rate|daam|bhaav|p2p/i.test(normalized)) {
    return "Live mandi rates aur peer-to-peer agriculture trading ki jankari ke liye, kripya Krishi Dashboard (/agriculture) check karein jahan Kaimur block ke daily prices update hote hain aur items sell/buy kiye ja sakte hain.";
  }
  if (/scheme|yojna|yojana|subsidy|govt|sarkari|labh|apply/i.test(normalized)) {
    return "Sarkari yojanaon (Schemes) aur benefits ke liye, kripya Schemes Dashboard (/services) check karein jahan dynamic application process, eligibility aur benefits details update hoti hain.";
  }
  if (/history|itihaas|year|timeline|founder|established|basa|gaav|gaon|village/i.test(normalized)) {
    return "Pateri Gram Panchayat Bihar ke Kaimur (Bhabua) jile ke Chand block me sthit hai. Yahan ki population lagbhag 1200+ hai. Gaon ki sthapna lagbhag 1950s me hui thi. Timeline page (/timeline) aur Analytics page (/demographics) par details dekh sakte hain.";
  }
  if (/resident|profile|voter|search|name|ward|house|makaan/i.test(normalized)) {
    return "Pateri ke residents ko search karne ke liye Directory (/directory) page ka upyog karein. Agar aap Pateri ke verified resident hain, toh OTP verification ke saath apna login profile claim kar sakte hain.";
  }
  if (/complaint|shikayat|form|report/i.test(normalized)) {
    return "Agar aapko koi shikayat (complaint) darj karni hai, toh login status me Shikayat Nivaaran (/complaints) portal check karein. Mukhiya office local complaints ka live tracking aur resolution karta hai.";
  }
  if (/achievement|award|scholarship|hall of fame|achiever/i.test(normalized)) {
    return "Gaon ke achievers, students, government employees aur army personnel ko dekhne ke liye Achievement Hall (/achievements) page check karein.";
  }
  if (/path|page|route|link|section|navigate|where is|kahan|kaha|rasta|go to|open/i.test(normalized)) {
    return "Digital Pateri Smart Village portal ke sabhi sections ke links aur paths:\n\n" +
      "- **Home Dashboard:** / (Main page, emergency contacts, notice board)\n" +
      "- **Resident Directory:** /directory (Verify resident records and digital ID cards)\n" +
      "- **Krishi Hub (Agriculture):** /agriculture (Weather, Mandi Rates table, Crop Calendar, Crop library)\n" +
      "- **Mandi P2P Marketplace:** /marketplace (Buy/Sell seeds, fertilizers, crop produce)\n" +
      "- **Complaints Portal:** /complaints (Submit and track village issues/grievances)\n" +
      "- **Employment Board:** /jobs (Local jobs, vacancies and applications)\n" +
      "- **Timeline & Achievements:** /timeline (Historical village events and achievers list)\n" +
      "- **Demographics & Census:** /demographics (Interactive chart visuals of the village population)\n" +
      "- **Digital Document Archive:** /archive (Historical maps, documents and Bhojpuri heritage files)\n" +
      "- **Emergency SOS:** /sos (Broadcast emergency live GPS coordinates)\n\n" +
      "Aap browser URL bar me direct in paths par navigate kar sakte hain ya top Navigation Bar use kar sakte hain.";
  }
  if (/kaise kaam|how does|work|kaise chalta|function/i.test(normalized)) {
    return "Digital Pateri portal ek Smart Village Operating System hai. Ye bina login ke bhi sabhi verified datasets (Mandi Rates, Directory, Crop Library, Maps) guest users ko display karta hai.\n\n" +
      "Grievance redressal complaints file karne, volunteering register karne, blood bank support aur need job form submit karne jaise core functions ke liye login anivarya hai. Baki sabhi pages guest user ke liye open hain.";
  }
  if (/hi+|hello+|hey+|namaste|pranam|namaskar|ram\s*ram|radhe\s*radhe/i.test(normalized)) {
    return "Namaskar! 🙏 Digital Pateri AI Assistant me aapka swagat hai. Main gaon ke verified residents, kheti-baari (Crop Library), mandi rates, emergency contacts, notice board aur schemes ki jankari de sakta hoon.\n\nAgar aap Pateri ke niwasi hain, toh kripya apna name batayein (E.g. *\"Hello, I am [Apna Name]\"*) taaki main aapki profile verify kar sakoon!";
  }
  
  return "Digital Pateri database me iska koi matching answer nahi mila. Aap emergency helpline (/sos), schemes (/services), crops (/agriculture), dashboard analytics (/demographics) aur notices (/notices) check kar sakte hain. Emergency support ke liye Mukhiya (+91 9473385741) se contact karein.";
};

// Intent classifier for chatbot
const classifyIntent = (query) => {
  const normalized = query.toLowerCase().trim();

  // 1. Self Greeting Identification (Fuzzy Matching)
  // Matches "hello i am Ram", "Mera naam Ram Kumar hai", "my name is Ram", etc.
  const greetingPatterns = [
    /^(?:hello+|hi+|namaste|pranam|namaskar|hey+|good\s*morning|ram\s*ram|radhe\s*radhe)?[\s,.]*(?:my name is|my name\'s|i am|i\'m|mera naam|main|mein|mai)\s+([a-zA-Z\u0900-\u097F]+(?:\s+[a-zA-Z\u0900-\u097F]+)*)/i,
    /^(?:hello+|hi+|namaste|pranam|namaskar|hey+|good\s*morning|ram\s*ram|radhe\s*radhe)\s+([a-zA-Z\u0900-\u097F]+(?:\s+[a-zA-Z\u0900-\u097F]+)*)$/i
  ];

  for (const pattern of greetingPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      let name = match[1].trim();
      // Remove trailing aux verbs
      name = name.replace(/\s+(?:hai|hoon|hu|huu|he|ji|here|shree|mr|ms|mrs)$/i, '').trim();
      if (name.length > 2) {
        return {
          type: 'SELF_GREETING',
          parameters: { name }
        };
      }
    }
  }

  // 2. Greeting without identity
  if (/^(hi+|hello+|namaste|pranam|namaskar|hey+|good\s*morning|ram\s*ram|radhe\s*radhe)$/i.test(normalized)) {
    return { type: 'GENERAL_GREETING', parameters: {} };
  }

  // 3. Blood Donor Search Intent
  const bloodGroupsRegex = /(a|b|ab|o)[\s-]?(positive|negative|\+|\-)/i;
  const bloodShortRegex = /\b(a|b|ab|o)[\+\-]\b/i;
  const hasBloodKeywords = /blood|donor|khoon|rakt/i.test(normalized);
  if (hasBloodKeywords || bloodGroupsRegex.test(normalized) || bloodShortRegex.test(normalized)) {
    let bloodGroup = '';
    const match = normalized.match(bloodGroupsRegex) || normalized.match(bloodShortRegex);
    if (match) {
      bloodGroup = match[0].toUpperCase().replace(/\s/g, '').replace('POSITIVE', '+').replace('NEGATIVE', '-');
    }
    return { type: 'BLOOD_DONOR_SEARCH', parameters: { bloodGroup } };
  }

  // 4. Resident Profile Lookup Intent
  // e.g. "Who is Manish Kumar?", "Vikram Singh details", "tell me about Reshad Khan"
  const isResidentQuery = /who is|tell me about|details of|profile of|profile|information about|ke baare me/i.test(normalized) || 
                          /reshad khan|gyashuddin|amit kumar|vikram singh|sunita devi|manish kumar/i.test(normalized);
  
  const isGeneralTopic = /history|itihaas|village|pateri|pateeri|crops|farming|kheti|fasal|scheme|yojana|yojna|weather|mausam|mandi|price|sos|emergency|notice|bulletin/i.test(normalized);

  if (isResidentQuery && !isGeneralTopic) {
    const cleanedSearch = normalized.replace(/who is|tell me about|details of|profile of|profile|information about|info|profile|ke baare me|kaun hai|btao/gi, '').trim();
    return { type: 'RESIDENT_LOOKUP', parameters: { searchStr: cleanedSearch } };
  }

  // 5. Emergency Contacts Intent
  if (/emergency|helpline|number|phone|call|contact|police|ambulance|hospital|sos/i.test(normalized)) {
    return { type: 'EMERGENCY_CONTACTS', parameters: {} };
  }

  // 6. Notices Intent
  if (/notice|announcement|panchayat|meeting|sabha/i.test(normalized)) {
    return { type: 'NOTICES_LOOKUP', parameters: {} };
  }

  // 7. Crop / Agriculture Knowledge Intent
  if (/crop|fasal|farming|kheti|paddy|dhan|rice|wheat|gehun|maize|makka|mustard|sarso|gram|chana|lentil|masoor|pigeon|arhar|moong|potato|aloo|tomato|tamatar|onion|pyaz|cauliflower|gobhi|brinjal|baingan|sugarcane|ganna/i.test(normalized)) {
    let cropKey = '';
    if (/paddy|dhan|rice/i.test(normalized)) cropKey = 'paddy';
    else if (/wheat|gehun/i.test(normalized)) cropKey = 'wheat';
    else if (/maize|makka/i.test(normalized)) cropKey = 'maize';
    else if (/mustard|sarso/i.test(normalized)) cropKey = 'mustard';
    else if (/gram|chana|chickpea/i.test(normalized)) cropKey = 'chickpea';
    else if (/lentil|masoor/i.test(normalized)) cropKey = 'lentil';
    else if (/pigeon|arhar/i.test(normalized)) cropKey = 'pigeonpea';
    else if (/moong/i.test(normalized)) cropKey = 'moong';
    else if (/potato|aloo/i.test(normalized)) cropKey = 'potato';
    else if (/tomato|tamatar/i.test(normalized)) cropKey = 'tomato';
    else if (/onion|pyaz/i.test(normalized)) cropKey = 'onion';
    else if (/cauliflower|gobhi/i.test(normalized)) cropKey = 'cauliflower';
    else if (/brinjal|baingan/i.test(normalized)) cropKey = 'brinjal';
    else if (/sugarcane|ganna/i.test(normalized)) cropKey = 'sugarcane';
    
    if (cropKey) {
      return { type: 'CROP_LOOKUP', parameters: { cropKey, searchStr: normalized } };
    }
  }

  // 8. Government Schemes Intent
  if (/scheme|yojana|yojna|subsidy|subsidy|credit card|scholarship/i.test(normalized)) {
    return { type: 'SCHEMES_LOOKUP', parameters: { searchStr: normalized } };
  }

  // 9. Statistics Intent
  if (/population|stats|statistics|demographics|literacy|houses|census/i.test(normalized)) {
    return { type: 'STATS_LOOKUP', parameters: {} };
  }

  // Default Fallback
  return { type: 'GENERAL_INFO', parameters: {} };
};

// @desc    Process chatbot text query
// @route   POST /api/v1/chatbot/query
// @access  Public
exports.queryChatbot = async (req, res, next) => {
  try {
    const { query, villageId, sessionId } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a query string' });
    }

    // 1. Check stateful identity confirmation flow
    let lastChat = null;
    if (sessionId) {
      lastChat = await ChatHistory.findOne({ sessionId }).sort({ timestamp: -1 });
    }

    if (lastChat && lastChat.metadata && lastChat.metadata.step === 'CONFIRM_IDENTITY') {
      const { name, matches } = lastChat.metadata;
      const normalizedQuery = query.toLowerCase().trim();
      
      let matchedResident = null;
      
      // Check for option index (1, 2, 3...)
      const matchIndexOpt = normalizedQuery.match(/\b(1|2|3|4|5|6|7|8|9|10)\b/);
      if (matchIndexOpt) {
        const idx = parseInt(matchIndexOpt[1], 10) - 1;
        if (idx >= 0 && idx < matches.length) {
          matchedResident = matches[idx];
        }
      }
      
      // Check for Ward number match
      if (!matchedResident) {
        const wardMatch = normalizedQuery.match(/ward\s*(\d+)/i) || normalizedQuery.match(/ward\s*no\.?\s*(\d+)/i) || normalizedQuery.match(/ward\s*number\s*(\d+)/i);
        if (wardMatch) {
          const wNum = wardMatch[1].padStart(2, '0');
          matchedResident = matches.find(m => m.ward === wNum || parseInt(m.ward, 10) === parseInt(wNum, 10));
        }
      }
      
      // Check for House number match
      if (!matchedResident) {
        matchedResident = matches.find(m => normalizedQuery.includes(m.houseNo.toLowerCase()));
      }
      
      // Try parsing single number as ward or option
      if (!matchedResident) {
        const singleNum = normalizedQuery.match(/^\s*(\d+)\s*$/);
        if (singleNum) {
          const num = singleNum[1].padStart(2, '0');
          matchedResident = matches.find(m => m.ward === num || parseInt(m.ward, 10) === parseInt(num, 10)) || matches[parseInt(num, 10) - 1];
        }
      }

      if (matchedResident) {
        // Found matching resident! Show their details.
        const residentObj = await Resident.findById(matchedResident._id);
        const pendingCertsCount = await CertificateRequest.countDocuments({ residentId: residentObj._id, status: 'Pending' });
        
        let activeComplaintsCount = 0;
        if (residentObj.ownerId) {
          activeComplaintsCount = await Complaint.countDocuments({ userId: residentObj.ownerId, status: { $in: ['Pending', 'In Progress'] } });
        }

        const badge = getReputationBadge(residentObj.reputationPoints || 0);

        const replyText = `Welcome back ${residentObj.name} ji! 👋 (Confirmed as Ward ${residentObj.ward}, House ${residentObj.houseNo || 'N/A'})\n\n` +
          `📍 Ward: ${residentObj.ward || 'N/A'}\n` +
          `🏠 House: ${residentObj.houseNo || 'N/A'}\n` +
          `🎖️ Status: ${badge} (Points: ${residentObj.reputationPoints || 0})\n\n` +
          `Aapke account details:\n` +
          `- Pending certificate applications: **${pendingCertsCount}**\n` +
          `- Active complaints pending resolution: **${activeComplaintsCount}**\n` +
          `- Upcoming Village activity: **Health Camp on 22 June** at Rajkiya Madhya Vidyalaya.\n\n` +
          `Main aaj aapki kya madad kar sakta hoon?`;

        await ChatHistory.create({
          userId: req.user ? req.user._id : undefined,
          sessionId,
          question: query,
          answer: replyText,
          metadata: { step: 'COMPLETED', residentId: residentObj._id }
        });

        return res.status(200).json({
          success: true,
          data: {
            reply: replyText,
            systemSource: 'database_query',
            intentMatched: 'CONFIRM_IDENTITY_SUCCESS'
          }
        });
      } else if (normalizedQuery.includes('none') || normalizedQuery.includes('nahi') || normalizedQuery.includes('no')) {
        const replyText = `Koi baat nahi! Swagat hai aapka Digital Pateri portal par. Main aapki kya madad kar sakta hoon? (Aap crops, yojanao, emergency contacts ya notices ke baare me pooch sakte hain)`;
        await ChatHistory.create({
          userId: req.user ? req.user._id : undefined,
          sessionId,
          question: query,
          answer: replyText,
          metadata: { step: 'CANCELLED' }
        });
        return res.status(200).json({
          success: true,
          data: {
            reply: replyText,
            systemSource: 'local_rules',
            intentMatched: 'CONFIRM_IDENTITY_CANCELLED'
          }
        });
      } else {
        const replyText = `Mujhe aapke selection se matched resident confirmation nahi mila. Kripya niche diye gaye options me se correct option number (jaise: '1') ya Ward type karein:\n\n` +
          matches.map((r, i) => `${i + 1}. **${r.name}** (Ward ${r.ward}, House ${r.houseNo || 'N/A'})`).join('\n') +
          `\n\nAap inme se kaun hain? (Agar inme se koi nahi, toh 'No' reply karein)`;

        await ChatHistory.create({
          userId: req.user ? req.user._id : undefined,
          sessionId,
          question: query,
          answer: replyText,
          metadata: lastChat.metadata
        });

        return res.status(200).json({
          success: true,
          data: {
            reply: replyText,
            systemSource: 'database_query',
            intentMatched: 'CONFIRM_IDENTITY_RETRY'
          }
        });
      }
    }

    let intent = classifyIntent(query);
    
    // Check if it's a fallback (GENERAL_INFO) but matches a resident's name via fuzzy matching
    if (intent.type === 'GENERAL_INFO') {
      const cleanQuery = extractNameFromQuery(query);
      if (cleanQuery && cleanQuery.length >= 3) {
        const matchedResidents = await findMatchingResidents(cleanQuery);
        if (matchedResidents.length > 0) {
          intent = {
            type: 'SELF_GREETING',
            parameters: { name: matchedResidents[0].name }
          };
        }
      }
    }

    let reply = '';
    let systemSource = 'local_rules';
    let intentMatched = intent.type;

    const user = req.user;
    const isLoggedIn = !!user;
    const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));

    switch (intent.type) {
      case 'SELF_GREETING': {
        const name = intent.parameters.name;
        const residents = await Resident.find({ name: new RegExp(name, 'i'), isDeleted: false });
        
        if (residents.length === 0) {
          reply = `Hello ${name}! Swagat hai aapka Digital Pateri portal par. Main aapka name database me nahi dhoond paaya, kya aap verified resident hain? Profile claim karne ke liye dashboard me OTP verification karein.`;
          
          await ChatHistory.create({
            userId: req.user ? req.user._id : undefined,
            sessionId,
            question: query,
            answer: reply
          });
        } else if (residents.length === 1) {
          const resident = residents[0];
          const pendingCertsCount = await CertificateRequest.countDocuments({ residentId: resident._id, status: 'Pending' });
          
          let activeComplaintsCount = 0;
          if (resident.ownerId) {
            activeComplaintsCount = await Complaint.countDocuments({ userId: resident.ownerId, status: { $in: ['Pending', 'In Progress'] } });
          }

          const badge = getReputationBadge(resident.reputationPoints || 0);

          reply = `Welcome back ${resident.name} ji! 👋\n\n` +
            `📍 Ward: ${resident.ward || 'N/A'}\n` +
            `🏠 House: ${resident.houseNo || 'N/A'}\n` +
            `🎖️ Status: ${badge} (Points: ${resident.reputationPoints || 0})\n\n` +
            `Aapke account details:\n` +
            `- Pending certificate applications: **${pendingCertsCount}**\n` +
            `- Active complaints pending resolution: **${activeComplaintsCount}**\n` +
            `- Upcoming Village activity: **Health Camp on 22 June** at Rajkiya Madhya Vidyalaya.\n\n` +
            `Main aaj aapki kya madad kar sakta hoon?`;

          await ChatHistory.create({
            userId: req.user ? req.user._id : undefined,
            sessionId,
            question: query,
            answer: reply
          });
        } else {
          // Multiple residents found!
          reply = `Swagat hai! Mujhe Pateri database me **${name}** name ke **${residents.length}** records mile hain. Kripya niche diye gaye options me se select karein ki aap kaun hain (apna Option Number ya Ward Number type karein):\n\n` +
            residents.map((r, i) => `${i + 1}. **${r.name}** (Ward ${r.ward}, House ${r.houseNo || 'N/A'})`).join('\n') +
            `\n\nAap inme se kaun hain?`;

          await ChatHistory.create({
            userId: req.user ? req.user._id : undefined,
            sessionId,
            question: query,
            answer: reply,
            metadata: {
              step: 'CONFIRM_IDENTITY',
              name,
              matches: residents.map(r => ({ _id: r._id, name: r.name, ward: r.ward, houseNo: r.houseNo }))
            }
          });
        }
        
        return res.status(200).json({
          success: true,
          data: {
            reply,
            systemSource: 'database_query',
            intentMatched
          }
        });
      }

      case 'GENERAL_GREETING': {
        reply = `Namaskar! 🙏 Digital Pateri AI Assistant me aapka swagat hai.\n\n` +
          `Main is portal par aapki sahayata ke liye active hoon. Main ye sab kar sakta hoon:\n` +
          `1. **Resident Identity Verification:** Apna verified profile aur details dekhne ke liye batayein *"Hello, I am [Apna Name]"* (Jaise: *Hello, I am Rajesh Kumar*).\n` +
          `2. **Kheti-Baari (Crops Guide):** crops ki details, fertilizers, pests aur calendar guides (Jaise: *wheat crop details*).\n` +
          `3. **Live Mandi Rates:** daily commodity pricing details (Jaise: *mandi rates btao*).\n` +
          `4. **Emergency Support:** Helplines aur SOS system details (Jaise: *sos kaise kaam krta hai*).\n` +
          `5. **Panchayat Announcements & Schemes:** govt schemes aur notice listings.\n` +
          `6. **Page Sections & Routes:** gaon ke pages/links ki list (Jaise: *page paths btao*).\n\n` +
          `Aap Hindi, Hinglish ya English me question bejhijhak pooch sakte hain. Main aapki kya madad karoon?`;
        break;
      }

      case 'RESIDENT_LOOKUP': {
        const searchStr = intent.parameters.searchStr;
        if (!searchStr) {
          reply = 'Kripya resident ka name batayein jiske baare me aap dhoond rahe hain.';
          break;
        }

        const resident = await Resident.findOne({ name: new RegExp(searchStr, 'i'), isDeleted: false });
        if (!resident) {
          reply = `Mujhe "${searchStr}" naam ka koi resident Pateri database me nahi mila.`;
          break;
        }

        const badge = getReputationBadge(resident.reputationPoints || 0);

        // PRIVACY ENFORCEMENT logic based on User Level
        if (isAdmin) {
          // Admin View: Full Details
          const family = await Resident.find({ houseNo: resident.houseNo, _id: { $ne: resident._id }, isDeleted: false }).select('name relationType gender');
          const familyStr = family.length > 0 ? family.map(f => `- ${f.name} (${f.gender})`).join('\n') : 'No registered family members in database.';

          reply = `🛡️ **Admin Access - Full Resident Profile:**\n\n` +
            `- **Name:** ${resident.name}\n` +
            `- **Resident ID:** ${resident.residentId}\n` +
            `- **DOB:** ${resident.dob ? new Date(resident.dob).toLocaleDateString() : 'N/A'}\n` +
            `- **Gender:** ${resident.gender}\n` +
            `- **Mobile:** +91 ${resident.mobile || 'N/A'}\n` +
            `- **Aadhaar (Last 4):** ${resident.aadhaarLast4 || 'N/A'}\n` +
            `- **Voter ID:** ${resident.voterId || 'N/A'}\n` +
            `- **Ration Card:** ${resident.rationCardNumber || 'N/A'}\n` +
            `- **Ward:** ${resident.ward}, **House No:** ${resident.houseNo}\n` +
            `- **Occupation:** ${resident.occupation || 'N/A'}, **Education:** ${resident.education || 'N/A'}\n` +
            `- **Reputation Badge:** ${badge} (Points: ${resident.reputationPoints || 0})\n\n` +
            `👨‍👩‍👧‍👦 **Family Members in House ${resident.houseNo}:**\n${familyStr}`;
        } else if (isLoggedIn) {
          // Logged-in Resident View: Limited details
          const vol = await Volunteer.findOne({ residentId: resident._id });
          const volStatus = vol ? `Registered Volunteer (${vol.category})` : 'Not registered as volunteer';

          reply = `👤 **Resident Directory Record:**\n\n` +
            `- **Name:** ${resident.name}\n` +
            `- **Village:** Pateri, Chand Block\n` +
            `- **Occupation:** ${resident.occupation || 'N/A'}\n` +
            `- **Ward Number:** Ward ${resident.ward || 'N/A'}\n` +
            `- **Reputation Score:** ${badge}\n` +
            `- **Volunteer Status:** ${volStatus}\n\n` +
            `*Tip: Logged-in residents can verify ward and volunteering designations. Full credentials require Admin login.*`;
        } else {
          // Guest User View: Strictly restricted
          reply = `👤 **Resident Directory (Guest View):**\n\n` +
            `- **Name:** ${resident.name}\n` +
            `- **Village:** Pateri Gram Panchayat\n` +
            `- **Occupation:** ${resident.occupation || 'N/A'}\n` +
            `- **Verification Status:** ${resident.verificationStatus ? '✓ Verified Resident Badge' : 'Pending Verification'}\n\n` +
            `🔒 *Privacy Lock: Personal details (Ward, House No, Mobile) are hidden. Please login to see more details.*`;
        }
        systemSource = 'database_query';
        break;
      }

      case 'CROP_LOOKUP': {
        const Crop = require('../models/Crop');
        const cropKey = intent.parameters.cropKey;
        const searchStr = intent.parameters.searchStr || query;
        
        const crop = await Crop.findOne({
          $or: [
            { cropId: cropKey },
            { 'name.en': new RegExp(cropKey || searchStr, 'i') },
            { 'name.hi': new RegExp(cropKey || searchStr, 'i') },
            { localName: new RegExp(cropKey || searchStr, 'i') }
          ]
        });

        if (!crop) {
          const fallbackCrop = CROP_DB[cropKey];
          if (fallbackCrop) {
            reply = `🌾 **Crop Details - ${fallbackCrop.name}:**\n\n` +
              `📝 **Overview:** ${fallbackCrop.overview}\n` +
              `- **Best Season:** ${fallbackCrop.season}\n` +
              `- **Soil Type:** ${fallbackCrop.soilType}\n` +
              `- **Seed Rate:** ${fallbackCrop.seedRate}\n\n` +
              `🧪 **Fertilizer Schedule:** ${fallbackCrop.fertilizerSchedule}\n` +
              `💧 **Irrigation Schedule:** ${fallbackCrop.irrigationSchedule}\n` +
              `🛡️ **Disease Management:** ${fallbackCrop.diseases}\n` +
              `🐛 **Pest Management:** ${fallbackCrop.pests}\n\n` +
              `🍂 **Harvesting:** ${fallbackCrop.harvesting}\n` +
              `📦 **Storage:** ${fallbackCrop.storage}`;
          } else {
            reply = `Mujhe crop "${cropKey || searchStr}" ki details database me nahi mili. Sowing seasons ya alerts ki jankari ke liye Krishi Hub check karein.`;
          }
        } else {
          reply = `🌾 **Crop Details - ${crop.name.en} (${crop.localName || ''}):**\n\n` +
            `📝 **Introduction:** ${crop.introduction || 'N/A'}\n` +
            `- **Scientific Name:** *${crop.scientificName || 'N/A'}*\n` +
            `- **Best Season:** ${crop.season?.en || 'N/A'}\n` +
            `- **Suitable Climate:** ${crop.climate || 'N/A'}\n` +
            `- **Soil Requirement:** ${crop.soilRequirement || 'N/A'}\n` +
            `- **Seed Rate:** ${crop.seedRate || 'N/A'}\n\n` +
            `🧪 **Fertilizer Schedule:** ${crop.fertilizerSchedule || 'N/A'}\n` +
            `💧 **Irrigation Schedule:** ${crop.irrigationSchedule || 'N/A'}\n` +
            `🛡️ **Disease Management:** ${crop.diseaseManagement || 'N/A'}\n` +
            `🐛 **Pest Management:** ${crop.pestManagement || 'N/A'}\n\n` +
            `🍂 **Harvesting:** ${crop.harvestGuide || 'N/A'}\n` +
            `📦 **Storage:** ${crop.storageGuide || 'N/A'}`;
        }
        systemSource = 'database_query';
        break;
      }

      case 'SCHEMES_LOOKUP': {
        const Scheme = require('../models/Scheme');
        const searchStr = intent.parameters.searchStr || query;
        const schemes = await Scheme.find({
          $or: [
            { title: new RegExp(searchStr, 'i') },
            { description: new RegExp(searchStr, 'i') },
            { eligibility: new RegExp(searchStr, 'i') }
          ]
        }).limit(3);

        if (schemes.length === 0) {
          const allSchemes = await Scheme.find().limit(3);
          reply = `Mujhe us scheme ki specific details nahi mili. Pateri me active schemes:\n\n` +
            allSchemes.map(s => `* **${s.title}**: ${s.description}\n  Eligibility: ${s.eligibility}`).join('\n\n');
        } else {
          reply = `Matching Bihar & Central Government schemes:\n\n` +
            schemes.map(s => `* **${s.title}**:\n  - **Description:** ${s.description}\n  - **Eligibility:** ${s.eligibility}\n  - **Benefits:** ${s.benefits}\n  - **Documents:** ${s.requiredDocuments.join(', ')}\n  - **Process:** ${s.applicationProcess}`).join('\n\n');
        }
        systemSource = 'database_query';
        break;
      }

      case 'STATS_LOOKUP': {
        const totalCount = await Resident.countDocuments({ isDeleted: false, verificationStatus: 'verified' });
        const male = await Resident.countDocuments({ gender: 'Male', isDeleted: false, verificationStatus: 'verified' });
        const female = await Resident.countDocuments({ gender: 'Female', isDeleted: false, verificationStatus: 'verified' });
        
        reply = `📊 **Pateri Village Demographics Statistics:**\n\n` +
          `- **Total Verified Population:** ${totalCount} residents\n` +
          `- **Gender Split:** Male: ${male} | Female: ${female}\n` +
          `- **Total Households:** 280 (approx. 210 occupied)\n` +
          `- **Primary Occupation:** Agriculture/Farming (65%)\n` +
          `- **Smart Indicators:** 100% solar lighting in common lanes, dynamic QR resident identity cards issued.\n\n` +
          `Demographics page (/demographics) par detailed graphs available hain!`;
        systemSource = 'database_query';
        break;
      }

      case 'BLOOD_DONOR_SEARCH': {
        const bg = intent.parameters.bloodGroup;
        if (!bg) {
          reply = 'Aap kis blood group ke donors ko dhoond rahe hain? Kripya blood group batayein (E.g. A+, O+, B-).';
          break;
        }

        const donors = await BloodDonor.find({ bloodGroup: bg, availabilityStatus: true, isDeleted: false })
          .populate({ path: 'residentId', select: 'name mobile' });

        if (donors.length === 0) {
          reply = `Mujhe Pateri me ${bg} blood group ka koi active donor nahi mila. Emergency me please Mukhiya Office (+91 9473385741) me call karein.`;
        } else {
          reply = `🩸 **Active ${bg} Blood Donors in Pateri:**\n\n` + 
            donors.map(d => `- **${d.residentId.name}** | Contact: +91 ${d.residentId.mobile}`).join('\n') +
            `\n\n*Kripya emergency swasthya sahayata me hi call karein.*`;
        }
        systemSource = 'database_query';
        break;
      }

      case 'EMERGENCY_CONTACTS': {
        reply = `🚨 **Pateri Emergency SOS System & Helplines:**\n\n` +
          `**SOS Button working:** Agar aap /sos page par jaakar Emergency SOS trigger button ko hold karenge, toh system aapki live GPS coordinates aur details Panchayat Admin aur nearby active volunteers ko alert notification ke roop me instant send karega.\n\n` +
          `**Pateri Emergency Helplines:**\n` +
          `- **Mukhiya (Reshad Khan):** +91 9473385741\n` +
          `- **Sarpanch (Gyashuddin):** +91 9473385742\n` +
          `- **PACS Adhyaksh (Naushad Khan):** +91 9473385743\n` +
          `- **Ambulance:** 102\n` +
          `- **Police (Chand Thana):** 112 / 100\n` +
          `- **Electricity Complaint Office:** +91 6189 223344\n` +
          `- **Bhabhua Sadar Hospital:** +91 6189 224488\n\n` +
          `*Aap direct /sos page check karke emergency alert trigger kar sakte hain.*`;
        break;
      }

      case 'NOTICES_LOOKUP': {
        const notices = await Announcement.find({ isDeleted: false }).sort('-createdAt').limit(3);
        if (notices.length === 0) {
          reply = 'Panchayat Notice Board par abhi koi active announcement nahi hai.';
        } else {
          reply = `📢 **Active Announcements from Pateri Panchayat:**\n\n` +
            notices.map(n => `* **${n.title}** (${new Date(n.createdAt).toLocaleDateString()}):\n"${n.content}"`).join('\n\n');
        }
        systemSource = 'database_query';
        break;
      }

      case 'GENERAL_INFO':
      default: {
        // 1. Try Crop DB
        const Crop = require('../models/Crop');
        const cropMatch = await Crop.findOne({ 
          $or: [
            { cropId: new RegExp(query, 'i') },
            { 'name.en': new RegExp(query, 'i') },
            { 'name.hi': new RegExp(query, 'i') },
            { localName: new RegExp(query, 'i') }
          ] 
        });
        if (cropMatch) {
          reply = `🌾 **Crop Details - ${cropMatch.name.en} (${cropMatch.localName || ''}):**\n\n` +
            `📝 **Introduction:** ${cropMatch.introduction || 'N/A'}\n` +
            `- **Best Season:** ${cropMatch.season?.en || 'N/A'}\n` +
            `- **Soil Requirement:** ${cropMatch.soilRequirement || 'N/A'}\n` +
            `🧪 **Fertilizer:** ${cropMatch.fertilizerSchedule || 'N/A'}\n` +
            `💧 **Irrigation:** ${cropMatch.irrigationSchedule || 'N/A'}\n` +
            `🛡️ **Disease Control:** ${cropMatch.diseaseManagement || 'N/A'}`;
          systemSource = 'database_query';
          break;
        }

        // 2. Try Schemes DB
        const Scheme = require('../models/Scheme');
        const schemeMatch = await Scheme.findOne({
          $or: [
            { title: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') }
          ]
        });
        if (schemeMatch) {
          reply = `📋 **Government Scheme - ${schemeMatch.title}:**\n\n` +
            `- **Category:** ${schemeMatch.category}\n` +
            `- **Description:** ${schemeMatch.description}\n` +
            `- **Eligibility:** ${schemeMatch.eligibility}\n` +
            `- **Benefits:** ${schemeMatch.benefits}`;
          systemSource = 'database_query';
          break;
        }

        // Retrieve session history for context-awareness (up to 5 recent turns)
        let historyContext = '';
        if (sessionId) {
          try {
            const chatHistoryList = await ChatHistory.find({ sessionId }).sort({ timestamp: -1 }).limit(5);
            chatHistoryList.reverse();
            if (chatHistoryList.length > 0) {
              historyContext = chatHistoryList.map(h => `User: ${h.question}\nAI: ${h.answer}`).join('\n');
            }
          } catch (historyErr) {
            console.error('Error fetching chat history context:', historyErr);
          }
        }

        // 3. Try FAQ (KnowledgeBase)
        const kbDocs = await KnowledgeBase.find({ $text: { $search: query } }).limit(2);
        let context = kbDocs.length > 0 ? kbDocs.map(doc => doc.content).join('\n') : '';
        
        if (context) {
          const apiKey = process.env.GEMINI_API_KEY;
          if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            try {
              const prompt = `
                You are the AI Smart Village Assistant for the village Pateri (spelled "पतेरी" in Hindi, never "पटेरी") in Chand Block, Kaimur district, Bihar.
                Answer the user's question about Pateri.
                
                LANGUAGE RULES:
                1. Always respond in the language the user is speaking (English, Hindi, or Hinglish).
                2. If the user explicitly asks to speak in a certain language (e.g. "Hindi me baat karo", "talk in english", "hinglish use karo"), you MUST switch to that language and continue using it.
                3. Use the conversation history below to recognize the user's language preferences and maintain context.
                4. For Hindi responses, always write the village name as "पतेरी" (never "पटेरी").
                
                Context from Pateri Knowledge Base:
                ${context}
                
                Conversation History:
                ${historyContext}
                
                User question: "${query}"
                Answer:
              `;

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
              });

              const data = await response.json();
              if (data.candidates && data.candidates[0].content.parts[0].text) {
                reply = data.candidates[0].content.parts[0].text.trim();
                systemSource = 'gemini_api';
                break;
              }
            } catch (err) {
              console.error('Gemini call error:', err);
            }
          }
          
          reply = context;
          systemSource = 'database_query';
          break;
        }

        // 4. Default to Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
          try {
            const prompt = `
              You are the AI Smart Village Assistant for the village Pateri (spelled "पतेरी" in Hindi, never "पटेरी") in Chand Block, Kaimur district, Bihar.
              Answer the user's question about Pateri.
              
              LANGUAGE RULES:
              1. Always respond in the language the user is speaking (English, Hindi, or Hinglish).
              2. If the user explicitly asks to speak in a certain language (e.g. "Hindi me baat karo", "talk in english", "hinglish use karo"), you MUST switch to that language and continue using it.
              3. Use the conversation history below to recognize the user's language preferences and maintain context.
              4. For Hindi responses, always write the village name as "पतेरी" (never "पटेरी").
              
              If the user is asking about crops, schemes, or directory search, explain that they can find it in the search bar or sidebar menus.
              
              Conversation History:
              ${historyContext}
              
              User question: "${query}"
              Answer:
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
              reply = data.candidates[0].content.parts[0].text.trim();
              systemSource = 'gemini_api';
            } else {
              throw new Error('Gemini parse error');
            }
          } catch (error) {
            console.error('Gemini error:', error);
            reply = getLocalFallbackResponse(query);
            systemSource = 'local_rules';
          }
        } else {
          reply = getLocalFallbackResponse(query);
          systemSource = 'local_rules';
        }
        break;
      }
    }

    // Save Chat History
    await ChatHistory.create({
      userId: req.user ? req.user._id : undefined,
      sessionId,
      question: query,
      answer: reply
    });

    res.status(200).json({
      success: true,
      data: {
        reply,
        systemSource,
        intentMatched
      }
    });
  } catch (error) {
    next(error);
  }
};
