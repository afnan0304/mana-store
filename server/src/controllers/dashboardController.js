const { Item, Transaction, Person, AuditLog } = require('../models');

/**
 * Get aggregated dashboard statistics and operational metrics
 * GET /api/v1/dashboard/metrics
 */
const getMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalItems,
      availableCount,
      issuedCount,
      maintenanceCount,
      damagedCount,
      overdueCount,
      issuedToday,
      returnedToday,
      activeBorrowersCount,
      recentTransactions,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'AVAILABLE' }),
      Item.countDocuments({ status: 'ISSUED' }),
      Item.countDocuments({ status: 'UNDER_MAINTENANCE' }),
      Item.countDocuments({ status: 'DAMAGED' }),
      Item.countDocuments({
        status: 'ISSUED',
        currentExpectedReturnDate: { $lt: now },
      }),
      Transaction.countDocuments({
        type: 'ISSUE',
        createdAt: { $gte: startOfToday },
      }),
      Transaction.countDocuments({
        type: 'RETURN',
        createdAt: { $gte: startOfToday },
      }),
      Person.countDocuments({ activeItemsCount: { $gt: 0 } }),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('item', 'name assetId status')
        .populate('person', 'name identifier department')
        .populate('performedBy', 'username role'),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalItems,
        availableCount,
        issuedCount,
        maintenanceCount,
        damagedCount,
        overdueCount,
        issuedToday,
        returnedToday,
        activeBorrowersCount,
      },
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log trail
 * GET /api/v1/dashboard/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, targetEntity } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (action) filter.action = action;
    if (targetEntity) filter.targetEntity = targetEntity;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      logs,
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
  getMetrics,
  getAuditLogs,
};
