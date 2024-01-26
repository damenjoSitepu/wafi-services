import Joi from "joi";

export namespace taskValidation {
  export const create = Joi.object({
    name: Joi.string().required(),
    order: Joi.number().required(),
  }); 
}