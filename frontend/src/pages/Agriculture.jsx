import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { translations } from '../utils/translations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Sprout, TrendingUp, TrendingDown, CloudSun, Thermometer, 
  Droplets, CloudRain, Calendar, ChevronRight, Info, 
  Search, FileText, Store, RefreshCw, AlertCircle, BookOpen,
  MessageSquare, Send, Upload, User, ShieldAlert, Map, Plus,
  ShoppingBag, Phone, MapPin, Wind, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = '/api/v1';

// Detailed static 14 crops dataset for 100% offline crop knowledge library
const CROP_DATA = [
  {
    id: 'paddy',
    name: { en: 'Paddy (Rice)', hi: 'धान (चावल)', hn: 'Dhan (Paddy)' },
    season: { en: 'Kharif (Monsoon)', hi: 'खरीफ (मानसून)', hn: 'Kharif (Monsoon)' },
    soil: { en: 'Clayey / Clayey Loam (Retention of water is essential)', hi: 'मटियार / दोमट मिट्टी (जल धारण क्षमता आवश्यक)', hn: 'Clayey / Doomat mitti (Water retention jaruri hai)' },
    water: { en: 'High', hi: 'अधिक', hn: 'High' },
    sowing: {
      time: { en: 'June 15 - July 15 (Nursery prep: early June)', hi: '15 जून - 15 जुलाई (नर्सरी: जून की शुरुआत)', hn: 'June 15 - July 15 (Nursery: June starting)' },
      seedRate: { en: '6-8 kg/acre', hi: '6-8 किग्रा/एकड़', hn: '6-8 kg/acre' },
      spacing: { en: '20 cm x 15 cm', hi: '20 सेमी x 15 सेमी', hn: '20 cm x 15 cm' }
    },
    fertilizer: {
      npk: { en: '50:25:16 kg/acre', hi: '50:25:16 किग्रा/एकड़', hn: '50:25:16 kg/acre' },
      organic: { en: 'Compost/FYM 4-5 tonnes/acre', hi: 'गोबर की खाद 4-5 टन/एकड़', hn: 'Gobar ki khaad 4-5 tonnes/acre' }
    },
    weed: {
      time: { en: '20-25 days (1st), 40-45 days (2nd)', hi: '20-25 दिन (पहला), 40-45 दिन (दूसरा)', hn: '20-25 days (1st), 40-45 days (2nd)' },
      method: { en: 'Manual weeding or Pretilachlor herbicide within 3 days', hi: 'हाथ से निराई या 3 दिनों में प्रेटीलाक्लोर छिड़काव', hn: 'Manual weeding ya 3 days me Pretilachlor spray' }
    },
    diseases: [
      {
        name: { en: 'Khaira Disease', hi: 'खैरा रोग', hn: 'Khaira Disease' },
        symptoms: { en: 'Bronze/rusty leaf color, stunted growth', hi: 'पत्तियों का तांबे जैसा रंग, बौनापन', hn: 'Pattiyon ka bronze color, stunted growth' },
        remedy: { en: 'Zinc Sulphate (10kg) + Lime (2kg) spray per acre', hi: 'जिंक सल्फेट (10kg) + चूना (2kg) का छिड़काव प्रति एकड़', hn: 'Zinc Sulphate (10kg) + Lime (2kg) ka spray per acre' }
      },
      {
        name: { en: 'Bacterial Leaf Blight (BLB)', hi: 'जीवाणु झुलसा रोग', hn: 'Bacterial Leaf Blight' },
        symptoms: { en: 'Yellow stripes along leaf margins, wilting', hi: 'पत्तियों के किनारों पर पीली धारियां, सूखना', hn: 'Pattiyon ke kinaro par pili dhariyan, sookhna' },
        remedy: { en: 'Streptocycline (6g) + Copper Oxychloride (200g) spray', hi: 'स्ट्रैप्टोसाइक्लिन (6g) + कॉपर ऑक्सीक्लोराइड (200g) का छिड़काव', hn: 'Streptocycline (6g) + Copper Oxychloride (200g) ka spray' }
      }
    ],
    harvesting: {
      signs: { en: '90% panicles turn golden yellow, grains feel hard', hi: '90% बालियां सुनहरी पीली हो जाती हैं, दाने कठोर हो जाते हैं', hn: '90% baliyan golden yellow ho jati hain, dane hard' },
      moisture: { en: '14-16% for harvesting; 12% for storage', hi: 'कटाई के लिए 14-16% नमी; भंडारण के लिए 12%', hn: 'Harvesting ke liye 14-16% moisture; storage ke liye 12%' },
      storage: { en: 'Rat-proof, dry godown. Avoid direct floor contact', hi: 'चूहा-मुक्त, सूखा गोदाम। फर्श पर सीधे रखने से बचें', hn: 'Rat-proof, dry godown. Direct floor pe rakhne se bachein' }
    }
  },
  {
    id: 'wheat',
    name: { en: 'Wheat', hi: 'गेहूँ', hn: 'Gehun' },
    season: { en: 'Rabi (Winter)', hi: 'रबी (शीतकालीन)', hn: 'Rabi (Winter)' },
    soil: { en: 'Well-drained Loamy to Clay Loam soils', hi: 'अच्छी जल निकासी वाली दोमट से मटियार दोमट मिट्टी', hn: 'Loamy se Clay Loam mitti' },
    water: { en: 'Medium', hi: 'मध्यम', hn: 'Medium' },
    sowing: {
      time: { en: 'November 15 - December 10', hi: '15 नवंबर - 10 दिसंबर', hn: 'November 15 - December 10' },
      seedRate: { en: '40-45 kg/acre', hi: '40-45 किग्रा/एकड़', hn: '40-45 kg/acre' },
      spacing: { en: '20-22 cm row spacing', hi: '20-22 सेमी पंक्ति की दूरी', hn: '20-22 cm row spacing' }
    },
    fertilizer: {
      npk: { en: '60:24:16 kg/acre', hi: '60:24:16 किग्रा/एकड़', hn: '60:24:16 kg/acre' },
      organic: { en: 'Compost 3-4 tonnes/acre during preparation', hi: 'खेत तैयारी के समय 3-4 टन गोबर खाद/एकड़', hn: 'Khet taiyari ke samay 3-4 tonnes gobar khaad/acre' }
    },
    weed: {
      time: { en: '30-35 days after sowing (critical stage)', hi: 'बुवाई के 30-35 दिन बाद (महत्वपूर्ण चरण)', hn: 'Sowing ke 30-35 days baad' },
      method: { en: 'Sulfosulfuron spray for grassy weeds', hi: 'घासदार खरपतवारों के लिए सल्फोसल्फ्यूरॉन का छिड़काव', hn: 'Sulfosulfuron spray' }
    },
    diseases: [
      {
        name: { en: 'Yellow Rust', hi: 'पीला रतुआ', hn: 'Yellow Rust' },
        symptoms: { en: 'Yellow powder stripes on leaves, low yield', hi: 'पत्तियों पर पीले रंग की पट्टीदार पाउडर, कम पैदावार', hn: 'Pattiyon par yellow powder jaisi dharariyan' },
        remedy: { en: 'Spray Propiconazole 25 EC (Tilt) @ 200 ml/acre', hi: 'प्रोपीकोनाजोल 25 ईसी (Tilt) @ 200 मिली/एकड़ का छिड़काव', hn: 'Spray Propiconazole 25 EC (Tilt) @ 200 ml/acre' }
      },
      {
        name: { en: 'Loose Smut', hi: 'कंडुआ रोग (Loose Smut)', hn: 'Loose Smut' },
        symptoms: { en: 'Black powder replacing wheat earheads', hi: 'काले पाउडर का बालियों में बदल जाना', hn: 'Black powder jaisa earheads me' },
        remedy: { en: 'Seed treatment with Vitavax (2.5 g/kg seed)', hi: 'बुवाई से पहले विटावैक्स (2.5 ग्राम/किग्रा बीज) से उपचार', hn: 'Seed treatment Vitavax (2.5 g/kg seed) se' }
      }
    ],
    harvesting: {
      signs: { en: 'Straw turns golden and dry, grain metallic bite sound', hi: 'पुआल सुनहरा और सूखा, दांत से चबाने पर धात्विक आवाज', hn: 'Straw golden aur dry, dane chabane pe metallic sound' },
      moisture: { en: '12-14% for harvesting; under 10% for storage', hi: 'कटाई के लिए 12-14% नमी; भंडारण के लिए 10% से कम', hn: 'Harvesting ke liye 12-14% moisture; storage ke liye <10%' },
      storage: { en: 'Dry steel bins, use dried neem leaves as preservative', hi: 'सूखे लोहे के ड्रम, संरक्षण के लिए सूखी नीम की पत्तियों का प्रयोग', hn: 'Sookhe lohe ke drum, preservation ke liye neem leaf' }
    }
  },
  {
    id: 'maize',
    name: { en: 'Maize', hi: 'मक्का', hn: 'Makka' },
    season: { en: 'Kharif / Rabi', hi: 'खरीफ / रबी', hn: 'Kharif / Rabi' },
    soil: { en: 'Sandy Loam to Clay Loam, rich in organic matter', hi: 'बलुई दोमट से मटियार दोमट, जीवांश प्रचुर मिट्टी', hn: 'Sandy Loam se Clay Loam' },
    water: { en: 'Medium', hi: 'मध्यम', hn: 'Medium' },
    sowing: {
      time: { en: 'June-July (Kharif) / Oct-Nov (Rabi)', hi: 'जून-जुलाई (खरीफ) / अक्टूबर-नवंबर (रबी)', hn: 'June-July (Kharif) / Oct-Nov (Rabi)' },
      seedRate: { en: '8-10 kg/acre', hi: '8-10 किग्रा/एकड़', hn: '8-10 kg/acre' },
      spacing: { en: '60 cm x 20 cm', hi: '60 सेमी x 20 सेमी', hn: '60 cm x 20 cm' }
    },
    fertilizer: {
      npk: { en: '50:20:15 kg/acre', hi: '50:20:15 किग्रा/एकड़', hn: '50:20:15 kg/acre' },
      organic: { en: 'Compost 4 tonnes/acre', hi: 'गोबर की खाद 4 टन/एकड़', hn: 'Gobar ki khaad 4 tonnes/acre' }
    },
    weed: {
      time: { en: '20-30 days after sowing', hi: 'बुवाई के 20-30 दिन बाद', hn: 'Sowing ke 20-30 days baad' },
      method: { en: 'Atrazine herbicide spray pre-emergence', hi: 'उगने से पहले एट्राजीन शाकनाशी का छिड़काव', hn: 'Atrazine herbicide spray' }
    },
    diseases: [
      {
        name: { en: 'Maydis Leaf Blight', hi: 'पत्ती झुलसा रोग', hn: 'Maydis Leaf Blight' },
        symptoms: { en: 'Elongated greyish-green or brown spots on leaves', hi: 'पत्तियों पर लंबे भूरे या हरे धब्बे', hn: 'Pattiyon par lambe bhoore spots' },
        remedy: { en: 'Spray Mancozeb @ 2g/liter of water', hi: 'मैनकोजेब @ 2 ग्राम/लीटर पानी का छिड़काव', hn: 'Spray Mancozeb @ 2g/liter water' }
      }
    ],
    harvesting: {
      signs: { en: 'Husk turns dry and white, grains become hard', hi: 'छिलका सूखा और सफेद हो जाता है, दाने सख्त होते हैं', hn: 'Husk white aur dry ho jaye, dane hard' },
      moisture: { en: '20% moisture for harvest; dry to 12% for storage', hi: 'कटाई के लिए 20% नमी; भंडारण के लिए 12% तक सुखाएं', hn: 'Harvesting pe 20% moisture; storage ke liye 12% dry' },
      storage: { en: 'Store in dry cribs or well-ventilated bins', hi: 'सूखे कूपों या हवादार ड्रमों में रखें', hn: 'Ventilated bins ya dry place pe rakhein' }
    }
  },
  {
    id: 'mustard',
    name: { en: 'Mustard', hi: 'सरसों', hn: 'Sarso' },
    season: { en: 'Rabi (Winter)', hi: 'रबी (शीतकालीन)', hn: 'Rabi (Winter)' },
    soil: { en: 'Sandy Loam to Loamy soils', hi: 'बलुई दोमट से दोमट मिट्टी', hn: 'Sandy Loam se Loamy' },
    water: { en: 'Low', hi: 'कम', hn: 'Low' },
    sowing: {
      time: { en: 'October 1 - October 25', hi: '1 अक्टूबर - 25 अक्टूबर', hn: 'October 1 - October 25' },
      seedRate: { en: '2-2.5 kg/acre', hi: '2-2.5 किग्रा/एकड़', hn: '2-2.5 kg/acre' },
      spacing: { en: '30 cm x 10 cm', hi: '30 सेमी x 10 सेमी', hn: '30 cm x 10 cm' }
    },
    fertilizer: {
      npk: { en: '30:15:15 kg/acre + Sulphur', hi: '30:15:15 किग्रा/एकड़ + सल्फर आवश्यक', hn: '30:15:15 kg/acre + Sulphur' },
      organic: { en: '2-3 tonnes compost/acre', hi: '2-3 टन गोबर खाद/एकड़', hn: '2-3 tonnes compost/acre' }
    },
    weed: {
      time: { en: '20-25 days after sowing', hi: 'बुवाई के 20-25 दिन बाद', hn: 'Sowing ke 20-25 days baad' },
      method: { en: 'Hand weeding or thinning', hi: 'हाथ से निराई और थिनिंग (घने पौधों को हटाना)', hn: 'Hand weeding aur thinning' }
    },
    diseases: [
      {
        name: { en: 'Mustard Aphids', hi: 'माहू (लाही) कीट', hn: 'Mustard Aphids' },
        symptoms: { en: 'Insects cluster on flowers, sticky leaves, stunted growth', hi: 'फूलों पर हरे-काले कीड़े जमा होना, पत्तियां चिपचिपी', hn: 'Insects cluster on flowers, sticky leaf' },
        remedy: { en: 'Spray Dimethoate 30 EC @ 1.5 ml/liter or Neem oil', hi: 'डाइमेथोएट 30 ईसी @ 1.5 मिली/लीटर या नीम तेल का छिड़काव', hn: 'Spray Dimethoate 30 EC @ 1.5 ml/liter or Neem oil' }
      }
    ],
    harvesting: {
      signs: { en: 'Pods (siliquae) turn yellowish-paper color, seeds dry', hi: 'फलियां पीली पड़ जाती हैं, दाने सूख जाते हैं', hn: 'Pods yellow paper color ho jaye, seeds dry' },
      moisture: { en: '8% moisture is crucial for storage to avoid rancidity', hi: 'सड़न से बचने के लिए भंडारण के लिए 8% नमी अत्यंत आवश्यक', hn: 'Storage ke liye 8% moisture jaruri hai' },
      storage: { en: 'Keep in moisture-proof gunny bags in cool godown', hi: 'नमी-मुक्त जूट के बोरों में ठंडे गोदाम में रखें', hn: 'Moisture-proof gunny bags in cool place' }
    }
  },
  {
    id: 'chickpea',
    name: { en: 'Gram (Chickpea)', hi: 'चना', hn: 'Chana' },
    season: { en: 'Rabi (Winter)', hi: 'रबी (शीतकालीन)', hn: 'Rabi' },
    soil: { en: 'Medium to heavy soils, well-drained', hi: 'मध्यम से भारी मिट्टी, अच्छी जल निकासी', hn: 'Medium to heavy soils' },
    water: { en: 'Low', hi: 'कम', hn: 'Low' },
    sowing: {
      time: { en: 'October 15 - November 15', hi: '15 अक्टूबर - 15 नवंबर', hn: 'October 15 - November 15' },
      seedRate: { en: '30-35 kg/acre', hi: '30-35 किग्रा/एकड़', hn: '30-35 kg/acre' },
      spacing: { en: '30 cm x 10 cm', hi: '30 सेमी x 10 सेमी', hn: '30 cm x 10 cm' }
    },
    fertilizer: {
      npk: { en: '10:20:10 kg/acre', hi: '10:20:10 किग्रा/एकड़ (कम नाइट्रोजन आवश्यकता)', hn: '10:20:10 kg/acre' },
      organic: { en: 'Apply bio-fertilizer Rhizobium culture', hi: 'राइजोबियम कल्चर जैविक जैव उर्वरक का प्रयोग करें', hn: 'Rhizobium culture bio-fertilizer apply' }
    },
    weed: {
      time: { en: '25-30 days after sowing', hi: 'बुवाई के 25-30 दिन बाद', hn: 'Sowing ke 25-30 days baad' },
      method: { en: 'Hand weeding or Pendimethalin pre-emergence', hi: 'हाथ से निराई या पेंडीमेथालिन उगने से पहले छिड़काव', hn: 'Hand weeding ya Pendimethalin spray' }
    },
    diseases: [
      {
        name: { en: 'Fusarium Wilt', hi: 'उकठा (विल्ट) रोग', hn: 'Fusarium Wilt' },
        symptoms: { en: 'Plants turn yellow, droop, and dry up in patches', hi: 'पौधे पीले पड़ जाते हैं, मुरझाते हैं और सूख जाते हैं', hn: 'Plants yellow ho kar patches me sookhne lagte hain' },
        remedy: { en: 'Treat seed with Trichoderma viride (4g/kg seed)', hi: 'ट्राइकोडर्मा विरिडी (4 ग्राम/किग्रा बीज) से बीज उपचार', hn: 'Seed treatment Trichoderma viride se' }
      }
    ],
    harvesting: {
      signs: { en: 'Leaves turn reddish-brown and shed, pods rattle', hi: 'पत्तियां लाल-भूरे रंग की होकर गिरने लगती हैं, फलियों में खड़खड़ाहट', hn: 'Leaves red-brown ho kar girti hain, pods sound rattle' },
      moisture: { en: '9-10% moisture level for safe storage', hi: 'सुरक्षित भंडारण के लिए 9-10% नमी स्तर', hn: 'Safe storage ke liye 9-10% moisture' },
      storage: { en: 'Dry completely in sun, store in clean bins', hi: 'धूप में अच्छी तरह सुखाकर साफ ड्रमों में स्टोर करें', hn: 'Sun dry fully, store in clean bins' }
    }
  },
  {
    id: 'lentil',
    name: { en: 'Lentil', hi: 'मसूर', hn: 'Masoor' },
    season: { en: 'Rabi', hi: 'रबी', hn: 'Rabi' },
    soil: { en: 'Loamy to clay loam soils', hi: 'दोमट से मटियार दोमट मिट्टी', hn: 'Loamy to clay loam' },
    water: { en: 'Low', hi: 'कम', hn: 'Low' },
    sowing: {
      time: { en: 'October 20 - November 15', hi: '20 अक्टूबर - 15 नवंबर', hn: 'October 20 - November 15' },
      seedRate: { en: '12-15 kg/acre', hi: '12-15 किग्रा/एकड़', hn: '12-15 kg/acre' },
      spacing: { en: '22 cm row spacing', hi: '22 सेमी पंक्ति की दूरी', hn: '22 cm row spacing' }
    },
    fertilizer: {
      npk: { en: '10:20:10 kg/acre', hi: '10:20:10 किग्रा/एकड़', hn: '10:20:10 kg/acre' },
      organic: { en: 'Use FYM 2 tonnes/acre', hi: 'गोबर की खाद 2 टन/एकड़ का प्रयोग करें', hn: 'Use FYM 2 tonnes/acre' }
    },
    weed: {
      time: { en: '30 days after sowing', hi: 'बुवाई के 30 दिन बाद', hn: 'Sowing ke 30 days baad' },
      method: { en: 'Manual weeding', hi: 'हाथ से निराई', hn: 'Manual weeding' }
    },
    diseases: [
      {
        name: { en: 'Rust', hi: 'रतुआ रोग (Rust)', hn: 'Rust' },
        symptoms: { en: 'Brown pustules on leaves and stems', hi: 'पत्तियों और तनों पर भूरे रंग के छाले (धब्बे)', hn: 'Brown spots on leaves and stems' },
        remedy: { en: 'Spray Mancozeb @ 2.5 g/liter of water', hi: 'मैनकोजेब @ 2.5 ग्राम/लीटर पानी का छिड़काव करें', hn: 'Spray Mancozeb @ 2.5 g/liter water' }
      }
    ],
    harvesting: {
      signs: { en: 'Pods dry up and turn brown', hi: 'फलियां सूख जाती हैं और भूरे रंग की हो जाती हैं', hn: 'Pods dry ho kar brown ho jaye' },
      moisture: { en: '10-12% moisture for storage', hi: 'भंडारण के लिए 10-12% नमी', hn: '10-12% moisture for storage' },
      storage: { en: 'Airtight storage containers to prevent pulse beetle', hi: 'दाल घुन (beetle) से बचाने के लिए वायुरोधी कंटेनर में रखें', hn: 'Airtight container to prevent pulse beetle' }
    }
  },
  {
    id: 'pigeonpea',
    name: { en: 'Pigeon Pea (Arhar)', hi: 'अरहर (तूर)', hn: 'Arhar' },
    season: { en: 'Kharif (Long duration)', hi: 'खरीफ (लंबी अवधि)', hn: 'Kharif' },
    soil: { en: 'Deep, well-drained loamy soils', hi: 'गहरी, अच्छी जल निकासी वाली दोमट मिट्टी', hn: 'Well-drained loamy' },
    water: { en: 'Medium-Low', hi: 'मध्यम से कम', hn: 'Medium-Low' },
    sowing: {
      time: { en: 'June 15 - July 15', hi: '15 जून - 15 जुलाई', hn: 'June 15 - July 15' },
      seedRate: { en: '6-8 kg/acre', hi: '6-8 किग्रा/एकड़', hn: '6-8 kg/acre' },
      spacing: { en: '60 cm x 20 cm', hi: '60 सेमी x 20 सेमी', hn: '60 cm x 20 cm' }
    },
    fertilizer: {
      npk: { en: '10:20:10 kg/acre', hi: '10:20:10 किग्रा/एकड़', hn: '10:20:10 kg/acre' },
      organic: { en: 'Rhizobium and PSB inoculation', hi: 'राइजोबियम और पीएसबी संवर्धन (उपचार)', hn: 'Rhizobium and PSB inoculation' }
    },
    weed: {
      time: { en: '25-30 days and 50-60 days (slow early growth)', hi: '25-30 दिन और 50-60 दिन (प्रारंभिक विकास धीमा होता है)', hn: '25-30 days and 50-60 days' },
      method: { en: 'Hand weeding or hoeing', hi: 'हाथ से निराई या कुदाल चलाना', hn: 'Hand weeding or hoeing' }
    },
    diseases: [
      {
        name: { en: 'Phytophthora Blight', hi: 'फाइटोफ्थोरा झुलसा', hn: 'Phytophthora Blight' },
        symptoms: { en: 'Brown spots on leaves, stem girdling, plant death', hi: 'पत्तियों पर भूरे धब्बे, तना सड़ना, पौधे की मौत', hn: 'Brown spots on leaves, stem girdling' },
        remedy: { en: 'Spray Metalaxyl + Mancozeb (Ridomil) @ 2g/L', hi: 'मेटालैक्सिल + मैनकोजेब (रिडोमिल) @ 2 ग्राम/लीटर छिड़काव', hn: 'Spray Metalaxyl + Mancozeb (Ridomil) @ 2g/L' }
      }
    ],
    harvesting: {
      signs: { en: '80% of pods turn brown and dry', hi: '80% फलियां भूरी और सूखी हो जाती हैं', hn: '80% pods dry aur brown ho jaye' },
      moisture: { en: '10% moisture level for storage', hi: 'भंडारण के लिए 10% नमी स्तर', hn: '10% moisture level for storage' },
      storage: { en: 'Sun dry pods before threshing, store in clean gunny bags', hi: 'मड़ाई से पहले फलियों को सुखाएं, साफ बोरों में रखें', hn: 'Sun dry pods, store in gunny bags' }
    }
  },
  {
    id: 'moong',
    name: { en: 'Moong Bean', hi: 'मूंग', hn: 'Moong' },
    season: { en: 'Summer / Zaid', hi: 'जायद (गर्मी) / खरीफ', hn: 'Zaid / Kharif' },
    soil: { en: 'Well-drained sandy loam to loam', hi: 'अच्छी जल निकासी वाली बलुई दोमट से दोमट मिट्टी', hn: 'Sandy loam to loam' },
    water: { en: 'Low', hi: 'कम', hn: 'Low' },
    sowing: {
      time: { en: 'March 15 - April 15 (Summer)', hi: '15 मार्च - 15 अप्रैल (जायद/गर्मी)', hn: 'March 15 - April 15' },
      seedRate: { en: '8-10 kg/acre', hi: '8-10 किग्रा/एकड़', hn: '8-10 kg/acre' },
      spacing: { en: '30 cm x 10 cm', hi: '30 सेमी x 10 सेमी', hn: '30 cm x 10 cm' }
    },
    fertilizer: {
      npk: { en: '8:16:8 kg/acre', hi: '8:16:8 किग्रा/एकड़', hn: '8:16:8 kg/acre' },
      organic: { en: 'FYM 2 tonnes/acre during preparation', hi: 'तैयारी के दौरान गोबर खाद 2 टन/एकड़', hn: 'FYM 2 tonnes/acre' }
    },
    weed: {
      time: { en: '20 days after sowing', hi: 'बुवाई के 20 दिन बाद', hn: 'Sowing ke 20 days baad' },
      method: { en: 'One manual weeding', hi: 'एक बार हाथ से निराई', hn: 'One manual weeding' }
    },
    diseases: [
      {
        name: { en: 'Yellow Mosaic Virus', hi: 'पीला मोजेक वायरस', hn: 'Yellow Mosaic Virus' },
        symptoms: { en: 'Yellow patches on leaves, spread by whitefly', hi: 'पत्तियों पर पीले धब्बे, सफेद मक्खी द्वारा फैलता है', hn: 'Yellow patches on leaves, spread by whitefly' },
        remedy: { en: 'Spray Imidacloprid @ 0.5 ml/liter to control whitefly', hi: 'सफेद मक्खी नियंत्रण के लिए इमिडाक्लोप्रिड @ 0.5 मिली/लीटर छिड़काव', hn: 'Spray Imidacloprid @ 0.5 ml/liter' }
      }
    ],
    harvesting: {
      signs: { en: '85% pods turn dark brown or black', hi: '85% फलियां गहरे भूरे या काले रंग की हो जाती हैं', hn: '85% pods dark brown or black ho jaye' },
      moisture: { en: '9-10% moisture for storage', hi: 'भंडारण के लिए 9-10% नमी', hn: '9-10% moisture for storage' },
      storage: { en: 'Store in airtight tins or polythene-lined sacks', hi: 'हवा बंद डिब्बों या पॉलीथीन-लाइन वाले बोरों में रखें', hn: 'Airtight tins ya polythene-lined sacks' }
    }
  },
  {
    id: 'potato',
    name: { en: 'Potato', hi: 'आलू', hn: 'Aloo' },
    season: { en: 'Rabi (Winter)', hi: 'रबी (शीतकालीन)', hn: 'Rabi' },
    soil: { en: 'Loose, well-aerated sandy loam', hi: 'भुरभुरी, अच्छी हवादार बलुई दोमट मिट्टी', hn: 'Loose, sandy loam' },
    water: { en: 'Medium-High', hi: 'मध्यम से अधिक', hn: 'Medium-High' },
    sowing: {
      time: { en: 'October 15 - November 10', hi: '15 अक्टूबर - 10 नवंबर', hn: 'October 15 - November 10' },
      seedRate: { en: '800-1000 kg tubers/acre', hi: '800-1000 किग्रा कंद/एकड़', hn: '800-1000 kg tubers/acre' },
      spacing: { en: '60 cm x 20 cm (ridges)', hi: '60 सेमी x 20 सेमी (मेड़)', hn: '60 cm x 20 cm' }
    },
    fertilizer: {
      npk: { en: '60:40:40 kg/acre', hi: '60:40:40 किग्रा/एकड़ (पोटैशियम अत्यधिक आवश्यक)', hn: '60:40:40 kg/acre' },
      organic: { en: 'Compost 10 tonnes/acre (highly nutrient demanding)', hi: 'गोबर की खाद 10 टन/एकड़ (पोषक तत्वों की उच्च मांग)', hn: 'Compost 10 tonnes/acre' }
    },
    weed: {
      time: { en: '30-35 days (during earthing up)', hi: '30-35 दिन (मिट्टी चढ़ाने के दौरान)', hn: '30-35 days (earthing up ke samay)' },
      method: { en: 'Weeding followed by dynamic earthing up (mitti chadhana)', hi: 'निराई के बाद पौधों की जड़ों पर मिट्टी चढ़ाना', hn: 'Weeding and earthing up (miti chadhana)' }
    },
    diseases: [
      {
        name: { en: 'Late Blight', hi: 'पछैती झुलसा रोग', hn: 'Late Blight' },
        symptoms: { en: 'Water-soaked spots on leaf tips, white cottony mold underneath', hi: 'पत्तियों पर पानी जैसे धब्बे, नीचे सफेद रूई जैसी फफूंद', hn: 'Water-soaked spots on leaves, white mold underneath' },
        remedy: { en: 'Spray Metalaxyl + Mancozeb (2.5 g/L) immediately', hi: 'मेटालैक्सिल + मैनकोजेब (2.5 ग्राम/लीटर) तुरंत छिड़काव करें', hn: 'Spray Metalaxyl + Mancozeb (2.5 g/L) immediately' }
      }
    ],
    harvesting: {
      signs: { en: 'Haulms (vines) turn yellow and dry up, skin becomes firm', hi: 'बेलें पीली और सूखी हो जाती हैं, आलू की त्वचा सख्त हो जाती है', hn: 'Vines yellow aur dry ho jaye, skin firm' },
      moisture: { en: 'Cure at 15°C for 10 days for skin hardening', hi: 'त्वचा सख्त करने के लिए 10 दिनों तक 15°C पर सुखाएं (क्यूरिंग)', hn: 'Cure for 10 days' },
      storage: { en: 'Cold storage at 3-4°C with 90% humidity', hi: '3-4°C और 90% आर्द्रता वाले कोल्ड स्टोरेज में रखें', hn: 'Cold storage at 3-4°C' }
    }
  },
  {
    id: 'tomato',
    name: { en: 'Tomato', hi: 'टमाटर', hn: 'Tamatar' },
    season: { en: 'Spring / Autumn', hi: 'बसंत / शरदकालीन', hn: 'Spring / Autumn' },
    soil: { en: 'Silt loam to clay loam, well-drained', hi: 'अच्छी जल निकासी वाली दोमट मिट्टी', hn: 'Silt loam to clay loam' },
    water: { en: 'Medium', hi: 'मध्यम', hn: 'Medium' },
    sowing: {
      time: { en: 'Nursery in Oct-Nov / Jan-Feb', hi: 'नर्सरी: अक्टूबर-नवंबर / जनवरी-फरवरी', hn: 'Nursery in Oct-Nov / Jan-Feb' },
      seedRate: { en: '150-200 grams/acre', hi: '150-200 ग्राम/एकड़', hn: '150-200 grams/acre' },
      spacing: { en: '60 cm x 45 cm', hi: '60 सेमी x 45 सेमी', hn: '60 cm x 45 cm' }
    },
    fertilizer: {
      npk: { en: '40:40:30 kg/acre + Boron', hi: '40:40:30 किग्रा/एकड़ + बोरॉन सूक्ष्म पोषक', hn: '40:40:30 kg/acre + Boron' },
      organic: { en: 'Compost 5 tonnes/acre', hi: 'गोबर की खाद 5 टन/एकड़', hn: 'Compost 5 tonnes/acre' }
    },
    weed: {
      time: { en: '20 days and 40 days (staking required)', hi: '20 दिन और 40 दिन (सहारे/लाठी की आवश्यकता)', hn: '20 days and 40 days' },
      method: { en: 'Manual weeding and staking (support with bamboo sticks)', hi: 'निराई और बांस के डंडों से पौधों को सहारा देना', hn: 'Manual weeding and staking' }
    },
    diseases: [
      {
        name: { en: 'Damping Off (Nursery)', hi: 'आर्द्र पतन (डैम्पिंग ऑफ)', hn: 'Damping Off' },
        symptoms: { en: 'Seedling stems collapse at ground level and die', hi: 'नर्सरी में पौधे जमीन के पास से गलकर गिर जाते हैं', hn: 'Seedling stems collapse at ground level' },
        remedy: { en: 'Drench soil with Captan or Carbendazim (2g/L)', hi: 'कैप्टान या कार्बेंडाजिम (2 ग्राम/लीटर) से मिट्टी का उपचार', hn: 'Drench soil with Captan or Carbendazim (2g/L)' }
      }
    ],
    harvesting: {
      signs: { en: 'Fruit color changes from green to pink or red', hi: 'फलों का रंग हरे से बदलकर गुलाबी या लाल होना', hn: 'Fruit color changes green to pink/red' },
      moisture: { en: 'Regular picking every 3-4 days', hi: 'हर 3-4 दिन में नियमित तुड़ाई', hn: 'Regular picking every 3-4 days' },
      storage: { en: 'Store ripe tomatoes at 10-12°C, green ones at 15°C', hi: 'पके टमाटरों को 10-12°C पर रखें, हरे टमाटरों को 15°C पर', hn: 'Ripe tomatoes at 10-12°C' }
    }
  },
  {
    id: 'onion',
    name: { en: 'Onion', hi: 'प्याज', hn: 'Pyaz' },
    season: { en: 'Rabi / Late Kharif', hi: 'रबी / उत्तर खरीफ', hn: 'Rabi' },
    soil: { en: 'Sandy loam to clay loam rich in organic matter', hi: 'जीवांश से भरपूर बलुई दोमट मिट्टी', hn: 'Sandy loam to clay loam' },
    water: { en: 'Medium', hi: 'मध्यम', hn: 'Medium' },
    sowing: {
      time: { en: 'Transplanting in Dec-Jan (Nursery: Oct-Nov)', hi: 'रोपाई: दिसंबर-जनवरी (नर्सरी: अक्टूबर-नवंबर)', hn: 'Transplanting Dec-Jan' },
      seedRate: { en: '3-4 kg/acre', hi: '3-4 किग्रा/एकड़', hn: '3-4 kg/acre' },
      spacing: { en: '15 cm x 10 cm', hi: '15 सेमी x 10 सेमी', hn: '15 cm x 10 cm' }
    },
    fertilizer: {
      npk: { en: '40:20:30 kg/acre + Sulphur', hi: '40:20:30 किग्रा/एकड़ + गंधक (सल्फर) अनिवार्य', hn: '40:20:30 kg/acre + Sulphur' },
      organic: { en: 'Compost 6 tonnes/acre', hi: 'गोबर की खाद 6 टन/एकड़', hn: 'Compost 6 tonnes/acre' }
    },
    weed: {
      time: { en: '30 days and 60 days after transplanting', hi: 'रोपाई के 30 और 60 दिन बाद', hn: '30 and 60 days after transplanting' },
      method: { en: 'Manual weeding (onion roots are shallow)', hi: 'हाथ से निराई (प्याज की जड़ें उथली होती हैं)', hn: 'Manual weeding' }
    },
    diseases: [
      {
        name: { en: 'Purple Blotch', hi: 'बैंगनी धब्बा रोग (Purple Blotch)', hn: 'Purple Blotch' },
        symptoms: { en: 'Purple spots on leaves, tips dry up', hi: 'पत्तियों पर बैंगनी रंग के धब्बे, सिरे सूखना', hn: 'Purple spots on leaves, tips dry' },
        remedy: { en: 'Spray Mancozeb @ 2.5 g/L or Copper Oxychloride @ 3 g/L', hi: 'मैनकोजेब @ 2.5 ग्राम/लीटर या कॉपर ऑक्सीक्लोराइड का छिड़काव', hn: 'Spray Mancozeb @ 2.5 g/L' }
      }
    ],
    harvesting: {
      signs: { en: '50-70% neck fall (bulbs mature and tops fall over)', hi: '50-70% गर्दन का गिरना (पत्तियां मुड़कर जमीन पर गिरना)', hn: '50-70% neck fall' },
      moisture: { en: 'Cure in shade for 3-4 days to dry outer skins', hi: 'बाहरी त्वचा सुखाने के लिए छाए में 3-4 दिन रखें (क्यूरिंग)', hn: 'Cure in shade for 3-4 days' },
      storage: { en: 'Well-ventilated bamboo racks (para) in dry environment', hi: 'हवादार बांस के मचानों (पारा) में शुष्क वातावरण में रखें', hn: 'Ventilated bamboo racks' }
    }
  },
  {
    id: 'cauliflower',
    name: { en: 'Cauliflower', hi: 'फूलगोभी', hn: 'Phool Gobhi' },
    season: { en: 'Rabi (Winter vegetable)', hi: 'रबी (शीतकालीन सब्जी)', hn: 'Rabi' },
    soil: { en: 'Rich loamy soils with good drainage', hi: 'अच्छी जल निकासी वाली उपजाऊ दोमट मिट्टी', hn: 'Rich loamy soils' },
    water: { en: 'Medium-High', hi: 'मध्यम से अधिक', hn: 'Medium-High' },
    sowing: {
      time: { en: 'Nursery in Sept-Oct; transplanting in Oct-Nov', hi: 'नर्सरी: सितंबर-अक्टूबर; रोपाई: अक्टूबर-नवंबर', hn: 'Transplanting Oct-Nov' },
      seedRate: { en: '250 grams/acre', hi: '250 ग्राम/एकड़', hn: '250 grams/acre' },
      spacing: { en: '45 cm x 45 cm', hi: '45 सेमी x 45 सेमी', hn: '45 cm x 45 cm' }
    },
    fertilizer: {
      npk: { en: '50:30:40 kg/acre + Boron', hi: '50:30:40 किग्रा/एकड़ + सुहागा (बोरॉन) आवश्यक', hn: '50:30:40 kg/acre + Boron' },
      organic: { en: 'Compost 5 tonnes/acre', hi: 'गोबर की खाद 5 टन/एकड़', hn: 'Compost 5 tonnes/acre' }
    },
    weed: {
      time: { en: '25-30 days after transplanting', hi: 'रोपाई के 25-30 दिन बाद', hn: '25-30 days after transplanting' },
      method: { en: 'Manual hoeing and earthing up', hi: 'कुदाल से निराई और पौधों की जड़ों पर थोड़ी मिट्टी चढ़ाना', hn: 'Manual hoeing and earthing up' }
    },
    diseases: [
      {
        name: { en: 'Browning (Boron deficiency)', hi: 'ब्राउनिंग (बोरॉन की कमी)', hn: 'Browning' },
        symptoms: { en: 'Curd turns brown, hollow stem with bitter taste', hi: 'गोभी का फूल भूरा पड़ना, तना खोखला होना', hn: 'Curd turns brown, hollow stem' },
        remedy: { en: 'Apply Borax (5-10 kg/acre) in soil or foliar Boron spray', hi: 'मिट्टी में बोरेक्स (5-10kg/एकड़) या पत्तों पर बोरॉन का छिड़काव', hn: 'Apply Borax or Boron spray' }
      }
    ],
    harvesting: {
      signs: { en: 'Curd is fully developed, compact, and snowy white', hi: 'गोभी का फूल पूरी तरह विकसित, ठोस और चमकदार सफेद हो', hn: 'Curd compact and white' },
      moisture: { en: 'Harvest during cool morning hours', hi: 'सुबह के ठंडे समय में कटाई करें', hn: 'Harvest in cool morning' },
      storage: { en: 'Store in cool, shaded room; wrap in leaves', hi: 'ठंडे छायादार कमरे में रखें; पत्तों में लपेटें', hn: 'Cool shaded place, wrap in leaves' }
    }
  },
  {
    id: 'brinjal',
    name: { en: 'Brinjal', hi: 'बैंगन', hn: 'Baingan' },
    season: { en: 'Spring / Summer / Autumn', hi: 'वर्ष भर (बसंत/गर्मी/शरदकालीन)', hn: 'Spring / Summer / Autumn' },
    soil: { en: 'Silt loam to clay loam soils', hi: 'सिल्ट दोमट से मटियार दोमट मिट्टी', hn: 'Silt loam to clay loam' },
    water: { en: 'Medium', hi: 'मध्यम', hn: 'Medium' },
    sowing: {
      time: { en: 'Nursery prepared 5-6 weeks before transplanting', hi: 'रोपाई से 5-6 सप्ताह पहले नर्सरी तैयार करें', hn: 'Nursery 5-6 weeks before transplant' },
      seedRate: { en: '150-200 grams/acre', hi: '150-200 ग्राम/एकड़', hn: '150-200 grams/acre' },
      spacing: { en: '60 cm x 60 cm', hi: '60 सेमी x 60 सेमी', hn: '60 cm x 60 cm' }
    },
    fertilizer: {
      npk: { en: '40:30:20 kg/acre', hi: '40:30:20 किग्रा/एकड़', hn: '40:30:20 kg/acre' },
      organic: { en: 'Compost 4 tonnes/acre', hi: 'गोबर की खाद 4 टन/एकड़', hn: 'Compost 4 tonnes/acre' }
    },
    weed: {
      time: { en: '25-30 days and 50 days', hi: '25-30 दिन और 50 दिन', hn: '25-30 days and 50 days' },
      method: { en: 'Hoeing and manual weeding', hi: 'हाथ से निराई और गुड़ाई', hn: 'Hoeing and manual weeding' }
    },
    diseases: [
      {
        name: { en: 'Fruit & Shoot Borer', hi: 'फल और तना छेदक कीट', hn: 'Fruit & Shoot Borer' },
        symptoms: { en: 'Wilted shoots, holes in fruits with excreta inside', hi: 'मुरझाई हुई कोपले, फल में छेद और अंदर कचरा', hn: 'Wilted shoots, holes in fruits' },
        remedy: { en: 'Spray Spinosad 45 SC @ 0.5 ml/L or Emamectin Benzoate', hi: 'स्पिनोसाद 45 एससी @ 0.5 मिली/लीटर या इमामेक्टिन बेंजोएट छिड़काव', hn: 'Spray Spinosad 45 SC or Emamectin Benzoate' }
      }
    ],
    harvesting: {
      signs: { en: 'Fruits are glossy, tender, seeds are soft', hi: 'फल चमकदार, मुलायम और बीज कोमल हों', hn: 'Fruits glossy, tender, seeds soft' },
      moisture: { en: 'Harvest with stalks intact to extend shelf life', hi: 'शेल्फ लाइफ बढ़ाने के लिए डंठल के साथ तोड़ें', hn: 'Harvest with stalks' },
      storage: { en: 'Keep in ventilated crates, store at 10-12°C', hi: 'हवादार बक्सों में रखें, 10-12°C पर संग्रहित करें', hn: 'Ventilated crates, 10-12°C' }
    }
  },
  {
    id: 'sugarcane',
    name: { en: 'Sugarcane', hi: 'गन्ना', hn: 'Ganna' },
    season: { en: 'Annual (Planted in Autumn/Spring)', hi: 'वार्षिक (शरदकालीन/बसंतकालीन रोपण)', hn: 'Annual' },
    soil: { en: 'Deep, rich clayey loam soils', hi: 'गहरी, उपजाऊ मटियार दोमट मिट्टी', hn: 'Deep clayey loam' },
    water: { en: 'High', hi: 'अधिक', hn: 'High' },
    sowing: {
      time: { en: 'Feb-March (Spring) / Sept-Oct (Autumn)', hi: 'फरवरी-मार्च (बसंत) / सितंबर-अक्टूबर (शरद)', hn: 'Feb-March / Sept-Oct' },
      seedRate: { en: '25,000-30,000 sets/acre (three-budded)', hi: '25,000-30,000 टुकड़े/एकड़ (तीन-आँख वाले)', hn: '25k-30k sets/acre' },
      spacing: { en: '90 cm row-to-row spacing', hi: '90 सेमी पंक्ति-से-पंक्ति की दूरी', hn: '90 cm row-to-row' }
    },
    fertilizer: {
      npk: { en: '100:30:30 kg/acre (high nitrogen required)', hi: '100:30:30 किग्रा/एकड़ (नाइट्रोजन की उच्च आवश्यकता)', hn: '100:30:30 kg/acre' },
      organic: { en: 'FYM 8-10 tonnes/acre or pressmud', hi: 'गोबर की खाद 8-10 टन/एकड़ या प्रेसमड का प्रयोग', hn: 'FYM 8-10 tonnes/acre' }
    },
    weed: {
      time: { en: '30, 60, 90 days after planting', hi: 'रोपण के 30, 60, 90 दिन बाद', hn: '30, 60, 90 days after planting' },
      method: { en: 'Hoeing and earthing up at 120 days to prevent lodging', hi: 'निराई-गुड़ाई और गिरने से बचाने के लिए 120 दिनों में मिट्टी चढ़ाना', hn: 'Hoeing and earthing up' }
    },
    diseases: [
      {
        name: { en: 'Red Rot', hi: 'लाल सड़न रोग (Red Rot)', hn: 'Red Rot' },
        symptoms: { en: 'Internal tissue turns red with white patches, alcoholic smell', hi: 'गन्ने का भीतरी भाग लाल और सफेद धब्बों वाला, अल्कोहल जैसी गंध', hn: 'Internal tissue red, alcoholic smell' },
        remedy: { en: 'Use disease-free sets, treat with Carbendazim (1g/L)', hi: 'रोग-मुक्त टुकड़ों का प्रयोग करें, कार्बेंडाजिम (1g/L) से उपचार', hn: 'Use disease-free sets, treat Carbendazim' }
      }
    ],
    harvesting: {
      signs: { en: 'Leaves dry up, cane stalk metallic sound, brix 18-20%', hi: 'पत्तियां सूखती हैं, थपथपाने पर धातु जैसी ध्वनि, ब्रिक्स 18-20%', hn: 'Leaves dry, brix 18-20%' },
      moisture: { en: 'Stop irrigation 15 days before harvest', hi: 'कटाई से 15 दिन पहले सिंचाई बंद कर दें', hn: 'Stop irrigation 15 days before harvest' },
      storage: { en: 'Crush within 24 hours of harvest to prevent sugar inversion', hi: 'रस खराब होने से बचाने के लिए कटाई के 24 घंटे के भीतर पेराई करें', hn: 'Crush within 24 hours' }
    }
  }
];

