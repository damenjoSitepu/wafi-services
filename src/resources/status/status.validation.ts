import Joi from "joi";

export namespace statusValidation {
  export const create = Joi.object({
    name: Joi.string().required().max(255).messages({
      "string.empty": "Please fill the name of your task.",
    }),
    description: Joi.string().max(255).messages({
      "string.max": "Maximum length for description is 255 characters.",
    }),
    color: Joi.string().max(15).messages({
      "string.max": "Maximum length for color is 15 characters.",
    }),
  }); 

  export const swap = Joi.object({
    firstId: Joi.string().required(),
    firstOrder: Joi.number().required(),
    secondId: Joi.string().required(),
    secondOrder: Joi.number().required(),
  })

  export const update = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required().max(255).messages({
      "string.empty": "Please fill the name of your task.",
    }),
    description: Joi.string().max(255).messages({
      "string.max": "Maximum length for description is 255 characters.",
    }),
    color: Joi.string().max(15).messages({
      "string.max": "Maximum length for color is 15 characters.",
    }),
  });
}