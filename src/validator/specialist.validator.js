const Joi = require("joi");

const createSpecialistSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string().optional().messages({
    "string.base": "Phone must be a string",
  }),
  age: Joi.number().integer().min(18).optional().messages({
    "number.base": "Age must be a number",
    "number.min": "Age must be at least 18",
  }),
  address: Joi.string().optional().messages({
    "string.base": "Address must be a string",
  }),
  city: Joi.string().optional().messages({
    "string.base": "City must be a string",
  }),
  state: Joi.string().optional().messages({
    "string.base": "State must be a string",
  }),
  country: Joi.string().optional().messages({
    "string.base": "Country must be a string",
  }),
  aboutMe: Joi.string().optional().messages({
    "string.base": "About Me must be a string",
  }),
  branchId: Joi.string().uuid().required().messages({
    "string.uuid": "Branch ID must be a valid UUID",
    "any.required": "Branch ID is required",
  }),
  description: Joi.string().optional().messages({
    "string.base": "Description must be a string",
  }),
  categoryIds: Joi.array()
    .items(
      Joi.string().uuid().messages({
        "string.uuid": "Each category ID must be a valid UUID",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Category IDs must be an array",
      "array.min": "At least one category ID is required",
    }),
});

const getSpecialistsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  status: Joi.boolean().optional(),
  branchId: Joi.string().uuid().optional(),
  sortBy: Joi.string().valid("name", "email", "createdAt").default("createdAt"),
  term: Joi.string().optional(),
});

module.exports = {
  createSpecialistSchema,
  getSpecialistsQuerySchema,
};
