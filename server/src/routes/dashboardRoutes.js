const express = require('express');
const {
  getMetrics,
  getAuditLogs,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/dashboard/metrics
router.get('/metrics', getMetrics);

// GET /api/v1/dashboard/audit-logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
