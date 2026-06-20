const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth.middleware');

// Protect all employee routes - only OWNER can manage employees
router.use(authenticateJWT);
router.use(requireRole('OWNER'));

router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getEmployees);

module.exports = router;
