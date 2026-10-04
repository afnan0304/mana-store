const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item category is required'],
    },
    trackingType: {
      type: String,
      enum: {
        values: ['INDIVIDUAL_ASSET', 'QUANTITY_BASED'],
        message: '{VALUE} is not a valid tracking type',
      },
      default: 'INDIVIDUAL_ASSET',
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be less than 0'],
    },
    status: {
      type: String,
      enum: {
        values: [
          'AVAILABLE',
          'ISSUED',
          'UNDER_MAINTENANCE',
          'DAMAGED',
          'LOST',
          'RETIRED',
        ],
        message: '{VALUE} is not a valid item status',
      },
      default: 'AVAILABLE',
    },
    condition: {
      type: String,
      enum: {
        values: ['NEW', 'GOOD', 'FAIR', 'POOR'],
        message: '{VALUE} is not a valid condition',
      },
      default: 'GOOD',
    },
    currentLocation: {
      type: String,
      trim: true,
      default: 'Main Store',
    },
    currentBorrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    currentExpectedReturnDate: {
      type: Date,
      default: null,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ currentBorrower: 1 });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
