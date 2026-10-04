const mongoose = require('mongoose');
const { Item, Person, Transaction, AuditLog } = require('../models');

/**
 * Execute a unit of work inside a MongoDB transaction session.
 * Safely falls back to non-transactional execution if the MongoDB host is standalone without replica set.
 * @param {Function} workFn Function taking (session, isTransactional)
 */
const runInSession = async (workFn) => {
  const session = await mongoose.startSession();
  let isTransactional = false;

  try {
    session.startTransaction();
    isTransactional = true;
  } catch (error) {
    // MongoDB standalone instance does not support transactions
    isTransactional = false;
  }

  try {
    const result = await workFn(session, isTransactional);
    if (isTransactional && session.inTransaction()) {
      await session.commitTransaction();
    }
    return result;
  } catch (error) {
    if (isTransactional && session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Issues an item to an active borrower
 * @param {Object} params Issue parameters
 * @returns {Promise<{ success: boolean, item: Object, transaction: Object }>}
 */
const issueItem = async ({
  itemId,
  personId,
  userId,
  expectedReturnDate,
  purpose = '',
  condition,
  remarks = '',
  ipAddress = '127.0.0.1',
}) => {
  if (!itemId || !personId || !userId) {
    const error = new Error('itemId, personId, and userId are required to issue an item.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch and validate Item availability
  const item = await Item.findById(itemId);
  if (!item) {
    const error = new Error(`Item not found with ID: ${itemId}`);
    error.statusCode = 404;
    throw error;
  }

  if (item.status !== 'AVAILABLE') {
    const error = new Error(
      `Item "${item.name}" (${item.assetId}) cannot be issued. Current status is ${item.status}.`
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch and validate Person status
  const person = await Person.findById(personId);
  if (!person) {
    const error = new Error(`Person not found with ID: ${personId}`);
    error.statusCode = 404;
    throw error;
  }

  if (person.status !== 'ACTIVE') {
    const error = new Error(
      `Cannot issue equipment to "${person.name}" (${person.identifier}). Account status is ${person.status}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const issueCondition = condition || item.condition;
  const targetExpectedReturnDate = expectedReturnDate ? new Date(expectedReturnDate) : null;

  // 3. Execute atomic transaction
  return await runInSession(async (session, isTransactional) => {
    const sessionOpt = isTransactional ? { session } : {};

    // A. Update Item status, borrower, and expected return date
    const claimed = await Item.findOneAndUpdate(
      { _id: item._id, status: 'AVAILABLE' },
      {
        $set: {
          status: 'ISSUED',
          currentBorrower: person._id,
          currentExpectedReturnDate: targetExpectedReturnDate,
          ...(condition ? { condition } : {}),
        },
      },
      { ...sessionOpt, new: true }
    );
    if (!claimed) {
      const error = new Error(`Item "${item.name}" (${item.assetId}) was just issued by another request.`);
      error.statusCode = 409;
      throw error;
    }
    item.set(claimed.toObject());

    // B. Create immutable ISSUE transaction record
    const [transaction] = await Transaction.create(
      [
        {
          type: 'ISSUE',
          item: item._id,
          person: person._id,
          performedBy: userId,
          issueDate: new Date(),
          expectedReturnDate: targetExpectedReturnDate,
          conditionAtEvent: issueCondition,
          purpose,
          remarks,
        },
      ],
      sessionOpt
    );

    // C. Increment borrower's active items count
    await Person.findByIdAndUpdate(
      person._id,
      { $inc: { activeItemsCount: 1 } },
      { ...sessionOpt, new: true }
    );

    // D. Record audit trail
    await AuditLog.create(
      [
        {
          performedBy: userId,
          action: 'ITEM_ISSUED',
          targetEntity: 'Item',
          targetId: item._id,
          details: {
            transactionId: transaction._id,
            assetId: item.assetId,
            itemName: item.name,
            borrowerId: person._id,
            borrowerIdentifier: person.identifier,
            borrowerName: person.name,
            expectedReturnDate: targetExpectedReturnDate,
            condition: issueCondition,
            purpose,
            remarks,
          },
          ipAddress,
          status: 'SUCCESS',
        },
      ],
      sessionOpt
    );

    return {
      success: true,
      message: `Item "${item.name}" (${item.assetId}) successfully issued to ${person.name}.`,
      item,
      transaction,
    };
  });
};

/**
 * Returns an issued item to inventory or routes to maintenance
 * @param {Object} params Return parameters
 * @returns {Promise<{ success: boolean, item: Object, transaction: Object, nextStatus: string }>}
 */
const returnItem = async ({
  itemId,
  userId,
  returnCondition,
  remarks = '',
  sendToMaintenance = false,
  ipAddress = '127.0.0.1',
}) => {
  if (!itemId || !userId) {
    const error = new Error('itemId and userId are required to return an item.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch and validate Item is currently ISSUED
  const item = await Item.findById(itemId);
  if (!item) {
    const error = new Error(`Item not found with ID: ${itemId}`);
    error.statusCode = 404;
    throw error;
  }

  if (item.status !== 'ISSUED') {
    const error = new Error(
      `Item "${item.name}" (${item.assetId}) is not currently issued. Current status is ${item.status}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const previousBorrowerId = item.currentBorrower;
  const effectiveCondition = returnCondition || item.condition;

  // 2. Determine next inventory state
  const isDamagedOrPoor =
    effectiveCondition === 'POOR' ||
    effectiveCondition === 'DAMAGED';

  const nextStatus =
    isDamagedOrPoor || sendToMaintenance === true
      ? 'UNDER_MAINTENANCE'
      : 'AVAILABLE';

  // 3. Execute atomic transaction
  return await runInSession(async (session, isTransactional) => {
    const sessionOpt = isTransactional ? { session } : {};

    // A. Update Item state and clear current borrower/return date
    const released = await Item.findOneAndUpdate(
      { _id: item._id, status: 'ISSUED' },
      {
        $set: {
          status: nextStatus,
          condition: effectiveCondition === 'DAMAGED' ? 'POOR' : effectiveCondition,
          currentBorrower: null,
          currentExpectedReturnDate: null,
        },
      },
      { ...sessionOpt, new: true }
    );
    if (!released) {
      const error = new Error(`Item "${item.name}" (${item.assetId}) was already returned.`);
      error.statusCode = 409;
      throw error;
    }
    item.set(released.toObject());

    // B. Create immutable RETURN transaction record
    const [transaction] = await Transaction.create(
      [
        {
          type: 'RETURN',
          item: item._id,
          person: previousBorrowerId,
          performedBy: userId,
          actualReturnDate: new Date(),
          conditionAtEvent: effectiveCondition,
          purpose: `Return processing - Status routed to ${nextStatus}`,
          remarks,
        },
      ],
      sessionOpt
    );

    // C. Decrement borrower's active items count if borrower was tracked
    if (previousBorrowerId) {
      await Person.findByIdAndUpdate(
        previousBorrowerId,
        [
          {
            $set: {
              activeItemsCount: {
                $max: [0, { $subtract: ['$activeItemsCount', 1] }],
              },
            },
          },
        ],
        sessionOpt
      );
    }

    // D. Record audit trail
    await AuditLog.create(
      [
        {
          performedBy: userId,
          action: 'ITEM_RETURNED',
          targetEntity: 'Item',
          targetId: item._id,
          details: {
            transactionId: transaction._id,
            assetId: item.assetId,
            itemName: item.name,
            returnedByBorrowerId: previousBorrowerId,
            returnCondition: effectiveCondition,
            nextStatus,
            routedToMaintenance: nextStatus === 'UNDER_MAINTENANCE',
            remarks,
          },
          ipAddress,
          status: 'SUCCESS',
        },
      ],
      sessionOpt
    );

    return {
      success: true,
      message: `Item "${item.name}" (${item.assetId}) returned successfully and updated to ${nextStatus}.`,
      item,
      transaction,
      nextStatus,
    };
  });
};

module.exports = {
  issueItem,
  returnItem,
};
