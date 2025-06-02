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

module.exports = {
  createServicesSchema,
};
