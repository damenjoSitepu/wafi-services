import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
import TaskService from "@/resources/task/task.service";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { customStatusCode } from "@/utils/constants/custom-status-code.constant";
import validationMiddleware from "@/middlewares/validation.middleware";
import { taskValidation } from "@/resources/task/task.validation";
import authMiddleware from "@/middlewares/auth.middleware";
import { task } from "./task.type";
import mongoose from "mongoose";
import MicrosoftTeamsIntegrationService from "@/resources/microsoft-teams-integration/microsoft-teams-integration.service";
import ActivityLogsService from "@/resources/activity-logs/activity-logs.service";
import { globalAppPermission } from "@/utils/permissions/global-app.permission";
import FeaturesService from "@/resources/features/features.service";
import { features } from "../features/features.type";

class TaskController implements ControllerContract {
  /**
   * Define Path 
   */
  public path: string = "/task";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Define Services
   */
  private _taskService: TaskService = new TaskService();
  private _activityLogsService: ActivityLogsService = new ActivityLogsService();
  private _featuresService: FeaturesService = new FeaturesService();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Get Tasks
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
      // Feature Permission Checker
      const permission = await this._featuresService.checkGlobalAppFeatureStatus(globalAppPermission.TASK.GET);
      if (!permission) {
        return this._featuresService.handleErrorUnauthorizedToAccessFeature(globalAppPermission.TASK.GET, res);
      }
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.APP.NO_FEATURE_CHECKER,
      });
    }

    try {
      const tasks: task.Data[] = await this._taskService.get(req.user, String(req.query.q ?? ""), Number(req.query.page ?? 1), req) as task.Data[];
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.GET,
        data: {
          tasks
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_GET,
      });
    }
  }

  /**
   * Send Task To Microsoft Teams Chat
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _sendToMicrosoftTeams = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      await new MicrosoftTeamsIntegrationService().sendTaskViaChat(req.body, req.user);

      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: statement.TASK.SEND_TO_MICROSOFT_TEAMS,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_SEND_TO_MICROSOFT_TEAMS,
      });
    }
  }

  /**
   * Store Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _store = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();
      
      const request = req.body as task.Request;

      const task: any = await this._taskService.store(req.user, request, session);

      await this._taskService.createActivityLog(
        task[0] as task.Data,
        req.user,
        req.user,
        req.user,
        session,
        "Create",
        `Successfully creating your task with name ${task[0].name}`
      );

      await new MicrosoftTeamsIntegrationService().sendTaskViaChat(req.body, req.user);

      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: statement.TASK.CREATED,
        data: {
          task: task[0],
        },
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_CREATED,
      });
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Destroy Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _destroy = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();

      const id = new mongoose.mongo.ObjectId(String(req.query.id));
      const task: any = await this._taskService.destroy(req.user, id);

      await this._taskService.createActivityLog(
        task as task.Data,
        req.user,
        req.user,
        req.user,
        session,
        "Delete",
        `Successfully deleting your task with name ${task.name}`
      );

      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.DESTROY,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_DESTROY,
      });
    }
  }

  /**
   * Swap Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _swap = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();
      const { firstId, firstOrder, secondId, secondOrder } = req.body;
      await this._taskService.swap(req.user, firstId, firstOrder, secondId, secondOrder, session);
      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.SWAP,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_SWAP,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Show Task API
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
      const task: task.Data | null = await this._taskService.find(req.user, String(req.params["id"] ?? ""))
      if (!task) throw new Error();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.SHOW,
        data: {
          task,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.TASK.FAIL_SHOW,
      });
    } 
  }

  /**
   * Update Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _update = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();
      const oldTask: any = await this._taskService.find(req.user, req.body.id);

      if (!oldTask) throw new Error();

      await this._taskService.update(req.user, req.body.id, {
        name: req.body.name,
        assignedAt: req.body.assignedAt,
        status: req.body.status
      });
      const task: any = await this._taskService.find(req.user, req.body.id);

      await this._taskService.createActivityLog(
        task as task.Data,
        req.user,
        req.user,
        req.user,
        session,
        "Update",
        `Successfully Updating your task with name ${task.name}`,
        oldTask as task.Data,
      );

      await session.commitTransaction();
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.UPDATE,
        data: {
          task,
        },
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_UPDATE,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Toggle Starred Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _toggleStarred = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();

      const id = new mongoose.mongo.ObjectId(String(req.params["id"] ?? ""));

      const oldTask: any = await this._taskService.find(req.user, id.toString());

      if (!oldTask) throw new Error();

      const task: any = await this._taskService.toggleStarred(req.user, id, req.body.isStarred);

      const message: string = `Successfully ${task.isStarred ? 'add to starred' : 'remove from starred'} task with name ${task.name}`;

      await this._taskService.createActivityLog(
        task as task.Data,
        req.user,
        req.user,
        req.user,
        session,
        "Update",
        message,
        oldTask
      );

      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: message,
        data: {
          task,
        }
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_TOGGLE_STARRED,
      });
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      authMiddleware.express,
      validationMiddleware(taskValidation.create),
      this._store
    );

    this.router.put(
      `${this.path}/:id/toggle-starred`,
      authMiddleware.express,
      validationMiddleware(taskValidation.toggleStarred),
      this._toggleStarred
    );

    this.router.post(
      `${this.path}/send/microsoft-teams`,
      authMiddleware.express,
      validationMiddleware(taskValidation.sendTaskToMicrosoftTeams),
      this._sendToMicrosoftTeams,
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware.express,
      this._show
    );

    this.router.get(
      `${this.path}`,
      authMiddleware.express,
      this._get
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware.express,
      this._destroy
    );

    this.router.post(
      `${this.path}/swap`,
      authMiddleware.express,
      validationMiddleware(taskValidation.swap),
      this._swap
    );

    this.router.put(
      `${this.path}`,
      authMiddleware.express,
      validationMiddleware(taskValidation.update),
      this._update
    );
  }
}

export default TaskController;