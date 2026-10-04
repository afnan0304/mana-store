const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Person type is required'],
      enum: {
        values: ['STUDENT', 'STAFF', 'FACULTY', 'DEPARTMENT', 'OTHER'],
        message: '{VALUE} is not a valid person type',
      },
    },
    identifier: {
      type: String,
      required: [true, 'Identifier is required (e.g., STU-0142)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    activeItemsCount: {
      type: Number,
      default: 0,
      min: [0, 'Active items count cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'BLOCKED'],
        message: '{VALUE} is not a valid status',
      },
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
