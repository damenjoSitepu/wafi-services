import { NextFunction, Request, RequestHandler, Response } from "express";
import Joi from "joi";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";

function validationMiddleware(schema: Joi.Schema): RequestHandler {
  return async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };
    try {
      const value = await schema.validateAsync(
        req.body,
        validationOptions
      );
      req.body = value;
      next();
    } catch (e: any) {
      const errors: { key: string, value: string }[] = [];

      e.details.forEach((error: Joi.ValidationErrorItem) => {
        errors.push({
          key: String(error.context?.key || ""),
          value: String(error.message).replace(/^\\|"|\\$/g,""),
        }); 
      });
        
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.EXPRESS_APP.INVALID_REQUEST,
        errors
      })
    }
  }
}

export default validationMiddleware;