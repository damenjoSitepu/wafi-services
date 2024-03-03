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
import { user } from "@/resources/user/user.type";
import UserService from "@/resources/user/user.service";
import CryptoService from "@/utils/services/crypto.service";
import authMiddleware from "@/middlewares/auth.middleware";

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
  private _userService: UserService = new UserService();
  
  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Verify The Access Token
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _verifyACT = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_ACCESSING_SOURCE,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
        statement: statement.AUTH.FAIL_ACCESSING_SOURCE,
      });
    }
  }

  /**
   * Login Functionality
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _login = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const accessToken: string = await this._authService.login(req.body.email, req.body.password);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_LOGIN,
        data: {
          _act: CryptoService.getInstance().encryptText(accessToken),
        }
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
        statement: statement.AUTH.FAIL_LOGIN,
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
    // Is Agreement Field
    if (!(req.body.isAgreed === "true" ? true : false)) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.AUTH.FAIL_SIGN_UP_PLEASE_FILL_IS_AGREED_FIELD,
      });
    }

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
   * Reset Password Verification
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _resetPasswordVerification = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const result = await this._authService.verifyResetPasswordToken(String(req.body.immediately ?? ""));

      if (!result) throw new Error(statement.AUTH.FAIL_VERIFY_RESET_PASSWORD);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_VERIFY_RESET_PASSWORD, 
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.AUTH.FAIL_VERIFY_RESET_PASSWORD,
      });
    }
  }

  /**
   * Send Reset Password Link API Functionality
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _sendResetPasswordLink = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const user: user.Data | null = await this._userService.findByEmail(req.body.email);
      if (!user) throw new Error(statement.USER.FAIL_FIND_BY_EMAIL);

      await this._authService.sendResetPasswordLink(user);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_SENT_RESET_PASSWORD_LINK,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Change Password API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response \ void>}
   */
  private _changePassword = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (req.body.password !== req.body.passwordConfirmation) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.AUTH.FAIL_SIGN_UP_PASSWORD_DOESNT_MATCH,
      });
    }

    const session: mongoose.mongo.ClientSession = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await this._authService.verifyResetPasswordToken(String(req.body.immediately ?? ""));

      if (!result) throw new Error(statement.AUTH.FAIL_VERIFY_RESET_PASSWORD);

      await this._authService.changePassword(req.body.immediately ?? "");

      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_CHANGE_PASSWORD,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    // Login
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(authValidation.login),
      this._login
    );

    // Verify Token
    this.router.get(
      `${this.path}/verify-act`,
      authMiddleware.express,
      this._verifyACT
    );

    this.router.post(
      `${this.path}/change-password`,
      validationMiddleware(authValidation.changePassword),
      this._changePassword
    );

    this.router.post(
      `${this.path}/send-reset-password-link`,
      validationMiddleware(authValidation.resetPassword),
      this._sendResetPasswordLink
    );

    this.router.post(
      `${this.path}/reset-password-verification`,
      validationMiddleware(authValidation.resetPasswordVerification),
      this._resetPasswordVerification
    )

    // Sign Up
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(authValidation.signup),
      this._signup
    );

    // User Verification
    this.router.get(
      `${this.path}/user-verification`,
      this._userVerification
    );

    // Send Verification Link
    this.router.post(
      `${this.path}/send-verification-link`,
      validationMiddleware(authValidation.sendVerificationLinkToEmail),
      this._sendVerificationLink
    );
  }
}

export default AuthController;