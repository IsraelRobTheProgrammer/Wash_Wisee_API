const Joi = require("joi");

module.exports.agentAuthSchema = Joi.object({
  campground: Joi.object({
    mail: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }).required(),
});

// module.exports.reviewSchema = Joi.object({
//   review: Joi.object({
//     text: Joi.string().required(),
//     rating: Joi.number().required().min(1).max(5),
//   }).required(),
// });
