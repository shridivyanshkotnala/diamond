const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { requireRole } = require('../middleware/auth.middleware');

router.use(authenticateJWT);

router.get('/formula', settingsController.getFormulaConfig);
router.post('/formula', requirePermission('manageFormulae'), settingsController.updateFormulaConfig);

router.get('/matrices', settingsController.getDashboardMatrices);
router.post('/matrices', requirePermission('homeDashboardMetricsControls'), settingsController.updateDashboardMatrices);

// Supreme rates - only SUPER role can access
router.get('/supreme-rates', requireRole('SUPER'), settingsController.getSupremeRates);
router.put('/supreme-rates', requireRole('SUPER'), settingsController.updateSupremeRates);

module.exports = router;