const MONTH_CALENDAR = [
  {
    monthEn: 'January',
    monthHi: 'जनवरी',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow summer vegetables nursery (Tomato, Eggplant, Chili) under polyhouse or thatch protection to protect from winter frost.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Apply 4th irrigation to Wheat at jointing stage (60-65 days). Keep potato soil moist but not waterlogged.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Top dress remaining Nitrogen (Urea) in late-sown wheat after irrigation. Spread organic compost on winter vegetable beds.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Monitor Mustard crop for Aphids (Mahu); spray Neem Oil or Dimethoate (1ml/L) if threshold exceeds. Check Potato for Late Blight; spray Mancozeb.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest mature winter Sugarcane. Dig up early potato varieties. Store them in dry, ventilated bins.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'पाले से बचाने के लिए पॉलीहाउस या पुआल की छांव में ग्रीष्मकालीन सब्जियों (टमाटर, बैंगन, मिर्च) की नर्सरी तैयार करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'बुवाई के 60-65 दिन बाद गेहूँ में चौथी सिंचाई (जॉइंटिंग चरण) करें। आलू की क्यारियों में नमी रखें लेकिन जलजमाव न होने दें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'देर से बोए गए गेहूँ में सिंचाई के बाद बची हुई यूरिया (नाइट्रोजन) की टॉप ड्रेसिंग करें। सब्जियों में गोबर की सड़ी खाद डालें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'सरसों में लाही (माहू/चेपा) कीट की निगरानी करें; नीम तेल या डाइमेथोएट (1 मिली/लीटर) का छिड़काव करें। आलू को पछेती झुलसा से बचाने हेतु मैंकोज़ेब डालें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'परिपक्व हो चुके शरदकालीन गन्ने की कटाई करें। अगेती आलू की खुदाई कर छायादार व हवादार स्थान पर भंडारण करें।' }
    ]
  },
  {
    monthEn: 'February',
    monthHi: 'फरवरी',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Prepare fields for spring Sugarcane planting. Sow summer Maize and early Cucurbits (gourds, cucumber) directly.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Irrigate Wheat at flowering stage (80-85 days) to ensure grain fill. Keep mustard fields well irrigated during pod formation.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Apply gypsum to oilseed crops to improve oil content. Mix dry compost and wood ash in vegetable beds to supply potash.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Spray Carbendazim (1g/L) if Alternaria blight appears on Mustard. Dust wood ash to prevent beetle attacks on young gourd vines.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest winter pulses (Peas, Gram) as pods dry. Cut sugarcane crops close to the ground level to promote ratoon crop.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'बसंतकालीन गन्ने की रोपाई हेतु खेत तैयार करें। मक्का और जायद कद्दूवर्गीय सब्जियों (लौकी, खीरा, ककड़ी) की सीधे बुवाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'गेहूँ में फूल आने (बुवाई के 80-85 दिन) पर सिंचाई करें ताकि दानों का भराव अच्छा हो। सरसों में फली बनते समय पर्याप्त नमी सुनिश्चित करें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'तिलहनी फसलों में तेल की मात्रा बढ़ाने के लिए जिप्सम का प्रयोग करें। सब्जियों की जड़ों के पास सड़ी खाद और राख मिलाकर मिट्टी चढ़ाएं।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'सरसों में अल्टरनेरिया झुलसा दिखने पर कार्बेन्डाजिम (1 ग्राम/लीटर) का छिड़काव करें। कद्दूवर्गीय बेलों को लालड़ी कीट (रेड पम्पकिन बीटल) से बचाने हेतु राख छिड़कें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'दलहनी फसलों (मटर, चना) की फलियां सूखने पर कटाई शुरू करें। गन्ने को जमीन की सतह से काटें ताकि पेड़ी फसल (ratoon) अच्छी हो।' }
    ]
  },
  {
    monthEn: 'March',
    monthHi: 'मार्च',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow summer Moong (SML-668) and Urad. Transplant summer tomato, eggplant and chili seedlings to main fields.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Apply 6th/milking stage irrigation in Wheat. Maintain 7-10 days interval for summer vegetable crops as temperature rises.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Incorporate crop residues or apply basal dose of NPK (20:40:20 kg/ha) for summer pulses.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Monitor Moong for Whiteflies (which transmit Yellow Mosaic Virus); spray Imidacloprid. Check pulses for pod borers.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest Mustard (when 75% pods turn golden). Dig out main crop Potatoes. Dry potatoes in shade before cold storage.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'जायद मूंग (SML-668) और उड़द की बुवाई करें। तैयार टमाटर, बैंगन और मिर्च के पौधों की मुख्य खेत में रोपाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'गेहूँ में दुग्धावस्था (milking stage) पर अंतिम सिंचाई करें। तापमान बढ़ने के कारण ग्रीष्मकालीन सब्जियों में 7-10 दिनों के अंतराल पर पानी दें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'जायद दलहन बुवाई के समय बेसल डोज के रूप में नाइट्रोजन, फास्फोरस व पोटाश (20:40:20 किग्रा/हेक्टेयर) का प्रयोग करें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'मूंग में पीला मोजेक वायरस फैलाने वाली सफेद मक्खी की निगरानी करें; इमिडाक्लोप्रिड का छिड़काव करें। फलियों में छेदक कीटों से बचाव करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'सरसों की फसल (75% फलियां पीली होने पर) काटें। मुख्य आलू की फसल की खुदाई पूरी करें और कोल्ड स्टोरेज भेजने से पहले छाया में सुखाएं।' }
    ]
  },
  {
    monthEn: 'April',
    monthHi: 'अप्रैल',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Field cleaning after Rabi harvest. Plant summer vegetables like Okra (Bhindi) and Cowpea (Lobia).' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Irrigate summer pulses and Maize regularly. Prevent drying out of soil around summer vegetables.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Perform deep summer ploughing (using disc plough) to expose soil pathogens and weed seeds to sun heat.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Spray neem-based insecticides (3000 ppm) on okra to control Shoot & Fruit Borer. Keep field bunds clean to avoid rats.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest Wheat crop. Thresh and clean grains carefully. Dry Wheat grains to under 10% moisture before storing in metal bins.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'रबी फसलों की कटाई के बाद खेतों की सफाई करें। भिंडी, लोबिया और ग्वार जैसी गर्मी की फसलों की बुवाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'जायद दलहन (मूंग) और मक्का में नियमित सिंचाई करें। तेज धूप में सब्जियों के पौधों के पास की मिट्टी सूखने न पाए।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'रबी की कटाई के बाद मिट्टी पलट कर गहरी जुताई करें ताकि धूप से कीड़े और खरपतवार नष्ट हो सकें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'भिंडी में फल छेदक की रोकथाम हेतु नीम आधारित कीटनाशक छिड़कें। चूहों को नियंत्रित करने के लिए मेड़ों को साफ रखें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'गेहूँ की कटाई और थ्रेसिंग करें। अनाज को सुखाएं (नमी 10% से कम हो) और फिर कोठियों या टीन के ड्रमों में भंडारित करें।' }
    ]
  },
  {
    monthEn: 'May',
    monthHi: 'मई',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow green manure crops (Dhaincha or Sunnhemp) to enrich soil. Procure certified seeds for Kharif Paddy (Dhan).' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Irrigate Dhaincha for rapid growth. Water summer fruit crops (Mango, Guava) to reduce fruit drop.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Mix farmyard manure (FYM) or pressmud into the soil. Clean compost pits. Soil testing is highly recommended.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Control termites in sandy soils by applying Chlorpyrifos during land preparation. Spray mango trees against mealybugs.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Pick summer Moong pods in multiple cycles. Store pulses with dried neem leaves to prevent storage pests.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'मिट्टी की उर्वरता बढ़ाने के लिए हरी खाद (ढैंचा या सनई) की बुवाई करें। खरीफ धान के उन्नत व प्रमाणित बीजों का प्रबंध करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'ढैंचा की तीव्र वृद्धि हेतु पानी दें। आम और अमरूद के फलने वाले पेड़ों में सिंचाई करें ताकि गर्मी से फल गिरने की समस्या कम हो।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'खेतों में गोबर की सड़ी खाद (FYM) डालें। मिट्टी की जांच (Soil Testing) करवाएं ताकि खरीफ में उर्वरक का सही अनुपात (NPK) तय हो सके।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'रेतीली या दुमट मिट्टी में दीमक नियंत्रण के लिए जुताई के समय क्लोरपायरीफॉस मिलाएं। आम में मीलीबग कीट के नियंत्रण के उपाय करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'जायद मूंग की फलियों की 2-3 बार में तुड़ाई पूरी करें। घुन से बचाने के लिए दालों को सूखी नीम की पत्तियों के साथ ड्रम में रखें।' }
    ]
  },
  {
    monthEn: 'June',
    monthHi: 'जून',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Prepare Paddy nursery beds (1/10th of transplanting area). Sow Paddy seeds (Swarna, Samba Mahsuri, Rajendra Sweta) after seed treatment.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Keep nursery beds moist. If monsoon is delayed, use tube-wells to irrigate young seedlings.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Plough green manure (Dhaincha) back into the soil using a tractor-rotavator when it reaches 45-50 days old.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Protect nursery seedlings from Blast disease; spray Tricyclazole if spots appear on leaves. Remove weeds in nursery.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Complete Moong threshing. Clean threshing floor. Clean grain silos for the upcoming season.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'धान की नर्सरी (बिचड़ा) के लिए बेड तैयार करें। बीज उपचार (Carbendazim 2g/kg) के बाद धान के बीज (स्वर्णा, सांबा महसूरी, राजेंद्र श्वेता) बोएं।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'बिचड़े की क्यारियों में पर्याप्त नमी रखें। यदि मानसून आने में देरी हो, तो नलकूप के पानी से नर्सरी की हल्की सिंचाई करें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'खेत में बोई गई हरी खाद (ढैंचा) को 45-50 दिन की अवस्था में मिट्टी-पलट हल या रोटावेटर की सहायता से खेत की मिट्टी में दबा दें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'धान नर्सरी को झोंका (Blast) रोग से बचाएं; पत्तियों पर भूरे धब्बे दिखने पर ट्राइसाइक्लाजोल का छिड़काव करें। खरपतवार निकालें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'मूंग की थ्रेसिंग का काम पूरा करें। खलिहान साफ रखें। आने वाली मुख्य फसलों के भंडारण हेतु गोदामों का शोधन करें।' }
    ]
  },
  {
    monthEn: 'July',
    monthHi: 'जुलाई',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Main field transplanting of 21-25 day old Paddy seedlings. Sow Kharif Maize, Pigeon Pea (Arhar), and Sesame (Til).' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Maintain 3-5cm standing water in Paddy fields during transplanting and root establishment. Check drainage channels.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Apply Zinc Sulphate (25 kg/ha) and basal NPK dose during puddle preparation. This prevents Khaira disease in Paddy.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Use pre-emergence herbicide like Butachlor or Pretilachlor within 3 days of transplanting to control grasses.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest summer vegetables continuously. Pack and transport fresh produce to Bhabhua/Mohania local mandis.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: '21-25 दिन पुराने धान के पौधों की मुख्य खेत में रोपाई (रोपनी) करें। खरीफ मक्का, अरहर और तिल की बुवाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'रोपाई के समय और जड़ पकड़ने तक धान के खेत में 3-5 सेमी पानी का भराव रखें। जलनिकास की नालियों को साफ रखें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'धान की कदोई (puddling) के समय जिंक सल्फेट (25 किग्रा/हेक्टेयर) और बेसल खाद डालें। यह धान में होने वाले खैरा रोग को रोकता है।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'धान रोपाई के 3 दिनों के भीतर घास नियंत्रण के लिए ब्यूटाक्लोर या प्रीटीलाक्लोर जैसे खरपतवारनाशी का उपयोग करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'ग्रीष्मकालीन सब्जियों की निरंतर तुड़ाई करें। ताजी सब्जियों को पैक कर भभुआ या मोहनिया मंडी में बिक्री हेतु भेजें।' }
    ]
  },
  {
    monthEn: 'August',
    monthHi: 'अगस्त',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Complete any delayed transplanting. Plant seasonal flowers and tree saplings on field bunds (agroforestry).' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Practice Alternate Wetting and Drying (AWD) to save water. Ensure fields do not dry completely during active tillering.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Top dress 1st dose of Urea (Nitrogen) at tillering stage (25-30 days after transplanting). Weed before fertilizer application.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Check for Leaf Folder and Stem Borer. If dead hearts are seen, apply Cartap Hydrochloride 4G granules (25 kg/ha).' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Keep storage area free of pests. Monitor stored wheat/grains for weevils.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'यदि कोई रोपाई बच गई हो तो उसे तुरंत पूरा करें। खेत की मेड़ों पर मिट्टी के कटाव को रोकने के लिए बहुवर्षीय पौधे लगाएं।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'पानी बचाने के लिए अल्टरनेट वेटिंग एंड ड्राइंग (AWD) पद्धति अपनाएं। धान में कल्ले निकलने (tillering) के समय खेत में नमी रखें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'रोपाई के 25-30 दिन बाद (कल्ले फूटते समय) यूरिया की पहली टॉप ड्रेसिंग करें। खाद डालने से पहले खेत से घास (खरपतवार) निकाल लें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'धान में पत्ती लपेटक और तना छेदक कीट की जांच करें। यदि सफेद बालियां या सूखी पत्तियां दिखें, तो कारटाप हाइड्रोक्लोराइड 4जी का प्रयोग करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'पुराने अनाज के भंडार में कीड़ों पर नजर रखें। नमी से बचाने के लिए भंडारगृह को सूखा रखें।' }
    ]
  },
  {
    monthEn: 'September',
    monthHi: 'सितंबर',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow early winter vegetables nursery (Cauliflower, Cabbage, Radish, Carrot). Prepare land for early Mustard.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Maintain standing water (5cm) at panicle initiation stage in Paddy. Crop is highly sensitive to water stress now.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Apply 2nd top dressing of Nitrogen (Urea) in Paddy at panicle initiation stage.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Watch out for Bacterial Leaf Blight (BLB) and False Smut. Spray Streptocycline + Copper Oxychloride for BLB.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest Kharif Maize when cob sheaths turn brown and grains become hard. Dry cobs in sun before sheller.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'अगेती शीतकालीन सब्जियों (फूलगोभी, बंदगोभी, मूली, गाजर) की नर्सरी बोएं। अगेती राई/सरसों की बुवाई हेतु खेत की जुताई शुरू करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'धान में बालियां बनने (panicle initiation) की अवस्था में खेत में 5 सेमी पानी अवश्य रखें। इस समय सूखा पड़ने से पैदावार घट सकती है।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'धान की बालियां निकलने की शुरुआती अवस्था में यूरिया की दूसरी व अंतिम टॉप ड्रेसिंग करें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'धान में जीवाणु जनित पत्ती झुलसा (BLB) और हल्दी रोग (False Smut) का निरीक्षण करें। झुलसा के लिए स्ट्रेप्टोसाइक्लिन का छिड़काव करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'खरीफ मक्का की कटाई तब करें जब भुट्टों का छिलका पीला-भूरा पड़ जाए और दाने कड़े हो जाएं। भुट्टों को धूप में सुखाकर दाने अलग करें।' }
    ]
  },
  {
    monthEn: 'October',
    monthHi: 'अक्टूबर',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow early Wheat, Mustard (Pusa Bold), Chickpea, Lentil, and Potato. Transplant winter Cabbage/Cauliflower.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Drain water from Paddy fields 10-15 days before expected harvesting. Provide light pre-sowing irrigation (palewa) for Rabi.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Apply basal NPK doses based on soil test. For Mustard, apply Single Super Phosphate (SSP) as a source of sulphur.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Treat wheat seeds with Trichoderma viride or Carbendazim (2g/kg) to protect against termites and root rot.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest early Paddy (short-duration varieties). Dry straw for animal feed. Clean grains before sale.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'अगेती गेहूँ, सरसों (पूसा बोल्ड), चना, मसूर और आलू की बुवाई शुरू करें। शीतकालीन फूलगोभी व बंदगोभी के पौधों की रोपाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'कटाई से 10-15 दिन पहले धान के खेतों से पानी निकाल दें। रबी फसलों की बुवाई से पहले खेत में पलेवा (हल्की सिंचाई) करें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'मिट्टी जांच अनुसार रबी बुवाई के समय बेसल डोज दें। सरसों में सल्फर की आपूर्ति के लिए सिंगल सुपर फॉस्फेट (SSP) का प्रयोग करें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'दीमक और जड़ गलन रोग से बचाने के लिए गेहूँ के बीजों को ट्राइकोडर्मा विरिडी या कार्बेन्डाजिम (2 ग्राम/किग्रा) से उपचारित करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'अगेती धान की कटाई मड़ाई करें। पशुओं के चारे के लिए पुआल को सुखाकर रखें। अनाज को मंडी भेजने से पहले अच्छी तरह सुखाएं।' }
    ]
  },
  {
    monthEn: 'November',
    monthHi: 'नवंबर',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Peak sowing time for Wheat (PBW-343, HD-2967, Shatabdi) in Kaimur. Plant potato tubers with correct row-to-row spacing.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Crown Root Initiation (CRI) stage in wheat starts 21 days after sowing. First irrigation is mandatory now.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Apply Nitrogen/Urea (half dose) at first irrigation in wheat. Apply second dose of fertilizers in potato crops.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Control early weeds in Wheat using Sulfosulfuron (or Clodinafop for grass weeds) 30-35 days after sowing.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Harvest main Kharif Paddy (Swarna). Avoid leaving harvested grain piles open in fields overnight due to dew.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'कैमूर में गेहूँ (PBW-343, HD-2967, शताब्दी) की बुवाई का सर्वोत्तम समय। आलू के कंदों की निश्चित दूरी पर मेड़ बनाकर रोपाई करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'गेहूँ बुवाई के 21 दिन बाद किरीट जड़ निकलने (CRI) की अवस्था आती है। इस समय गेहूँ में पहली हल्की सिंचाई अत्यंत आवश्यक है।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'गेहूँ में पहली सिंचाई के बाद बची यूरिया की आधी मात्रा दें। आलू में गुड़ाई के बाद यूरिया की दूसरी खुराक देकर मिट्टी चढ़ाएं।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'गेहूँ में चौड़ी व संकरी पत्ती वाले खरपतवारों के नियंत्रण हेतु बुवाई के 30-35 दिन बाद सल्फोसल्फ्यूरॉन का छिड़काव करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'मुख्य धान (स्वर्णा आदि) की कटाई करें। काटी गई फसल को खेत में ओस से बचाने के लिए रात में खुला न छोड़ें।' }
    ]
  },
  {
    monthEn: 'December',
    monthHi: 'दिसंबर',
    sectionsEn: [
      { type: 'sowing', title: 'Sowing & Nursery Prep', details: 'Sow late-sown Wheat varieties (till mid-December). Plant late varieties of Potato.' },
      { type: 'irrigation', title: 'Irrigation Schedule', details: 'Apply 2nd irrigation in Wheat (tillering stage, 40-45 days after sowing). Maintain soil moisture in vegetable beds.' },
      { type: 'fertilizer', title: 'Fertilizer & Soil Care', details: 'Top dress Urea in late-sown wheat after first irrigation. Weed Mustard and Potato fields before irrigation.' },
      { type: 'pest', title: 'Pest & Disease Management', details: 'Spray Mancozeb (2g/L) for Potato Early Blight. Check Mustard for Downy Mildew or Aphids.' },
      { type: 'harvest', title: 'Harvesting & Storage', details: 'Complete Paddy threshing. Winnow and dry grains to 12% moisture. Store in dry, rat-free bins.' }
    ],
    sectionsHi: [
      { type: 'sowing', title: 'बुवाई और नर्सरी', details: 'दिसंबर के मध्य तक पछेती गेहूँ की बुवाई संपन्न करें। आलू की पछेती किस्मों की बुवाई पूरी करें।' },
      { type: 'irrigation', title: 'सिंचाई कार्यक्रम', details: 'गेहूँ में दूसरी सिंचाई (कल्ले बनते समय, बुवाई के 40-45 दिन बाद) करें। सब्जियों की क्यारियों में हल्की सिंचाई जारी रखें।' },
      { type: 'fertilizer', title: 'खाद और मिट्टी की देखभाल', details: 'पछेती गेहूँ में पहली सिंचाई के बाद यूरिया का छिड़काव करें। सरसों और आलू के खेतों में सिंचाई से पहले निराई-गुड़ाई करें।' },
      { type: 'pest', title: 'कीट और रोग प्रबंधन', details: 'आलू में अगेती झुलसा रोग की रोकथाम हेतु मैंकोज़ेब (2 ग्राम/लीटर) छिड़कें। सरसों में सफेद गेरूई व लाही की निगरानी करें।' },
      { type: 'harvest', title: 'कटाई और भंडारण', details: 'धान की मड़ाई का कार्य पूर्ण करें। ओसावन (winnowing) कर अनाज को 12% नमी तक सुखाकर चूहों से सुरक्षित ड्रमों में भंडारित करें।' }
    ]
  }
];

