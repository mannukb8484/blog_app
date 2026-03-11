const Joi = require("joi");

exports.loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    "*": "invalid email or password",
  }),
  password: Joi.string().trim().min(5).required().messages({
    "*": "invalid email or password",
  }),
});

exports.signUpSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    "*": "invalid email or password",
  }),
  password: Joi.string().trim().min(5).required().messages({
    "*": "invalid email or password",
  }),
  name: Joi.string().trim().required().messages({
    "*": "invalid email or password",
  }),
});

exports.createPostSchema = Joi.object({
  title: Joi.string().trim().min(5).messages({
    "string.min": "title too short",
    "any.required": "fill the required field",
  }),
  content: Joi.string().trim().min(5).messages({
    "string.min": "content too short",
    "any.required": "fill the required field",
  }),
  //while creating a new post image always uploaded hence put in ""req.file""" and joi only check req.body
  // image:Joi.any().optional()
});
exports.updatePostSchema = Joi.object({
  title: Joi.string().trim().min(5).messages({
    "string.min": "title too short",
    "any.required": "fill the required field",
  }),
  content: Joi.string().trim().min(5).messages({
    "string.min": "content too short",
    "any.required": "fill the required field",
  }),
  image: Joi.any().optional(), //when editing if img no change, old image in req.body as string, joi block
});
