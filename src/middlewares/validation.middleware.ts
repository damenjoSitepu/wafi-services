import { NextFunction, Request, RequestHandler, Response } from "express";
import Joi from "joi";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";
import sanitizeHtml from 'sanitize-html';

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
      for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
      }

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