import Joi from "joi";

export namespace authValidation {
  export const signup = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
    password: Joi.string().min(8).allow("").max(100),
    passwordConfirmation: Joi.string().allow("").max(100),
    isAgreed: Joi.boolean().required(),
  });

  export const sendVerificationLinkToEmail = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
  })
}