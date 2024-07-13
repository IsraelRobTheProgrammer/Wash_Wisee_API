const Joi = require("joi");

module.exports.agentAuthSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().pattern(new RegExp("^.{6}$")).required(),
});

module.exports.verifyCodeSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  code: Joi.string().length(5).required(),
});

module.exports.emailSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
});

module.exports.businessSchema = Joi.object({
  businessName: Joi.string().required().messages({
    "any.required": "business_name is required",
    "string.base": "business_name must be a string",
  }),
  services: Joi.string()
    .valid(
      "Basic Laundry Service - washing, drying and folding clothes",
      "Premium Laundry Service - washing, drying, folding and ironing",
      "Dry cleaning - special fabrics",
      "Bedding and Linens"
    )
    .required()
    .messages({
      "any.only": "services must be one of: {#valids}",
      "any.required": "services is required",
      "string.base": "services must be a string",
    }),
  priceRange: Joi.string()
    .valid(
      "Basic Laundry service - 1000 naira minimum",
      "Premium Laundry service - 2000 naira minimum",
      "Dry cleaning - Negotiable",
      "Bedding and Linens - 500 naira minimum"
    )
    .required()
    .messages({
      "any.only": "price_range must be one of: {#valids}",
      "any.required": "price_range is required",
      "string.base": "price_range must be a string",
    }),
  description: Joi.string().min(50).max(250).required().messages({
    "string.min": "Description must be at least 50 characters",
    "string.max": "Description must be at most 250 characters",
    "any.required": "Description is required",
  }),
});
