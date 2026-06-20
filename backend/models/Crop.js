const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  cropId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  name: {
    en: { type: String, required: true },
    hi: { type: String },
    hn: { type: String }
  },
  localName: { type: String },
  scientificName: { type: String },
  introduction: { type: String },
  season: {
    en: { type: String },
    hi: { type: String },
    hn: { type: String }
  },
  climate: { type: String },
  soilRequirement: { type: String },
  seedVarieties: [String],
  seedRate: { type: String },
  nurseryGuide: { type: String },
  sowingProcess: { type: String },
  fertilizerSchedule: { type: String },
  irrigationSchedule: { type: String },
  weedManagement: { type: String },
  diseaseManagement: { type: String },
  pestManagement: { type: String },
  harvestGuide: { type: String },
  storageGuide: { type: String },
  marketDemand: { type: String },
  yieldEstimates: { type: String },
  photoUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Crop', CropSchema);
