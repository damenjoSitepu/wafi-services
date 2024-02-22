import Joi from "joi";

export namespace taskValidation {
  export const create = Joi.object({
    name: Joi.string().required().max(255).messages({
      "string.empty": "Please fill the name of your task.",
    }),
    assignedAt: Joi.number().required().messages({
      "any.required": "Please fill the assigned at field.",
    }),
    microsoftIntegration: Joi.any(),
    status: Joi.string().allow(""),
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
    assignedAt: Joi.number().required().messages({
      "any.required": "Please fill the assigned at field.",
    }),
    status: Joi.string().allow(""),
  });

  export const sendTaskToMicrosoftTeams = Joi.object({
    microsoftIntegration: Joi.any(),
    name: Joi.string().required().max(255).messages({
      "string.empty": "Please fill the name of your task",
    }),
  });

  export const toggleStarred = Joi.object({
    isStarred: Joi.boolean().required(),
  });
}