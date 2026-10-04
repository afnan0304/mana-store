const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: [
          'ISSUE',
          'RETURN',
          'TRANSFER',
          'MAINTENANCE_IN',
          'MAINTENANCE_OUT',
          'REPORT_DAMAGE',
          'REPORT_LOST',
          'RETIRE',
        ],
        message: '{VALUE} is not a valid transaction type',
      },
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User (performedBy) reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    conditionAtEvent: {
      type: String,
      enum: {
        values: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'],
        message: '{VALUE} is not a valid condition',
      },
      default: 'GOOD',
    },
    purpose: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
transactionSchema.index({ item: 1, createdAt: -1 });
transactionSchema.index({ person: 1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
