import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { NextFunction, Router, Response, Request } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { authValidation } from "@/resources/auth/auth.validation";
import validationMiddleware from "@/middlewares/validation.middleware";
import AuthService from "@/resources/auth/auth.service";
import { express } from "@/utils/constants/express.constant";
import mongoose from "mongoose";

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
   * Services
   */
  private _authService: AuthService = new AuthService();
  
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
   * Sign Up API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _signup = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (req.body.password) {
      if (!req.body.passwordConfirmation) {
        return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
          statement: statement.AUTH.FAIL_SIGN_UP_MISSING_PASSWORD_CONFIRMATION,
        });
      }
      if (req.body.password !== req.body.passwordConfirmation) {
        return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
          statement: statement.AUTH.FAIL_SIGN_UP_PASSWORD_DOESNT_MATCH,
        });
      }
    }

    if (!req.body.isAgreed) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.AUTH.FAIL_SIGN_UP_NOT_AGREED,
      });
    }

    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();

      const { isAlreadySended, user, oneTimeDefPass } = await this._authService.signUp(req, session);

      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: isAlreadySended? statement.AUTH.VERIFY_USER_LINK_ALREADY_SENT : statement.AUTH.SUCCESS_SIGN_UP,
        data: {
          isAlreadySended,
          user,
          oneTimeDefPass,
        },
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Send Verification Link URL 
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _sendVerificationLink = async(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { isAlreadySended, user } = await this._authService.sendVerificationLinkToEmail(req);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_SENT_VERIFICATION_LINK,
        data: {
          isAlreadySended,
          user,
        },
      })
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * User Sign Up Verification
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   */
  private _userVerification = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      await this._authService.verifyUser(String(req.query.immediately ?? ""));
      
      return res.set(express.header.NoCache).redirect(httpResponseStatusCode.SUCCESS.PERMANENT_REDIRECT, String(process.env.GMAIL_SIGN_UP_USER_REDIRECT_URL_TO_WEB_APP) + "true");
    } catch (e: any) {
      return res.set(express.header.NoCache).redirect(httpResponseStatusCode.SUCCESS.PERMANENT_REDIRECT, String(process.env.GMAIL_SIGN_UP_USER_REDIRECT_URL_TO_WEB_APP) + "false");
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

    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(authValidation.signup),
      this._signup
    );

    this.router.get(
      `${this.path}/user-verification`,
      this._userVerification
    );

    this.router.post(
      `${this.path}/send-verification-link`,
      validationMiddleware(authValidation.sendVerificationLinkToEmail),
      this._sendVerificationLink
    );
  }
}

export default AuthController;