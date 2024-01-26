import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { NextFunction, Router, Response, Request } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";


class AuthController {
  /**
   * Define Path 
   */
  public path: string = "/auth";

  /**
   * Define Router
   */
  public router: Router = Router();
  
  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Verify Token
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _ = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const decodedIdToken: DecodedIdToken = await FirebaseService.getInstance().getFirebaseAdmin().auth().verifyIdToken(req.body.token);
      if (!decodedIdToken) {
        throw new Error();
      }

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_LOGIN,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
        statement: statement.AUTH.FAIL_ACCESSING_SOURCE,
      });
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      this._
    );
  }
}

export default AuthController;