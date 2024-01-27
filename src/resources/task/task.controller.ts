import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
import TaskService from "@/resources/task/task.service";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import validationMiddleware from "@/middlewares/validation.middleware";
import { taskValidation } from "@/resources/task/task.validation";
import authMiddleware from "@/middlewares/auth.middleware";
import { task } from "./task.type";
import mongoose from "mongoose";

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
      const tasks: task.Data[] = await this._taskService.get(req.user, String(req.query.q ?? "")) as task.Data[];
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
    try {
      await this._taskService.store(req.user,req.body);
      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: statement.TASK.CREATED,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_CREATED,
      });
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
    try {
      const id = new mongoose.mongo.ObjectId(String(req.query.id));
      await this._taskService.destroy(req.user, id);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.TASK.DESTROY,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.TASK.FAIL_DESTROY,
      });
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(taskValidation.create),
      this._store
    );

    this.router.get(
      `${this.path}`,
      authMiddleware,
      this._get
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      this._destroy
    );
  }
}

export default TaskController;