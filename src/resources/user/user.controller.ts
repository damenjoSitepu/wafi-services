import { NextFunction, Router, Request, Response } from "express";
import UserService from "@/resources/user/user.service";
import authMiddleware from "@/middlewares/auth.middleware";
import { user } from "@/resources/user/user.type";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";

class UserController {
  /**
   * Define Path 
   */
  public path: string = "/user";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Define Services
   */
  private _userService: UserService = new UserService();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Show User API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _profile = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const profile: user.Data | null = await this._userService.find(req.user);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.USER.SUCCESS_GET_PROFILE,
        data: {
          profile,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.USER.FAIL_GET_PROFILE,
      });
    } 
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.get(
      `${this.path}/profile`,
      authMiddleware.express,
      this._profile
    );
  }
}

export default UserController;