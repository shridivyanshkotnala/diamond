const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rate.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

router.use(authenticateJWT);

// GET requests are open to all authenticated users (Employees + Owners)
// Gold
router.get('/gold', rateController.getGoldRates);
router.post('/gold', requirePermission('manageRates'), rateController.updateGoldRate);

// Diamond
router.get('/diamond', rateController.getDiamondRates);
router.post('/diamond', requirePermission('manageRates'), rateController.addOrUpdateDiamondRate);
router.delete('/diamond/:id', requirePermission('manageRates'), rateController.deleteDiamondRate);

// Colorstone
router.get('/colorstone', rateController.getColorstoneRates);
router.post('/colorstone', requirePermission('manageRates'), rateController.addOrUpdateColorstoneRate);
router.delete('/colorstone/:id', requirePermission('manageRates'), rateController.deleteColorstoneRate);

module.exports = router;
