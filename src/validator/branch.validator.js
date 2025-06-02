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

module.exports = {
  createBranchSchema,
};
