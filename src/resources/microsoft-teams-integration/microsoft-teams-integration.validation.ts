import Joi from "joi";

export namespace microsoftTeamsIntegrationValidation {
  export const create = Joi.object({
    clientId: Joi.string().required().max(512).messages({
      "string.empty": "Please fill the Client ID.",
    }),
    tenantId: Joi.string().required().max(512).messages({
      "string.empty": "Please fill the Tenant ID.",
    }),
  }); 

  export const update = Joi.object({
    clientId: Joi.string().required().max(512).messages({
      "string.empty": "Please fill the Client ID.",
    }),
    tenantId: Joi.string().required().max(512).messages({
      "string.empty": "Please fill the Tenant ID.",
    }),
  }); 
}