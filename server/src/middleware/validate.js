/**
 * Zod Request Validation Middleware
 * @param {import('zod').ZodSchema} schema Zod schema to validate req.body against
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate query parameters against Zod schema
 * @param {import('zod').ZodSchema} schema Zod schema to validate req.query against
 */
const validateQuery = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync(req.query);
    req.query = parsed;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  validateQuery,
};