// Map controller to pan/zoom map programmatically
function MapController({ selectedZone }) {
  const map = useMap();
  useEffect(() => {
    if (selectedZone) {
      const coords = selectedZone.coords;
      const lats = coords.map(c => c[0]);
      const lngs = coords.map(c => c[1]);
      const centerLat = lats.reduce((sum, val) => sum + val, 0) / coords.length;
      const centerLng = lngs.reduce((sum, val) => sum + val, 0) / coords.length;
      map.flyTo([centerLat, centerLng], 16, { duration: 1.2 });
    }
  }, [selectedZone, map]);
  return null;
}

const getSectionIcon = (type) => {
  switch (type) {
    case 'sowing':
      return <Sprout size={18} />;
    case 'irrigation':
      return <Droplets size={18} />;
    case 'fertilizer':
      return <Info size={18} />;
    case 'pest':
      return <ShieldAlert size={18} />;
    case 'harvest':
      return <Calendar size={18} />;
    default:
      return <Sprout size={18} />;
  }
};

const getSectionColor = (type) => {
  switch (type) {
    case 'sowing':
      return '#059669';
    case 'irrigation':
      return '#2563eb';
    case 'fertilizer':
      return '#d97706';
    case 'pest':
      return '#dc2626';
    case 'harvest':
      return '#7c3aed';
    default:
      return '#059669';
  }
};

