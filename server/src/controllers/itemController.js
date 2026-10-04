const { Item, Transaction, Category, AuditLog } = require('../models');

/**
 * Get all items with filtering, search, and pagination
 * GET /api/v1/items
 */
const getItems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      condition,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { assetId: searchRegex },
        { serialNumber: searchRegex },
        { currentLocation: searchRegex },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, totalItems] = await Promise.all([
      Item.find(filter)
        .populate('category', 'name')
        .populate('currentBorrower', 'name identifier email department phone')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      items,
      pagination: {
        total: totalItems,
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
 * Get single item with populated chronological transaction history
 * GET /api/v1/items/:id
 */
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate('category', 'name description')
      .populate('currentBorrower', 'name identifier department email phone');

    if (!item) {
      const error = new Error(`Equipment item with ID ${id} not found.`);
      error.statusCode = 404;
      return next(error);
    }

    // Fetch full chronological transaction history for this item
    const transactions = await Transaction.find({ item: id })
      .populate('person', 'name identifier department email')
      .populate('performedBy', 'username role email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      item,
      transactionHistory: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new equipment item (ADMIN, STOREKEEPER)
 * POST /api/v1/items
 */
const createItem = async (req, res, next) => {
  try {
    const {
      assetId,
      name,
      category,
      trackingType,
      quantity,
      condition,
      currentLocation,
      serialNumber,
      notes,
    } = req.body;

    // Check for existing assetId
    const existing = await Item.findOne({ assetId: assetId.toUpperCase() });
    if (existing) {
      const error = new Error(`An equipment item with Asset ID "${assetId}" already exists.`);
      error.statusCode = 409;
      return next(error);
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      const error = new Error(`Category with ID ${category} does not exist.`);
      error.statusCode = 404;
      return next(error);
    }

    const item = await Item.create({
      assetId: assetId.toUpperCase(),
      name,
      category,
      trackingType: trackingType || 'INDIVIDUAL_ASSET',
      quantity: quantity !== undefined ? quantity : 1,
      status: 'AVAILABLE',
      condition: condition || 'GOOD',
      currentLocation: currentLocation || 'Main Store',
      serialNumber: serialNumber || '',
      notes: notes || '',
    });

    const populatedItem = await Item.findById(item._id).populate('category', 'name');

    // Audit log
    await AuditLog.create({
      performedBy: req.user._id,
      action: 'ITEM_CREATED',
      targetEntity: 'Item',
      targetId: item._id,
      details: {
        assetId: item.assetId,
        name: item.name,
        category: categoryDoc.name,
      },
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: `Equipment item "${item.name}" (${item.assetId}) created successfully.`,
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.assetId) updates.assetId = updates.assetId.toUpperCase();

    if (updates.category) {
      const category = await Category.findById(updates.category);
      if (!category) {
        const error = new Error(`Category with ID ${updates.category} does not exist.`);
        error.statusCode = 404;
        return next(error);
      }
    }

    if (updates.assetId) {
      const duplicate = await Item.findOne({ assetId: updates.assetId, _id: { $ne: id } });
      if (duplicate) {
        const error = new Error(`An equipment item with Asset ID "${updates.assetId}" already exists.`);
        error.statusCode = 409;
        return next(error);
      }
    }

    const item = await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('category', 'name');
    if (!item) {
      const error = new Error(`Equipment item with ID ${id} not found.`);
      error.statusCode = 404;
      return next(error);
    }

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'ITEM_UPDATED',
      targetEntity: 'Item',
      targetId: item._id,
      details: { assetId: item.assetId, name: item.name },
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
    });

    res.status(200).json({ success: true, message: `Equipment item "${item.name}" updated successfully.`, item });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories (helper for frontend dropdowns)
 * GET /api/v1/items/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  getCategories,
};
