const express = require('express');
const {
  getPeople,
  getPersonById,
  createPerson,
} = require('../controllers/personController');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createPersonSchema } = require('../validators');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/people
router.get('/', getPeople);

// GET /api/v1/people/:id
router.get('/:id', getPersonById);

// POST /api/v1/people (ADMIN, STOREKEEPER only)
router.post(
  '/',
  requireRoles('ADMIN', 'STOREKEEPER'),
  validate(createPersonSchema),
  createPerson
);

module.exports = router;
