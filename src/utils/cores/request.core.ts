import { Request } from "express";
import CryptoService from "@/utils/services/crypto.service";

class RequestCore {
  /**
   * Mapper Definitions
   */
  public mapperDefinitions: { [key: string]: (req: Request) => void } = {
    "WAFI/WEB-APP/AUTH/SIGN-UP": (req) => CryptoService.getInstance().decryptPayload(req, {
      "_x": "email",
      "_m": "password",
      "_l": "passwordConfirmation",
      "_r": "isAgreed",
    }),
    "WAFI/WEB-APP/AUTH/SEND-VERIFICATION-LINK": (req) => CryptoService.getInstance().decryptPayload(req, {
      "_lbn": "email",
    }), 
    "WAFI/WEB-APP/AUTH/LOGIN": (req) => CryptoService.getInstance().decryptPayload(req, {
      "_sa": "email",
      "_pzn": "password",
    }),
  };

  /**
   * Declare The Api Definitions To Define Which Mapper Will Be Executed
   * 
   * @param {string} apiDefinition 
   * @param {Request} req
   */
  public constructor(apiDefinition: string, req: Request) {
    this.mapperDefinitions[apiDefinition](req);
  }
}

export default RequestCore;