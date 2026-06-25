const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requirePermission } = require('../middleware/auth.middleware');

router.get('/formula', settingsController.getFormulaConfig);
router.post('/formula', requirePermission('manageRates'), settingsController.updateFormulaConfig);

module.exports = router;
