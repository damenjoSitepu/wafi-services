import authMiddleware from "@/middlewares/auth.middleware";
import { NextFunction, Request, Response, Router } from "express";
import { activityLogs } from "./activity-logs.type";
import ActivityLogsService from "@/resources/activity-logs/activity-logs.service";
import { statement } from "@/utils/constants/statement.constant";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";

class ActivityLogsController {
  /**
   * Define Path 
   */
  public path: string = "/activity-logs";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Services
   */
  private _activityLogsService: ActivityLogsService = new ActivityLogsService();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Get Activity Logs
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _get = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const activityLogs: activityLogs.Data[] = await this._activityLogsService.get(req.user, Number(req.query.page ?? 1), req);
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.ACTIVITY_LOGS.SUCCESS_GET,
        data: {
          activityLogs,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.ACTIVITY_LOGS.FAIL_GET,
      });
    }
  }

  /**
   * Show Activity Log API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _show = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const activityLog: activityLogs.Data | null = await this._activityLogsService.find(req.user, String(req.params["id"] ?? ""));
      if (!activityLog) throw new Error();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.ACTIVITY_LOGS.SUCCESS_SHOW,
        data: {
          activityLog,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.ACTIVITY_LOGS.FAIL_SHOW,
      });
    } 
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      authMiddleware.express,
      this._get
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware.express,
      this._show
    );
  }
}

export default ActivityLogsController;