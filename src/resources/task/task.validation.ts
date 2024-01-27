import Joi from "joi";

export namespace taskValidation {
  export const create = Joi.object({
    name: Joi.string().required(),
    order: Joi.number().required(),
  }); 

  export const swap = Joi.object({
    firstId: Joi.string().required(),
    firstOrder: Joi.number().required(),
    secondId: Joi.string().required(),
    secondOrder: Joi.number().required(),
  })
}