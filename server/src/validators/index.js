const { z } = require('zod');

// 1. Authentication Schemas
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
});

// 2. Item Schemas
const createItemSchema = z.object({
  assetId: z
    .string({ required_error: 'Asset ID is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Asset ID must be at least 2 characters'),
  name: z
    .string({ required_error: 'Item name is required' })
    .trim()
    .min(2, 'Item name must be at least 2 characters'),
  category: z
    .string({ required_error: 'Category ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB Category ObjectId'),
  trackingType: z
    .enum(['INDIVIDUAL_ASSET', 'QUANTITY_BASED'])
    .default('INDIVIDUAL_ASSET'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .nonnegative('Quantity cannot be negative')
    .default(1),
  condition: z
    .enum(['NEW', 'GOOD', 'FAIR', 'POOR'])
    .default('GOOD'),
  currentLocation: z
    .string()
    .trim()
    .default('Main Store'),
  serialNumber: z
    .string()
    .trim()
    .optional()
    .default(''),
  notes: z
    .string()
    .trim()
    .optional()
    .default(''),
});

const updateItemSchema = createItemSchema.partial().extend({
  assetId: createItemSchema.shape.assetId.optional(),
});

// 3. Person / Borrower Schemas
const createPersonSchema = z.object({
  name: z
    .string({ required_error: 'Person name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  type: z.enum(['STUDENT', 'STAFF', 'FACULTY', 'DEPARTMENT', 'OTHER'], {
    required_error: 'Person type is required',
  }),
  identifier: z
    .string({ required_error: 'Identifier is required (e.g. STU-0142)' })
    .trim()
    .toUpperCase()
    .min(2, 'Identifier must be at least 2 characters'),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .min(2, 'Department is required'),
  email: z
    .string()
    .email('Please provide a valid email')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .optional()
    .default(''),
});

// 4. Transaction Schemas
const issueItemSchema = z.object({
  itemId: z
    .string({ required_error: 'itemId is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Item ObjectId'),
  personId: z
    .string({ required_error: 'personId is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Person ObjectId'),
  expectedReturnDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format'))
    .optional(),
  purpose: z.string().trim().optional().default(''),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  remarks: z.string().trim().optional().default(''),
});

const returnItemSchema = z.object({
  itemId: z
    .string({ required_error: 'itemId is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Item ObjectId'),
  returnCondition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  remarks: z.string().trim().optional().default(''),
  sendToMaintenance: z.boolean().optional().default(false),
});

module.exports = {
  loginSchema,
  createItemSchema,
  updateItemSchema,
  createPersonSchema,
  issueItemSchema,
  returnItemSchema,
};
