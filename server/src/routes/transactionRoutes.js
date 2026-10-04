const express = require('express');
const {
  issue,
  returnItemHandler,
  getOverdue,
  getTransactions,
} = require('../controllers/transactionController');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { issueItemSchema, returnItemSchema } = require('../validators');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/transactions
router.get('/', getTransactions);

// GET /api/v1/transactions/overdue
router.get('/overdue', getOverdue);

// POST /api/v1/transactions/issue (ADMIN, STOREKEEPER only)
router.post(
  '/issue',
  requireRoles('ADMIN', 'STOREKEEPER'),
  validate(issueItemSchema),
  issue
);

// POST /api/v1/transactions/return (ADMIN, STOREKEEPER only)
router.post(
  '/return',
  requireRoles('ADMIN', 'STOREKEEPER'),
  validate(returnItemSchema),
  returnItemHandler
);

module.exports = router;
