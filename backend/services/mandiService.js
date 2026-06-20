const MandiRate = require('../models/MandiRate');

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Generate 30 days of realistic mock Mandi rates for Kaimur
 */
const generateMockRates = async () => {
  console.log('Generating realistic mock Mandi rates for Kaimur district (last 30 days)...');
  const markets = ['Bhabhua', 'Mohania', 'Kudra'];
  const commodities = [
    { name: 'Paddy(Dhan)', basePrice: 2180, variety: 'Common' },
    { name: 'Wheat(Gehun)', basePrice: 2350, variety: 'Dara' },
    { name: 'Mustard(Sarso)', basePrice: 5350, variety: 'Mustard' },
    { name: 'Gram(Chana)', basePrice: 4800, variety: 'Gram' },
    { name: 'Rice(Chawal)', basePrice: 3200, variety: 'Common' },
    { name: 'Potato(Aloo)', basePrice: 1200, variety: 'Desi' },
    { name: 'Tomato(Tamatar)', basePrice: 1800, variety: 'Local' },
    { name: 'Onion(Pyaz)', basePrice: 1500, variety: 'Red' }
  ];

  const rates = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(6, 0, 0, 0);

    for (const market of markets) {
      for (const crop of commodities) {
        // Small random walk to create a realistic price trend chart
        const dayOffset = 30 - i;
        const trend = Math.sin(dayOffset / 4.0) * 80; // smooth wave
        const noise = (Math.random() - 0.5) * 40; // daily noise
        const finalPrice = Math.round(crop.basePrice + trend + noise);

        rates.push({
          state: 'Bihar',
          district: 'Kaimur',
          market,
          commodity: crop.name,
          variety: crop.variety,
          minPrice: Math.round(finalPrice * 0.95),
          maxPrice: Math.round(finalPrice * 1.05),
          modalPrice: finalPrice,
          arrivalDate: date,
          source: 'MOCK',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  // Clear existing rates and insert the 30-day baseline
  await MandiRate.deleteMany({});
  await MandiRate.insertMany(rates);
  console.log(`Successfully generated ${rates.length} historical mock Mandi rates.`);
};

/**
 * Fetch Mandi rates from OGD API (data.gov.in)
 */
const fetchMandiRatesFromAPI = async () => {
  const apiKey = process.env.DATA_GOV_API_KEY;

  // If API key is missing or is the default placeholder, skip and fallback to Mock
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.includes('your_')) {
    console.log('data.gov.in API key not configured or is placeholder. Falling back to Mock data.');
    await generateMockRates();
    return { success: true, source: 'MOCK' };
  }

  try {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${apiKey}&format=json&limit=100&filters[state]=Bihar&filters[district]=Kaimur`;
    console.log(`Fetching live Mandi rates from data.gov.in: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const records = json.records || [];

    if (records.length === 0) {
      console.log('No Mandi records found in API response. Falling back to Mock data.');
      await generateMockRates();
      return { success: true, source: 'MOCK' };
    }

    console.log(`Received ${records.length} records from Agmarknet API. Upserting into DB...`);

    for (const record of records) {
      // OGD keys can be lowercase or capitalized depending on exact endpoint metadata
      const state = record.state || record.State;
      const district = record.district || record.District;
      const market = record.market || record.Market;
      const commodity = record.commodity || record.Commodity;
      const variety = record.variety || record.Variety;
      const minPrice = parseFloat(record.min_price || record.Min_Price);
      const maxPrice = parseFloat(record.max_price || record.Max_Price);
      const modalPrice = parseFloat(record.modal_price || record.Modal_Price);
      
      // Parse arrival date: Agmarknet returns DD/MM/YYYY format
      const rawDate = record.arrival_date || record.Arrival_Date;
      let arrivalDate = new Date();
      if (rawDate) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          // Month is 0-indexed
          arrivalDate = new Date(parts[2], parts[1] - 1, parts[0], 6, 0, 0, 0);
        }
      }

      // Upsert record to preserve history but update daily values
      const queryDateStart = new Date(arrivalDate);
      queryDateStart.setHours(0, 0, 0, 0);
      const queryDateEnd = new Date(arrivalDate);
      queryDateEnd.setHours(23, 59, 59, 999);

      await MandiRate.findOneAndUpdate(
        {
          market,
          commodity,
          arrivalDate: { $gte: queryDateStart, $lte: queryDateEnd }
        },
        {
          state,
          district,
          market,
          commodity,
          variety,
          minPrice,
          maxPrice,
          modalPrice,
          arrivalDate,
          source: 'API',
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    console.log('Mandi rates updated successfully from Agmarknet API.');
    return { success: true, source: 'API' };
  } catch (error) {
    console.error('Error fetching from Mandi API, falling back to mock generation:', error);
    await generateMockRates();
    return { success: true, source: 'MOCK', error: error.message };
  }
};

module.exports = {
  fetchMandiRatesFromAPI,
  generateMockRates
};
