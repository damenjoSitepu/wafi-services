import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
import { browserSessionPersistence, setPersistence } from "firebase/auth";
import AuthService from "@/resources/auth/auth.service";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { getAuth } from "firebase/auth";

class LoginController implements ControllerContract {
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
   * Login API
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
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.AUTH.SUCCESS_LOGIN,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
        statement: statement.AUTH.FAIL_LOGIN,
      });
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}/login`,
      this._login
    );
  }
}

export default LoginController;