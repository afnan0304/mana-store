const { Person, Item, Transaction, AuditLog } = require('../models');

/**
 * Get all borrowers / people with search and filtering
 * GET /api/v1/people
 */
const getPeople = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      hasActiveItems,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (hasActiveItems === 'true') {
      filter.activeItemsCount = { $gt: 0 };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { identifier: searchRegex },
        { department: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [people, totalPeople] = await Promise.all([
      Person.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Person.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalPeople / limitNum);

    res.status(200).json({
      success: true,
      people,
      pagination: {
        total: totalPeople,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single person profile with held items and transaction history
 * GET /api/v1/people/:id
 */
const getPersonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const person = await Person.findById(id);
    if (!person) {
      const error = new Error(`Person with ID ${id} not found.`);
      error.statusCode = 404;
      return next(error);
    }

    // Currently held items by this person
    const currentHeldItems = await Item.find({ currentBorrower: id })
      .populate('category', 'name')
      .sort({ currentExpectedReturnDate: 1 });

    // Borrow history for this person
    const borrowHistory = await Transaction.find({ person: id })
      .populate('item', 'name assetId category condition status')
      .populate('performedBy', 'username role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      person,
      currentHeldItems,
      borrowHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new student or staff borrower
 * POST /api/v1/people
 */
const createPerson = async (req, res, next) => {
  try {
    const { name, type, identifier, department, email, phone } = req.body;

    // Check unique identifier
    const existing = await Person.findOne({
      identifier: identifier.toUpperCase(),
    });
    if (existing) {
      const error = new Error(
        `Borrower with identifier "${identifier}" already exists (${existing.name}).`
      );
      error.statusCode = 409;
      return next(error);
    }

    const person = await Person.create({
      name,
      type,
      identifier: identifier.toUpperCase(),
      department,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || '',
      activeItemsCount: 0,
      status: 'ACTIVE',
    });

    // Audit log
    await AuditLog.create({
      performedBy: req.user._id,
      action: 'PERSON_REGISTERED',
      targetEntity: 'Person',
      targetId: person._id,
      details: {
        identifier: person.identifier,
        name: person.name,
        type: person.type,
        department: person.department,
      },
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: `Borrower "${person.name}" (${person.identifier}) registered successfully.`,
      person,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPeople,
  getPersonById,
  createPerson,
};
