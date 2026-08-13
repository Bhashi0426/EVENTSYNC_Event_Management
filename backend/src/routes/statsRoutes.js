const express = require('express');
const statsController = require('../controllers/statsController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/overview', requireAuth, requireRole('admin'), statsController.overview);

module.exports = router;
