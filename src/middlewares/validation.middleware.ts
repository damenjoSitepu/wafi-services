import { NextFunction, Request, RequestHandler, Response } from "express";
import Joi from "joi";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";
import sanitizeHtml from 'sanitize-html';
import RequestCore from "@/utils/cores/request.core";
import { ENVIRONMENT } from "@/utils/constants/environment.constant";

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

      if (process.env.ENVIRONMENT === ENVIRONMENT.DEVELOPMENT) {
        // Development Mode

        // New Mechanism For Development Will Develop In The Future
      } else if (process.env.ENVIRONMENT === ENVIRONMENT.PRODUCTION) {
        // Production Mode

        // Api Definition Must Be Required
        if (!req.body._apiDefinition) {
          return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
            statement: statement.EXPRESS_APP.INVALID_REQUEST,
          });
        }

        // Request Core To Decypt The Api Payloads
        new RequestCore(req.body._apiDefinition, req);
      } else {
        // Error When Environment Was Not Identified
        return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
          statement: statement.EXPRESS_APP.INVALID_REQUEST,
        });
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
      });
    }
  }
}

export default validationMiddleware;