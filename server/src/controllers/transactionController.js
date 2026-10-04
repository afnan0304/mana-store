const {
  issueItem,
  returnItem,
} = require('../services/transactionService');
const { Item, Transaction } = require('../models');

/**
 * Issue equipment item to an active borrower
 * POST /api/v1/transactions/issue
 */
const issue = async (req, res, next) => {
  try {
    const {
      itemId,
      personId,
      expectedReturnDate,
      purpose,
      condition,
      remarks,
    } = req.body;

    const result = await issueItem({
      itemId,
      personId,
      userId: req.user._id,
      expectedReturnDate,
      purpose,
      condition,
      remarks,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Return an issued equipment item
 * POST /api/v1/transactions/return
 */
const returnItemHandler = async (req, res, next) => {
  try {
    const { itemId, returnCondition, remarks, sendToMaintenance } = req.body;

    const result = await returnItem({
      itemId,
      userId: req.user._id,
      returnCondition,
      remarks,
      sendToMaintenance,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all currently overdue items
 * GET /api/v1/transactions/overdue
 */
const getOverdue = async (req, res, next) => {
  try {
    const now = new Date();

    const overdueItems = await Item.find({
      status: 'ISSUED',
      currentExpectedReturnDate: { $lt: now },
    })
      .populate('category', 'name')
      .populate('currentBorrower', 'name identifier department email phone')
      .sort({ currentExpectedReturnDate: 1 });

    // Format with daysOverdue calculation
    const formatted = overdueItems.map((item) => {
      const diffMs = now.getTime() - new Date(item.currentExpectedReturnDate).getTime();
      const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return {
        ...item.toObject(),
        daysOverdue,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      items: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of transactions
 * GET /api/v1/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, type, itemId, personId } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (type) filter.type = type;
    if (itemId) filter.item = itemId;
    if (personId) filter.person = personId;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('item', 'name assetId category status condition')
        .populate('person', 'name identifier department email')
        .populate('performedBy', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issue,
  returnItemHandler,
  getOverdue,
  getTransactions,
};
