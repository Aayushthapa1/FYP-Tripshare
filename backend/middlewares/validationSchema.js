import Joi from "joi";

export const registerUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    "string.base": `"fullname" should be a type of 'text'`,
    "string.empty": `"fullname" cannot be an empty field`,
    "string.min": `"fullname" should have a minimum length of {#limit}`,
    "any.required": `"fullname" is a required field`,
  }),

  userName: Joi.string().min(3).max(30).required().messages({
    "string.base": `"username" should be a type of 'text'`,
    "string.empty": `"username" cannot be an empty field`,
    "string.min": `"username" should have a minimum length of {#limit}`,
    "any.required": `"username" is a required field`,
  }),

  address: Joi.string().min(5).max(100).required().messages({
    "string.base": `"address" should be a type of 'text'`,
    "string.empty": `"address" cannot be an empty field`,
    "string.min": `"address" should have a minimum length of {#limit}`,
    "any.required": `"address" is a required field`,
  }),

  email: Joi.string().email().required().messages({
    "string.base": `"email" should be a type of 'text'`,
    "string.empty": `"email" cannot be an empty field`,
    "string.email": `"email" must be a valid email address`,
    "any.required": `"email" is a required field`,
  }),

  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.base": `"phone number" should be a type of 'text'`,
    "string.empty": `"phone number" cannot be an empty field`,
    "string.pattern.base": `"phone number" must be a valid 10-digit number`,
    "any.required": `"phone number" is a required field`,
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": `"password" should be a type of 'text'`,
    "string.empty": `"password" cannot be an empty field`,
    "string.min": `"password" should have a minimum length of {#limit}`,
    "any.required": `"password" is a required field`,
  }),

  role: Joi.string().valid("user", "driver", "admin").default("user").messages({
    "string.base": `"role" should be a type of 'text'`,
    "any.only": `"role" must be one of ['user', 'driver', 'admin']`,
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `"email" should be a type of 'text'`,
    "string.empty": `"email" cannot be an empty field`,
    "string.email": `"email" must be a valid email address`,
    "any.required": `"email" is a required field`,
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": `"password" should be a type of 'text'`,
    "string.empty": `"password" cannot be an empty field`,
    "string.min": `"password" should have a minimum length of {#limit}`,
    "any.required": `"password" is a required field`,
  }),
});

// Password reset validation schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.base": `"token" should be a type of 'text'`,
    "string.empty": `"token" cannot be an empty field`,
    "any.required": `"token" is a required field`,
  }),

  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
    "string.base": `"new password" should be a type of 'text'`,
    "string.empty": `"new password" cannot be an empty field`,
    "string.min": `"new password" should have a minimum length of {#limit}`,
    "string.pattern.base": `"new password" must contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
    "any.required": `"new password" is a required field`,
  }),

  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    "string.base": `"confirm password" should be a type of 'text'`,
    "string.empty": `"confirm password" cannot be an empty field`,
    "any.only": `"confirm password" does not match the new password`,
    "any.required": `"confirm password" is a required field`,
  }),
});