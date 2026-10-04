const express = require('express');
const {
  getItems,
  getItemById,
  createItem,
  getCategories,
} = require('../controllers/itemController');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createItemSchema } = require('../validators');

const router = express.Router();

// Public authenticated routes
router.use(authenticate);

// GET /api/v1/items/categories
router.get('/categories', getCategories);

// GET /api/v1/items
router.get('/', getItems);

// GET /api/v1/items/:id
router.get('/:id', getItemById);

// POST /api/v1/items (ADMIN, STOREKEEPER only)
router.post(
  '/',
  requireRoles('ADMIN', 'STOREKEEPER'),
  validate(createItemSchema),
  createItem
);

module.exports = router;