const formatMessageText = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, lineIdx) => {
    const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
    let cleanLine = isBullet ? line.trim().substring(2) : line;

    const parts = [];
    let currentIdx = 0;
    const regex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = regex.exec(cleanLine)) !== null) {
      if (match.index > currentIdx) {
        parts.push(cleanLine.substring(currentIdx, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      currentIdx = regex.lastIndex;
    }
    if (currentIdx < cleanLine.length) {
      parts.push(cleanLine.substring(currentIdx));
    }

    if (isBullet) {
      return (
        <li key={lineIdx} style={{ marginLeft: '16px', marginBottom: '4px' }}>
          {parts}
        </li>
      );
    }

    return (
      <p key={lineIdx} style={{ margin: '0 0 6px 0', minHeight: '1em' }}>
        {parts}
      </p>
    );
  });
};

function Agriculture() {
  const { user, villageId, language } = useStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
  const isExpert = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin', 'Volunteer'].includes(r));

  // 1. Dashboard State
  const [weather, setWeather] = useState({ temp: 32.5, humidity: 65, rainProb: 10, windSpeed: 12, code: 0, source: 'MOCK', loading: true });
  const [cropAlerts, setCropAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', content: '', crop: 'Paddy', severity: 'Medium' });

  // 2. Mandi State
  const [mandiData, setMandiData] = useState({ records: [], topGainers: [], topLosers: [], lastUpdated: null });
  const [selectedMarket, setSelectedMarket] = useState('Bhabhua');
  const [selectedCommodity, setSelectedCommodity] = useState('Paddy(Dhan)');
  const [mandiLoading, setMandiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [chartDays, setChartDays] = useState(30);

  // 3. Crop Library State
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [libraryTab, setLibraryTab] = useState('sowing'); // sowing, fertilizer, weed, diseases, harvest

  // 4. AI Crop Doctor State
  const [doctorImage, setDoctorImage] = useState(null);
  const [doctorImageBase64, setDoctorImageBase64] = useState('');
  const [doctorDesc, setDoctorDesc] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorResult, setDoctorResult] = useState(null);
  const fileInputRef = useRef(null);

  // 5. AI Assistant State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: language === 'hi' ? 'नमस्ते! मैं पतेरी डिजिटल कृषि सहायक हूँ। मैं आपकी फसलों, रोगों, उर्वरकों और खेती की तकनीकों से जुड़े सवालों के जवाब दे सकता हूँ। पूछिए!' : 'Namaste! I am the Pateri Digital Agri Assistant. Ask me anything about crop varieties, sowing periods, fertilizer doses, or diseases!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 6. Crop Calendar State
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());

  // 9. Crop Map State
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);

  // 7. P2P Marketplace State
  const [marketProducts, setMarketProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [marketCategory, setMarketCategory] = useState('');
  const [newProduct, setNewProduct] = useState({ title: '', description: '', category: 'Seeds', price: '', unit: 'kg', farmerName: '', contactMobile: '' });
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // 8. Expert Consultation State
  const [consultations, setConsultations] = useState([]);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [newConsultation, setNewConsultation] = useState({ question: '', description: '', farmerName: '' });
  const [consultSubmitLoading, setConsultSubmitLoading] = useState(false);
  const [replies, setReplies] = useState({}); // { consultationId: replyText }

  // Helpers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('pateri_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (villageId) {
      fetchWeather();
      fetchMandiRates();
      fetchCropAlerts();
      if (activeSection === 'marketplace') {
        fetchMarketProducts();
      }
      if (activeSection === 'consultation') {
        fetchConsultations();
      }
    }
  }, [villageId, selectedMarket, activeSection]);

  useEffect(() => {
    if (villageId && selectedCommodity) {
      fetchPriceHistory();
    }
  }, [villageId, selectedCommodity, selectedMarket, chartDays]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  // Live Weather Fetch from Open-Meteo
  const fetchWeather = async () => {
    try {
      // Pateri village coordinates: lat=25.0210, lon=83.5684
      const url = `https://api.open-meteo.com/v1/forecast?latitude=25.0210&longitude=83.5684&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code&timezone=Asia%2FKolkata`;
      const res = await axios.get(url);
      if (res.data && res.data.current) {
        setWeather({
          temp: res.data.current.temperature_2m,
          humidity: res.data.current.relative_humidity_2m,
          rainProb: res.data.current.precipitation_probability,
          windSpeed: res.data.current.wind_speed_10m,
          code: res.data.current.weather_code,
          source: 'LIVE',
          loading: false
        });
      }
    } catch (err) {
      console.error('Failed to fetch live weather, using fallback.', err);
      setWeather({
        temp: 33.0,
        humidity: 62,
        rainProb: 15,
        windSpeed: 10,
        code: 1,
        source: 'FALLBACK',
        loading: false
      });
    }
  };

  // Weather description map
  const getWeatherDesc = (code) => {
    const map = {
      0: { en: 'Sunny', hi: 'साफ धूप' },
      1: { en: 'Partly Cloudy', hi: 'हल्के बादल' },
      2: { en: 'Partly Cloudy', hi: 'हल्के बादल' },
      3: { en: 'Cloudy', hi: 'बादल छाए हैं' },
      45: { en: 'Foggy', hi: 'कोहरा' },
      48: { en: 'Dense Fog', hi: 'घना कोहरा' },
      51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी' },
      53: { en: 'Drizzle', hi: 'बूंदाबांदी' },
      55: { en: 'Dense Drizzle', hi: 'घनी बूंदाबांदी' },
      61: { en: 'Light Rain', hi: 'हल्की वर्षा' },
      63: { en: 'Rain', hi: 'वर्षा' },
      65: { en: 'Heavy Rain', hi: 'भारी वर्षा' },
      80: { en: 'Showers', hi: 'बोछारें' },
      95: { en: 'Thunderstorm', hi: 'गरज के साथ तूफान' }
    };
    return map[code] || { en: 'Clear', hi: 'साफ' };
  };

  // Fetch Mandi
  const fetchMandiRates = async () => {
    setMandiLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/agriculture/mandi-rates`, {
        params: { market: selectedMarket }
      });
      setMandiData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch Mandi rates', err);
    } finally {
      setMandiLoading(false);
    }
  };

  // Fetch price history
  const fetchPriceHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/agriculture/price-history`, {
        params: { commodity: selectedCommodity, market: selectedMarket }
      });
      const data = res.data.data || [];
      setHistoryData(data.slice(-chartDays));
    } catch (err) {
      console.error('Failed to fetch price history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.post(`${API_BASE}/agriculture/refresh`, {}, {
        headers: getAuthHeaders()
      });
      alert(`Mandi rates updated successfully! Source: ${res.data.source}`);
      fetchMandiRates();
    } catch (err) {
      alert(err.response?.data?.message || 'Manual refresh limit reached. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch Alerts
  const fetchCropAlerts = async () => {
    setAlertsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/agriculture/alerts`);
      setCropAlerts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Create Alert (Admin)
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/agriculture/alerts`, newAlert, {
        headers: getAuthHeaders()
      });
      alert('Alert created successfully!');
      setNewAlert({ title: '', content: '', crop: 'Paddy', severity: 'Medium' });
      fetchCropAlerts();
    } catch (err) {
      alert('Failed to create alert: ' + (err.response?.data?.message || err.message));
    }
  };

  // Fetch P2P Products
  const fetchMarketProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/agriculture/products`, {
        params: { category: marketCategory }
      });
      setMarketProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Create Product Listing
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductSubmitLoading(true);
    try {
      await axios.post(`${API_BASE}/agriculture/products`, newProduct, {
        headers: getAuthHeaders()
      });
      alert('Product listed successfully!');
      setNewProduct({ title: '', description: '', category: 'Seeds', price: '', unit: 'kg', farmerName: '', contactMobile: '' });
      fetchMarketProducts();
    } catch (err) {
      alert('Failed to list product: ' + (err.response?.data?.message || err.message));
    } finally {
      setProductSubmitLoading(false);
    }
  };

  // Fetch Consultations
  const fetchConsultations = async () => {
    setConsultationsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/agriculture/consultations`, {
        headers: getAuthHeaders()
      });
      setConsultations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setConsultationsLoading(false);
    }
  };

  // Post Consultation question
  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    setConsultSubmitLoading(true);
    try {
      await axios.post(`${API_BASE}/agriculture/consultations`, newConsultation, {
        headers: getAuthHeaders()
      });
      alert('Question posted successfully to experts!');
      setNewConsultation({ question: '', description: '', farmerName: '' });
      fetchConsultations();
    } catch (err) {
      alert('Failed to post question: ' + (err.response?.data?.message || err.message));
    } finally {
      setConsultSubmitLoading(false);
    }
  };

  // Reply to Consultation
  const handleReplyConsultation = async (id) => {
    const replyText = replies[id];
    if (!replyText) return;
    try {
      await axios.patch(`${API_BASE}/agriculture/consultations/${id}/reply`, { reply: replyText }, {
        headers: getAuthHeaders()
      });
      alert('Reply submitted!');
      setReplies(prev => ({ ...prev, [id]: '' }));
      fetchConsultations();
    } catch (err) {
      alert('Failed to reply: ' + (err.response?.data?.message || err.message));
    }
  };

  // AI Crop Doctor Image Selection
  const handleDoctorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDoctorImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Crop Doctor Submit
  const handleCropDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorDesc && !doctorImageBase64) {
      alert('Please select a leaf/crop image or enter symptom descriptions.');
      return;
    }
    setDoctorLoading(true);
    setDoctorResult(null);
    try {
      const res = await axios.post(`${API_BASE}/agriculture/crop-doctor`, {
        description: doctorDesc,
        image: doctorImageBase64
      });
      if (res.data && res.data.data) {
        setDoctorResult(res.data.data);
      }
    } catch (err) {
      alert('Crop Doctor failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDoctorLoading(false);
    }
  };

  // AI Chat Assistant send message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/agriculture/ai-ask`, { query: userMsg });
      if (res.data && res.data.reply) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error: Failed to fetch response from Agri-AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Chat questions
  const quickQuestions = [
    { en: 'How to cure Khaira disease in Paddy?', hi: 'धान में खैरा रोग का उपचार कैसे करें?' },
    { en: 'What is the correct sowing time for Wheat PBW-343?', hi: 'गेहूँ PBW-343 बोने का सही समय क्या है?' },
    { en: 'Suggest organic fertilizers for vegetables.', hi: 'सब्जियों के लिए जैविक खाद बताएं।' },
    { en: 'Control measures for Mustard Aphids.', hi: 'सरसों में लाही (माहू) कीट से बचाव कैसे करें?' }
  ];

  // Chart configuration
  const chartLabels = historyData.map(pt => new Date(pt.arrivalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  const chartValues = historyData.map(pt => pt.modalPrice);

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${selectedCommodity} (₹/Quintal)`,
        data: chartValues,
        fill: true,
        backgroundColor: 'rgba(4, 120, 87, 0.08)',
        borderColor: '#047857',
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#047857',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { font: { family: 'inherit', size: 11, weight: 'bold' } }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.03)' } },
      x: { grid: { display: false } }
    }
  };

  // Filter crops
  const filteredCrops = CROP_DATA.filter(c => {
    const searchLower = librarySearch.toLowerCase();
    return (
      c.name.en.toLowerCase().includes(searchLower) ||
      c.name.hi.includes(searchLower) ||
      c.name.hn.toLowerCase().includes(searchLower)
    );
  });

  // Map settings
  const pateriPosition = [25.0210, 83.5684];
  
  // Custom styled agricultural polygons centering Pateri coordinates
  const zones = [
    {
      name: { en: 'Paddy Zone (North-East Fields)', hi: 'धान बेल्ट (उत्तर-पूर्वी क्षेत्र)' },
      coords: [
        [25.0220, 83.5670], 
        [25.0242, 83.5668], 
        [25.0245, 83.5685],
        [25.0238, 83.5700], 
        [25.0218, 83.5695],
        [25.0215, 83.5680]
      ],
      color: '#047857', // Forest green
      crop: { en: 'Paddy (Swarna / MTU 7029)', hi: 'धान (स्वर्णा / एमटीयू 7029)' },
      yield: { en: '20-22 Quintals / Acre', hi: '20-22 क्विंटल प्रति एकड़' },
      irrigation: { en: 'High (Canal & Tubewell)', hi: 'उच्च (नहर और नलकूप)' },
      soil: { en: 'Clayey Loam (Heavy Clay)', hi: 'मटियार दोमट (भारी मिट्टी)' },
      sowing: { en: 'June 15 - July 15', hi: '15 जून - 15 जुलाई' },
      tips: {
        en: 'Maintain 5cm of standing water. Prevent zinc deficiency (Khaira disease) by applying Zinc Sulphate (25kg/ha) during soil puddling.',
        hi: 'खेत में 5 सेमी पानी का भराव बनाए रखें। मिट्टी की कदोई के समय जिंक सल्फेट (25 किग्रा/हेक्टेयर) डालकर जस्ता की कमी (खैरा रोग) से बचाव करें।'
      }
    },
    {
      name: { en: 'Wheat Zone (West Fields)', hi: 'गेहूँ बेल्ट (पश्चिमी क्षेत्र)' },
      coords: [
        [25.0195, 83.5640], 
        [25.0222, 83.5642], 
        [25.0225, 83.5658], 
        [25.0205, 83.5662],
        [25.0192, 83.5650]
      ],
      color: '#eab308', // Golden yellow
      crop: { en: 'Wheat (HD 2967 / PBW 343)', hi: 'गेहूँ (एचडी 2967 / पीबीडब्ल्यू 343)' },
      yield: { en: '18-20 Quintals / Acre', hi: '18-20 क्विंटल प्रति एकड़' },
      irrigation: { en: 'Medium (Tubewell)', hi: 'मध्यम (नलकूप)' },
      soil: { en: 'Silty Loam (Alluvial)', hi: 'बलुई दोमट (जलोढ़)' },
      sowing: { en: 'November 15 - December 10', hi: '15 नवंबर - 10 दिसंबर' },
      tips: {
        en: 'First irrigation at CRI stage (21 days) is extremely critical. Ensure proper seed treatment using Carbendazim.',
        hi: 'बुवाई के 21 दिन बाद मुकुट जड़ बनते समय (CRI चरण) पहली सिंचाई अत्यंत आवश्यक है। बीजों को कार्बेन्डाजिम से अवश्य उपचारित करें।'
      }
    },
    {
      name: { en: 'Maize Zone (South Fields)', hi: 'मक्का बेल्ट (दक्षिणी क्षेत्र)' },
      coords: [
        [25.0170, 83.5665], 
        [25.0195, 83.5668], 
        [25.0192, 83.5685], 
        [25.0178, 83.5690],
        [25.0168, 83.5680]
      ],
      color: '#f97316', // Orange
      crop: { en: 'Maize (Deccan Hybrid / Shaktiman)', hi: 'मक्का (डेक्कन हाइब्रिड / शक्तिमान)' },
      yield: { en: '25-30 Quintals / Acre', hi: '25-30 क्विंटल प्रति एकड़' },
      irrigation: { en: 'Medium-Low (Rainfed / Tubewell)', hi: 'मध्यम-कम (वर्षा आधारित / नलकूप)' },
      soil: { en: 'Sandy Loam (Well Drained)', hi: 'बलुई दोमट (अच्छी जलनिकास)' },
      sowing: { en: 'June 20 - July 10', hi: '20 जून - 10 जुलाई' },
      tips: {
        en: 'Ensure proper row spacing (60cm x 20cm). Provide good drainage to prevent waterlogging during heavy monsoon rains.',
        hi: 'कतार से कतार की दूरी 60 सेमी और पौधे से पौधे की दूरी 20 सेमी रखें। मक्के में जलभराव रोकने के लिए जलनिकास की उत्तम व्यवस्था करें।'
      }
    },
    {
      name: { en: 'Vegetable Zone (East Fields)', hi: 'सब्जी बेल्ट (पूर्वी क्षेत्र)' },
      coords: [
        [25.0200, 83.5695], 
        [25.0218, 83.5692], 
        [25.0222, 83.5715], 
        [25.0205, 83.5718],
        [25.0198, 83.5705]
      ],
      color: '#10b981', // Emerald Teal
      crop: { en: 'Tomato, Potato, Cauliflower, Onion', hi: 'टमाटर, आलू, फूलगोभी, प्याज' },
      yield: { en: '50-60 Quintals / Acre', hi: '50-60 क्विंटल प्रति एकड़' },
      irrigation: { en: 'Micro-sprinklers / Drip', hi: 'सूक्ष्म-फव्वारा / टपक सिंचाई' },
      soil: { en: 'Rich Sandy Alluvial (Diyara Soil)', hi: 'उपजाऊ बलुई दोमट (दियारा मिट्टी)' },
      sowing: { en: 'Round the year (Multi-seasonal)', hi: 'वर्ष भर (बहु-मौसमी)' },
      tips: {
        en: 'Use yellow sticky traps to capture whiteflies and insects. Apply organic neem oil pesticide sprays regularly.',
        hi: 'सफेद मक्खियों और कीटों को पकड़ने के लिए पीले चिपचिपे जाल लगाएं। नियमित रूप से जैविक नीम तेल का छिड़काव करें।'
      }
    }
  ];

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      {/* 1. Hero Title Banner */}
      <section className="hero-section" style={{ background: 'linear-gradient(135deg, #065f46 0%, #0f5132 100%)', color: 'white', borderRadius: 'var(--radius-lg)', padding: '40px 30px', marginBottom: 'var(--spacing-lg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, opacity: 0.1, display: 'flex', alignItems: 'center' }}>
          <Sprout size={260} style={{ transform: 'rotate(15deg) translateY(-20px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px' }}>
            <Sparkles size={16} /> {language === 'hi' ? 'उन्नत कृषि इंटेलिजेंस हब' : language === 'hn' ? 'Advanced Krishi Intelligence Hub' : 'Advanced Krishi Intelligence Hub'}
          </div>
          <h1 style={{ fontSize: '2.6rem', fontFamily: 'var(--font-serif)', margin: '0 0 12px 0', color: 'white' }}>
            {language === 'hi' ? 'डिजिटल पतेरी स्मार्ट कृषि पोर्टल' : 'Digital Pateri Smart Krishi Portal'}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
            {language === 'hi' ? 'मौसम विज्ञान, लाइव मंडी बाजार दरें, कृषि सलाह, 14 फसलों की डिजिटल लाइब्रेरी, एआई क्रॉप डॉक्टर रोग पहचान, तथा किसान-टू-किसान व्यापार केंद्र।' : 'Farming weather, live Agmarknet Kaimur prices, month-wise crop calendars, offline Crop Library, AI Crop Doctor diagnosis, and direct farmer-to-farmer agricultural marketplace.'}
          </p>
        </div>
      </section>

      {/* 2. Top-level Tab Navigation */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
        {[
          { id: 'dashboard', icon: CloudSun, labelEn: 'Dashboard', labelHi: 'डैशबोर्ड' },
          { id: 'library', icon: BookOpen, labelEn: 'Crop Library', labelHi: 'फसल लाइब्रेरी' },
          { id: 'doctor', icon: ShieldAlert, labelEn: 'AI Crop Doctor', labelHi: 'AI क्रॉप डॉक्टर' },
          { id: 'aiassistant', icon: MessageSquare, labelEn: 'AI Assistant', labelHi: 'एआई सहायक' },
          { id: 'calendar', icon: Calendar, labelEn: 'Crop Calendar', labelHi: 'फसल कैलेंडर' },
          { id: 'marketplace', icon: Store, labelEn: 'Marketplace', labelHi: 'किसान बाज़ार' },
          { id: 'consultation', icon: FileText, labelEn: 'Expert Consult', labelHi: 'विशेषज्ञ सलाह' },
          { id: 'cropmap', icon: Map, labelEn: 'Crop Map', labelHi: 'फसल मानचित्र' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="filter-chip"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <Icon size={16} />
              <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents Rendering */}
      
      {/* -------------------- TAB: DASHBOARD -------------------- */}
      {activeSection === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '25px', alignItems: 'start' }}>
          {/* Left Column: Mandi and Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sprout size={24} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>
                    {language === 'hi' ? 'लाइव मंडी दरें (कैमूर)' : 'Live Mandi Rates (Kaimur)'}
                  </h2>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    value={selectedMarket} 
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.85rem', background: 'white', borderRadius: '4px', border: '1px solid var(--border)' }}
                  >
                    <option value="Bhabhua">{language === 'hi' ? 'भभुआ मंडी' : 'Bhabhua Mandi'}</option>
                    <option value="Mohania">{language === 'hi' ? 'मोहनिया मंडी' : 'Mohania Mandi'}</option>
                    <option value="Kudra">{language === 'hi' ? 'कुदरा मंडी' : 'Kudra Mandi'}</option>
                  </select>

                  {isAdmin && (
                    <button 
                      onClick={handleManualRefresh} 
                      disabled={refreshing}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                    >
                      <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
                      <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Price trend indicator top widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={14} /> {language === 'hi' ? 'शीर्ष वृद्धि' : 'Top Gainers'} ({selectedMarket})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    {mandiData.topGainers && mandiData.topGainers.length > 0 ? (
                      mandiData.topGainers.map((g, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(4, 120, 87, 0.2)', paddingBottom: '2px' }}>
                          <span>{g.commodity}</span>
                          <strong style={{ color: '#047857' }}>₹{g.currentPrice} <span style={{ fontSize: '0.7rem' }}>↑+{g.change}</span></strong>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">{language === 'hi' ? 'आज कोई वृद्धि नहीं दर्ज की गई।' : 'No price gains today'}</span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingDown size={14} /> {language === 'hi' ? 'शीर्ष गिरावट' : 'Top Losers'} ({selectedMarket})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    {mandiData.topLosers && mandiData.topLosers.length > 0 ? (
                      mandiData.topLosers.map((l, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(220, 38, 38, 0.2)', paddingBottom: '2px' }}>
                          <span>{l.commodity}</span>
                          <strong style={{ color: '#dc2626' }}>₹{l.currentPrice} <span style={{ fontSize: '0.7rem' }}>↓{l.change}</span></strong>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">{language === 'hi' ? 'आज कोई बड़ी गिरावट नहीं।' : 'No price drops today'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mandi Rate Records Table */}
              {mandiLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>Loading Mandi rates...</div>
              ) : mandiData.records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No Agmarknet rates available for Kaimur today.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: 'var(--bg-cream)' }}>
                        <th style={{ padding: '8px' }}>Commodity</th>
                        <th style={{ padding: '8px' }}>Variety</th>
                        <th style={{ padding: '8px' }}>Min Price</th>
                        <th style={{ padding: '8px' }}>Max Price</th>
                        <th style={{ padding: '8px' }}>Modal Price</th>
                        <th style={{ padding: '8px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandiData.records.map((rate) => (
                        <tr 
                          key={rate._id} 
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => setSelectedCommodity(rate.commodity)}
                          className={selectedCommodity === rate.commodity ? 'selected-row' : ''}
                        >
                          <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--primary)' }}>{rate.commodity}</td>
                          <td style={{ padding: '8px' }}>{rate.variety}</td>
                          <td style={{ padding: '8px' }}>₹{rate.minPrice}</td>
                          <td style={{ padding: '8px' }}>₹{rate.maxPrice}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>₹{rate.modalPrice}</td>
                          <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{new Date(rate.arrivalDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Source: Agmarknet Bihar Portal</span>
                    <span>Last Updated: {mandiData.lastUpdated ? new Date(mandiData.lastUpdated).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Price Chart */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'var(--font-serif)' }}>Price Trend Chart</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click on table rows to chart price trends</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setChartDays(7)} className="filter-chip" style={{ padding: '4px 8px', fontSize: '0.75rem', background: chartDays === 7 ? 'var(--primary)' : 'var(--border)', color: chartDays === 7 ? 'white' : 'var(--text-dark)' }}>7 Days</button>
                  <button onClick={() => setChartDays(30)} className="filter-chip" style={{ padding: '4px 8px', fontSize: '0.75rem', background: chartDays === 30 ? 'var(--primary)' : 'var(--border)', color: chartDays === 30 ? 'white' : 'var(--text-dark)' }}>30 Days</button>
                </div>
              </div>
              {historyLoading ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
              ) : historyData.length === 0 ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No historical trend points found.</div>
              ) : (
                <div style={{ height: '220px' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weather, Alerts, Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Weather Widget */}
            <div className="glass-card" style={{ background: 'linear-gradient(to right, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CloudSun size={18} />
                <span>{language === 'hi' ? 'मौसम पूर्वानुमान (पतेरी)' : 'Weather Forecast (Pateri)'}</span>
              </h3>
              {weather.loading ? (
                <div>Loading live weather forecast...</div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Thermometer size={34} color="#dc2626" />
                      <div>
                        <span style={{ fontSize: '2.1rem', fontWeight: 'bold', color: '#1e3a8a' }}>{weather.temp}°C</span>
                        <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 'bold' }}>{getWeatherDesc(weather.code)[language === 'hi' ? 'hi' : 'en']}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#1e40af' }}>
                      <div>Wind: <strong>{weather.windSpeed} km/h</strong></div>
                      <div>Humidity: <strong>{weather.humidity}%</strong></div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '6px', padding: '8px', fontSize: '0.8rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CloudRain size={16} />
                    <span>Probability of Rain: <strong>{weather.rainProb}%</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Crop & Pest Alerts */}
            <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={18} />
                  <span>Crop & Pest Warnings</span>
                </h3>
              </div>

              {/* Admin Issue Alert Form */}
              {isAdmin && (
                <form onSubmit={handleCreateAlert} style={{ background: 'var(--bg-cream)', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>📢 Publish Warning (Admin)</div>
                  <input 
                    type="text" 
                    placeholder="Alert Title (e.g. Stem Borer Attack)" 
                    value={newAlert.title} 
                    onChange={e => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                    style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    required
                  />
                  <textarea 
                    placeholder="Detailed warning content & treatment..." 
                    value={newAlert.content} 
                    onChange={e => setNewAlert(prev => ({ ...prev, content: e.target.value }))}
                    style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', height: '50px' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Crop (e.g. Paddy)" 
                      value={newAlert.crop} 
                      onChange={e => setNewAlert(prev => ({ ...prev, crop: e.target.value }))}
                      style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
                      required
                    />
                    <select 
                      value={newAlert.severity} 
                      onChange={e => setNewAlert(prev => ({ ...prev, severity: e.target.value }))}
                      style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Plus size={14} /> Publish Alert
                  </button>
                </form>
              )}

              {/* Alerts List */}
              {alertsLoading ? (
                <div>Loading crop alerts...</div>
              ) : cropAlerts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '15px' }}>
                  No pest or weather alerts active currently.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                  {cropAlerts.map((alert) => (
                    <div key={alert._id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#b91c1c' }}>{alert.title}</span>
                        <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                          {alert.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '4px' }}>Crop Target: <strong>{alert.crop}</strong></div>
                      <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-dark)' }}>{alert.content}</p>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '6px' }}>{new Date(alert.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links to Government schemes and documents */}
            <div className="grid-3" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
              <Link to="/documents?category=Government Schemes" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '8px', background: 'rgba(217, 119, 6, 0.1)', borderRadius: '50%', color: 'var(--secondary)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem' }}>Government Schemes</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fertilizer subsidies & PM Kisan forms</span>
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </Link>

              <Link to="/documents?category=Agriculture Guides" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '8px', background: 'rgba(4, 120, 87, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem' }}>Farming Manuals</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Download official Kaimur manuals</span>
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: CROP LIBRARY -------------------- */}
      {activeSection === 'library' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder={language === 'hi' ? 'फसल का नाम खोजें...' : 'Search crop by name...'}
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                style={{ padding: '10px 10px 10px 38px', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '25px', alignItems: 'start' }}>
            {/* Left list of crops */}
            <div className="card" style={{ maxHeight: '550px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px' }}>
              {filteredCrops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => {
                    setSelectedCrop(crop);
                    setLibraryTab('sowing');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    textAlign: 'left',
                    background: selectedCrop?.id === crop.id ? 'rgba(4, 120, 87, 0.08)' : 'white',
                    cursor: 'pointer',
                    borderColor: selectedCrop?.id === crop.id ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                      {language === 'hi' ? crop.name.hi : crop.name.en}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {crop.season[language === 'hi' ? 'hi' : 'en']}
                    </span>
                  </div>
                  <ChevronRight size={16} color="var(--primary)" />
                </button>
              ))}
              {filteredCrops.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No crops found matching your search.</div>
              )}
            </div>

            {/* Right Crop details card */}
            {selectedCrop ? (
              <div className="glass-card" style={{ padding: '25px', borderTop: '4px solid var(--primary)' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
                    {language === 'hi' ? selectedCrop.name.hi : selectedCrop.name.en}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px', fontSize: '0.8rem' }}>
                    <div>🌾 Season: <strong>{selectedCrop.season[language === 'hi' ? 'hi' : 'en']}</strong></div>
                    <div>🪨 Soil: <strong>{selectedCrop.soil[language === 'hi' ? 'hi' : 'en']}</strong></div>
                    <div>💧 Water: <strong>{selectedCrop.water[language === 'hi' ? 'hi' : 'en']}</strong></div>
                  </div>
                </div>

                {/* Sub-tabs for Crop guide details */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {[
                    { id: 'sowing', label: 'Sowing' },
                    { id: 'fertilizer', label: 'Fertilizer & Soil' },
                    { id: 'weed', label: 'Weeds' },
                    { id: 'diseases', label: 'Diseases' },
                    { id: 'harvest', label: 'Harvesting' }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setLibraryTab(subTab.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: libraryTab === subTab.id ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: libraryTab === subTab.id ? '2.5px solid var(--primary)' : 'none',
                        transition: 'var(--transition)'
                      }}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* Guide sub-content */}
                <div style={{ minHeight: '180px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {libraryTab === 'sowing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>🕒 Sowing Time: <strong>{selectedCrop.sowing.time[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>🌾 Seed Rate: <strong>{selectedCrop.sowing.seedRate[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>📏 Plant Spacing: <strong>{selectedCrop.sowing.spacing[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-cream)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                        <strong>Best practices:</strong> Pluck healthy seedlings for transplanting. Make sure nursery beds are organic.
                      </div>
                    </div>
                  )}

                  {libraryTab === 'fertilizer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>🧪 Recommended NPK Dose: <strong>{selectedCrop.fertilizer.npk[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>🍃 Organic Fertilizer: <strong>{selectedCrop.fertilizer.organic[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-cream)', borderRadius: '6px' }}>
                        <strong>Soil Health Tip:</strong> Farmers should get soil tested at Bhabhua Soil Lab every 2 years to avoid nitrogen toxicity.
                      </div>
                    </div>
                  )}

                  {libraryTab === 'weed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>🕒 Critical weeding period: <strong>{selectedCrop.weed.time[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>🔧 Method: <strong>{selectedCrop.weed.method[language === 'hi' ? 'hi' : 'en']}</strong></div>
                    </div>
                  )}

                  {libraryTab === 'diseases' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {selectedCrop.diseases.map((d, idx) => (
                        <div key={idx} style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>🛡️ {d.name[language === 'hi' ? 'hi' : 'en']}</strong>
                          <div style={{ marginBottom: '4px' }}>Symptom: {d.symptoms[language === 'hi' ? 'hi' : 'en']}</div>
                          <div>Treatment: <strong>{d.remedy[language === 'hi' ? 'hi' : 'en']}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {libraryTab === 'harvest' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>🌾 Maturity Signs: <strong>{selectedCrop.harvesting.signs[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>💧 Safe Moisture: <strong>{selectedCrop.harvesting.moisture[language === 'hi' ? 'hi' : 'en']}</strong></div>
                      <div>📦 Storage Advice: <strong>{selectedCrop.harvesting.storage[language === 'hi' ? 'hi' : 'en']}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sprout size={48} style={{ margin: '0 auto 15px auto', opacity: 0.5 }} />
                <h3>Crop Details</h3>
                <p>Select a crop from the library to view detailed sowing, fertilizer, and disease treatment guidelines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB: AI CROP DOCTOR -------------------- */}
      {activeSection === 'doctor' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }} className="glass-card">
          <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <ShieldAlert size={40} color="var(--primary)" style={{ marginBottom: '10px' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: '0 0 8px 0' }}>AI Crop Disease Doctor</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Upload a photo of crop leaves/infected parts or describe symptoms to receive diagnostic summaries via Google Gemini.</p>
            </div>

            <form onSubmit={handleCropDoctorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Photo Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-cream)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {doctorImage ? (
                    <img src={doctorImage} alt="Crop Leaf" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Upload size={32} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Click to Upload Leaf Photo</span>
                      <span style={{ fontSize: '0.7rem' }}>Accepts PNG, JPG</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleDoctorImageChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {doctorImage && (
                  <button 
                    type="button" 
                    onClick={() => { setDoctorImage(null); setDoctorImageBase64(''); }} 
                    style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Text Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Describe Symptoms (Optional if image uploaded)</label>
                <textarea
                  placeholder="e.g. Yellow spots on rice leaves, brown powder-like stripe on wheat stalks, stunting..."
                  value={doctorDesc}
                  onChange={e => setDoctorDesc(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '10px', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <button
                type="submit"
                disabled={doctorLoading}
                className="btn-primary"
                style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}
              >
                <Sparkles size={16} />
                <span>{doctorLoading ? 'Analyzing leaf symptoms...' : 'Diagnose Crop Disease'}</span>
              </button>
            </form>

            {/* Results block */}
            {doctorLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spin-animation" style={{ display: 'inline-block', marginBottom: '10px' }}>
                  <RefreshCw size={24} color="var(--primary)" />
                </div>
                <p style={{ fontSize: '0.85rem' }}>AI Crop Doctor is analyzing leaf structures and descriptors using Gemini...</p>
              </div>
            )}

            {doctorResult && (
              <div className="card" style={{ marginTop: '30px', padding: '20px', borderLeft: '5px solid var(--primary)', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--secondary)' }}>Diagnosis Result</span>
                    <h3 style={{ margin: '2px 0 0 0', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>{doctorResult.diseaseName}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence</div>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{doctorResult.confidenceScore}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>🧐 Key Symptoms</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {doctorResult.symptoms && doctorResult.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>❓ Causes</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {doctorResult.causes && doctorResult.causes.map((c, idx) => <li key={idx}>{c}</li>)}
                    </ul>
                  </div>

                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>🛡️ Prevention Measures</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {doctorResult.prevention && doctorResult.prevention.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(4, 120, 87, 0.05)', padding: '12px', borderRadius: '6px' }}>
                    <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '4px' }}>💊 Recommended Treatment</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontWeight: 'bold' }}>
                      {doctorResult.treatment && doctorResult.treatment.map((t, idx) => <li key={idx}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB: AI CHAT ASSISTANT -------------------- */}
      {activeSection === 'aiassistant' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }} className="glass-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '25px', height: '480px' }}>
            {/* Chat Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Chat Message Window */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px', minHeight: 0 }}>
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? 'var(--primary)' : 'white',
                      color: msg.sender === 'user' ? 'white' : 'var(--text-dark)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '90%',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.sender === 'user' ? msg.text : formatMessageText(msg.text)}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: 'flex-start', background: 'white', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    AI is writing response...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Ask a farming question..." 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Quick Prompts & Information sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: 'var(--bg-cream)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <span>Quick Questions</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {quickQuestions.map((q, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setChatInput(language === 'hi' ? q.hi : q.en)}
                      style={{
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-dark)',
                        transition: 'var(--transition)'
                      }}
                      className="hover-card"
                    >
                      {language === 'hi' ? q.hi : q.en}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                💡 <strong>Agronomy Tip:</strong> Our Agri-AI utilizes real weather parameters, regional soil profiles, and scientific crop data to optimize its responses.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: CROP CALENDAR -------------------- */}
      {activeSection === 'calendar' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }} className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <Calendar size={36} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: 0 }}>Pateri Crop Calendar</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Month-wise list of operations, sowing, and fertilizer applications for Kaimur, Bihar.</p>
          </div>

          {/* Month selector grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '25px' }}>
            {MONTH_CALENDAR.map((cal, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMonthIndex(idx)}
                style={{
                  padding: '10px 4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selectedMonthIndex === idx ? 'var(--primary)' : 'white',
                  color: selectedMonthIndex === idx ? 'white' : 'var(--text-dark)',
                  textAlign: 'center'
                }}
              >
                {language === 'hi' ? cal.monthHi : cal.monthEn}
              </button>
            ))}
          </div>

          {/* Month operations card */}
          <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '5px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                {language === 'hi' ? MONTH_CALENDAR[selectedMonthIndex].monthHi : MONTH_CALENDAR[selectedMonthIndex].monthEn} Operations
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>Bihar Cycle</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              {(language === 'hi' ? MONTH_CALENDAR[selectedMonthIndex].sectionsHi : MONTH_CALENDAR[selectedMonthIndex].sectionsEn).map((section, sIdx) => {
                const sColor = getSectionColor(section.type);
                return (
                  <div 
                    key={sIdx} 
                    style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      background: 'white', 
                      padding: '15px', 
                      borderRadius: '8px', 
                      borderLeft: `4px solid ${sColor}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div 
                      style={{ 
                        padding: '8px', 
                        background: `${sColor}15`, 
                        borderRadius: '50%', 
                        color: sColor, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getSectionIcon(section.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                        {section.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        {section.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: MARKETPLACE -------------------- */}
      {activeSection === 'marketplace' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '25px', alignItems: 'start' }}>
            {/* Left listings grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>P2P Agricultural Trading Listings</h3>
                <select 
                  value={marketCategory} 
                  onChange={e => { setMarketCategory(e.target.value); }}
                  style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                >
                  <option value="">All Categories</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Produce">Crops for Sale</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {productsLoading ? (
                <div>Loading listed products...</div>
              ) : marketProducts.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No items listed for trading in Pateri currently.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {marketProducts.map((p) => (
                    <div key={p._id} className="card" style={{ padding: '15px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(4, 120, 87, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                          {p.category}
                        </span>
                        <strong style={{ color: 'var(--secondary)', fontSize: '1.05rem' }}>₹{p.price} / {p.unit}</strong>
                      </div>
                      <h4 style={{ margin: '4px 0 2px 0', color: 'var(--primary)' }}>{p.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>{p.description}</p>
                      
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Farmer: <strong>{p.farmerName}</strong></div>
                        <a href={`tel:${p.contactMobile}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
                          <Phone size={12} /> Call: {p.contactMobile}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: List an Item Form */}
            <div className="glass-card">
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={18} />
                <span>List an Item to Sell</span>
              </h3>

              {user ? (
                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Item Title (e.g. Surplus Wheat seeds)" 
                    value={newProduct.title}
                    onChange={e => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    required
                  />
                  <select 
                    value={newProduct.category}
                    onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Produce">Crops for Sale</option>
                    <option value="Other">Other</option>
                  </select>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="number" 
                      placeholder="Price in ₹" 
                      value={newProduct.price}
                      onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Unit (e.g. kg, bag)" 
                      value={newProduct.unit}
                      onChange={e => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                      style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', width: '90px' }}
                      required
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={newProduct.farmerName}
                    onChange={e => setNewProduct(prev => ({ ...prev, farmerName: e.target.value }))}
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Contact Mobile Number" 
                    value={newProduct.contactMobile}
                    onChange={e => setNewProduct(prev => ({ ...prev, contactMobile: e.target.value }))}
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    required
                  />
                  <textarea 
                    placeholder="Item details (variety, condition, availability)..." 
                    value={newProduct.description}
                    onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', height: '60px' }}
                  />
                  <button type="submit" disabled={productSubmitLoading} className="btn-primary" style={{ padding: '10px' }}>
                    {productSubmitLoading ? 'Submitting...' : 'Post Listing'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>login</Link> to list your agriculture products or equipment for sale.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'consultation' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '25px', alignItems: 'start' }}>
            {/* Left listings of Q&A */}
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Farmer Questions & Expert Answers</h3>
              
              {consultationsLoading ? (
                <div>Loading consultations...</div>
              ) : consultations.length === 0 ? (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No consultation questions listed yet. Ask the first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {consultations.map((c) => (
                    <div key={c._id} className="card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{c.question}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Posted by: <strong>{c.farmerName}</strong></div>
                        </div>
                        <span style={{ fontSize: '0.7rem', background: c.isResolved ? '#ecfdf5' : '#fffbeb', color: c.isResolved ? '#065f46' : '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                          {c.isResolved ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-dark)' }}>{c.description}</p>
                      
                      {/* Reply Box */}
                      {c.isResolved ? (
                        <div style={{ background: 'var(--bg-cream)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid var(--secondary)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                            <User size={14} /> Expert Recommendation:
                          </div>
                          <p style={{ margin: 0, fontStyle: 'italic' }}>{c.reply}</p>
                        </div>
                      ) : (
                        isExpert && (
                          <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border)', paddingTop: '10px', display: 'flex', gap: '6px' }}>
                            <input 
                              type="text" 
                              placeholder="Type expert advice / reply here..." 
                              value={replies[c._id] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setReplies(prev => ({ ...prev, [c._id]: val }));
                              }}
                              style={{ flex: 1, padding: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                            <button onClick={() => handleReplyConsultation(c._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                              Submit Advice
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Form */}
            <div>
              {user ? (
                <div className="glass-card">
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={18} />
                    <span>Ask a Question</span>
                  </h3>
                  <form onSubmit={handleCreateConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Short Question (e.g. Tomato leaf curling)" 
                      value={newConsultation.question}
                      onChange={e => setNewConsultation(prev => ({ ...prev, question: e.target.value }))}
                      style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={newConsultation.farmerName}
                      onChange={e => setNewConsultation(prev => ({ ...prev, farmerName: e.target.value }))}
                      style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                      required
                    />
                    <textarea 
                      placeholder="Provide details about symptoms, fertilizer used, soil type, moisture level..." 
                      value={newConsultation.description}
                      onChange={e => setNewConsultation(prev => ({ ...prev, description: e.target.value }))}
                      style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', height: '80px' }}
                    />
                    <button type="submit" disabled={consultSubmitLoading} className="btn-primary" style={{ padding: '10px' }}>
                      {consultSubmitLoading ? 'Submitting...' : 'Post Question'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '6px' }}>
                    <MessageSquare size={18} />
                    <span>Ask a Question</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    Please log in to ask a question to agricultural experts.
                  </p>
                  <Link to="/login" className="btn-primary" style={{ display: 'inline-block', padding: '8px 16px', textDecoration: 'none', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Login to Ask
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: CROP INTELLIGENCE MAP -------------------- */}
      {activeSection === 'cropmap' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '25px', alignItems: 'start' }}>
            {/* Map Container */}
            <div className="glass-card" style={{ padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}>
                <MapPin size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Pateri Village Crop Cultivation Zones</h3>
              </div>

              <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapContainer center={pateriPosition} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />

                  {/* Agricultural Polygons */}
                  {zones.map((zone, idx) => (
                    <Polygon 
                      key={idx}
                      positions={zone.coords}
                      eventHandlers={{
                        click: () => { setSelectedZoneIndex(idx); }
                      }}
                      pathOptions={{
                        color: zone.color,
                        fillColor: zone.color,
                        fillOpacity: selectedZoneIndex === idx ? 0.4 : 0.2,
                        weight: selectedZoneIndex === idx ? 4 : 2
                      }}
                    >
                      <Popup>
                        <div style={{ fontSize: '0.85rem', width: '200px' }}>
                          <strong style={{ color: zone.color, fontSize: '0.9rem' }}>{language === 'hi' ? zone.name.hi : zone.name.en}</strong>
                          <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
                            <div>🌾 {language === 'hi' ? 'फसल:' : 'Crop:'} <strong>{language === 'hi' ? zone.crop.hi : zone.crop.en}</strong></div>
                            <div>📈 {language === 'hi' ? 'उपज:' : 'Avg Yield:'} <strong>{language === 'hi' ? zone.yield.hi : zone.yield.en}</strong></div>
                            <div>💧 {language === 'hi' ? 'सिंचाई source:' : 'Irrigation:'} <strong>{language === 'hi' ? zone.irrigation.hi : zone.irrigation.en}</strong></div>
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  ))}

                  {/* Custom map controller */}
                  <MapController selectedZone={selectedZoneIndex !== null ? zones[selectedZoneIndex] : null} />
                </MapContainer>
              </div>
            </div>

            {/* Legend & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-serif)', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  {language === 'hi' ? 'मानचित्र सूची (Legend)' : 'Map Legend'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {zones.map((z, idx) => {
                    const isSelected = selectedZoneIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedZoneIndex(isSelected ? null : idx)}
                        style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'flex-start', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          border: isSelected ? `2px solid ${z.color}` : '1px solid var(--border)', 
                          background: isSelected ? `${z.color}0c` : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: z.color, opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong style={{ display: 'block', color: isSelected ? 'var(--primary)' : 'var(--text-dark)', fontWeight: 'bold' }}>
                            {language === 'hi' ? z.name.hi : z.name.en}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {language === 'hi' ? z.crop.hi : z.crop.en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '15px', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  📍 {language === 'hi' ? 'केंद्र स्थान: पतेरी गाँव, चांद ब्लॉक, कैमूर जिला, बिहार। क्षेत्र मिट्टी सर्वेक्षणों पर आधारित हैं।' : 'Coordinates centering: Pateri Village, Chand Block, Kaimur District, Bihar. Map zones are approximated based on local soil retention and block surveys.'}
                </div>
              </div>

              {/* Detailed Zone Inspection Card */}
              <div className="glass-card" style={{ padding: '20px', borderLeft: selectedZoneIndex !== null ? `5px solid ${zones[selectedZoneIndex].color}` : '5px solid var(--border)', transition: 'border-left 0.3s ease' }}>
                {selectedZoneIndex !== null ? (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
                        {language === 'hi' ? 'क्षेत्र निरीक्षण (Zone Info)' : 'Zone Inspection'}
                      </h4>
                      <button 
                        onClick={() => setSelectedZoneIndex(null)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        {language === 'hi' ? 'बंद करें ✕' : 'Clear ✕'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{language === 'hi' ? '🌾 मुख्य फसल:' : '🌾 Primary Crop:'}</strong>{' '}
                        <span>{language === 'hi' ? zones[selectedZoneIndex].crop.hi : zones[selectedZoneIndex].crop.en}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{language === 'hi' ? '🌱 मिट्टी का प्रकार:' : '🌱 Soil Type:'}</strong>{' '}
                        <span>{language === 'hi' ? zones[selectedZoneIndex].soil.hi : zones[selectedZoneIndex].soil.en}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{language === 'hi' ? '💧 सिंचाई स्रोत:' : '💧 Water Source:'}</strong>{' '}
                        <span>{language === 'hi' ? zones[selectedZoneIndex].irrigation.hi : zones[selectedZoneIndex].irrigation.en}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{language === 'hi' ? '📅 बोवाई का समय:' : '📅 Sowing Season:'}</strong>{' '}
                        <span>{language === 'hi' ? zones[selectedZoneIndex].sowing.hi : zones[selectedZoneIndex].sowing.en}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-dark)' }}>{language === 'hi' ? '📈 औसत उपज:' : '📈 Avg Yield:'}</strong>{' '}
                        <span>{language === 'hi' ? zones[selectedZoneIndex].yield.hi : zones[selectedZoneIndex].yield.en}</span>
                      </div>
                      <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '6px', marginTop: '5px' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary)', fontSize: '0.8rem' }}>
                          💡 {language === 'hi' ? 'कृषि सलाह (Agronomic Advice):' : 'Agronomic Advice:'}
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: '1.5', color: '#374151' }}>
                          {language === 'hi' ? zones[selectedZoneIndex].tips.hi : zones[selectedZoneIndex].tips.en}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0 }}>
                      💡 {language === 'hi' ? 'नक्शे पर किसी रंगीन फसल क्षेत्र पर क्लिक करें या ऊपर सूची से चुनकर उसका मिट्टी प्रोफाइल, सिंचाई विवरण और कृषि सलाह देखें।' : 'Click on any crop zone on the map or select from the list above to view its soil profile, water source, and expert agricultural tips.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .selected-row {
          background-color: rgba(4, 120, 87, 0.05) !important;
          border-left: 3px solid var(--primary) !important;
        }
        .spin-animation {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-card {
          transition: var(--transition);
        }
        .hover-card:hover {
          border-color: var(--primary) !important;
          background: rgba(4, 120, 87, 0.02) !important;
        }
      `}</style>

    </div>
  );
}

export default Agriculture;
