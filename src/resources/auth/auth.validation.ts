import Joi from "joi";

export namespace authValidation {
  export const signup = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
    password: Joi.string().min(8).allow("").max(100),
    passwordConfirmation: Joi.string().allow("").max(100),
    isAgreed: Joi.string().required(),
  });

  export const login = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
    password: Joi.string().required().min(8).max(100),
  });

  export const changePassword = Joi.object({
    immediately: Joi.string().required().max(100).messages({
      "string.empty": "Unavailabled token",
    }),
    password: Joi.string().required().min(8).allow("").max(100),
    passwordConfirmation: Joi.string().required().allow("").max(100),
  })

  export const resetPasswordVerification = Joi.object({
    immediately: Joi.string().required().max(100).messages({
      "string.empty": "Unavailabled token",
    }),
  });

  export const resetPassword = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
  });

  export const sendVerificationLinkToEmail = Joi.object({
    email: Joi.string().required().max(100).messages({
      "string.empty": "Please fill your email",
    }),
  })
}