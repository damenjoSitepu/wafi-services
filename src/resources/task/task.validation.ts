import Joi from "joi";

export namespace taskValidation {
  export const create = Joi.object({
    name: Joi.string().required().max(255).messages({
      "string.empty": "Please fill the name of your task.",
    }),
    isComplete: Joi.boolean().required().messages({
      "any.required": "Please define is this task was completed or not.",
    }),
    assignedAt: Joi.number().required().messages({
      "any.required": "Please fill the assigned at field.",
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
      "string.empty": "Please fill the name of your task",
    }),
    isComplete: Joi.boolean().required().messages({
      "any.required": "Please define is this task was completed or not.",
    }),
    assignedAt: Joi.number().required().messages({
      "any.required": "Please fill the assigned at field.",
    }),
  });
}