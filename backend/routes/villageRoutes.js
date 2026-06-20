const express = require('express');
const router = express.Router();
const { 
  getVillages, 
  getVillageDetails, 
  getVillageAssets,
  getVillageTimeline,
  getVillageAchievements,
  getDemographics
} = require('../controllers/villageController');

router.get('/', getVillages);
router.get('/:id', getVillageDetails);
router.get('/:id/assets', getVillageAssets);
router.get('/:id/timeline', getVillageTimeline);
router.get('/:id/achievements', getVillageAchievements);
router.get('/:id/demographics', getDemographics);

module.exports = router;
