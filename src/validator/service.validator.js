const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  type: Joi.string().valid("BASIC", "STANDARD", "PREMIUM").optional(),
  estimatedTime: Joi.number().min(0).optional(),
});

const serviceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  branchId: Joi.string().uuid().required(),
  categories: Joi.array().items(categorySchema).required(),
});

const createServicesSchema = Joi.array().items(serviceSchema).min(1);

const getServicesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  branchId: Joi.string().uuid().optional(),
  sortBy: Joi.string().valid("name", "email", "createdAt").default("createdAt"),
  term: Joi.string().optional(),
});

module.exports = {
  createServicesSchema,
  getServicesQuerySchema,
};
