const Joi = require('joi');

const gstVerifySchema = Joi.object({
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required().messages({
    'string.pattern.base': 'INVALID_GST_NUMBER',
    'any.required': 'GST number is required'
  })
});

const gstConfirmSchema = Joi.object({
  gstNumber: Joi.string().required()
});

const contactDetailsSchema = Joi.object({
  businessId: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  // Allow local domains in development and hosted domains in production
  email: Joi.string().trim().email({ tlds: { allow: false }, minDomainSegments: 1 }).required()
});

const verifyOtpSchema = Joi.object({
  businessId: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const createPasswordSchema = Joi.object({
  businessId: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

const loginSchema = Joi.object({
  // Allow local domains (e.g., super@pratham.local) during development/testing
  email: Joi.string().trim().email({ tlds: { allow: false }, minDomainSegments: 1 }).required(),
  password: Joi.string().required()
});

const employeeLoginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false }, minDomainSegments: 1 }),
  phone: Joi.string().trim(),
  password: Joi.string().required(),
}).xor('email', 'phone');
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = {
  gstVerifySchema,
  gstConfirmSchema,
  contactDetailsSchema,
  verifyOtpSchema,
  createPasswordSchema,
  loginSchema,
  employeeLoginSchema,
  changePasswordSchema,
};
