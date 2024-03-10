import Joi from "joi";

export namespace featuresValidation {
  export const create = Joi.object({
    name: Joi.string().required().max(125),
    isActive: Joi.string().required(),
    parent: Joi.string().allow(""),
  });

  export const renameTitle = Joi.object({
    name: Joi.string().required().max(125),
  })
}