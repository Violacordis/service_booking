const Joi = require("joi");

const branchSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  status: Joi.boolean().optional(),
});

const createBranchSchema = Joi.array().items(branchSchema).min(1);

const getBranchesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt").default("createdAt"),
  term: Joi.string().optional(),
});

module.exports = {
  createBranchSchema,
  getBranchesQuerySchema,
};
