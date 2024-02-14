import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import validationMiddleware from "@/middlewares/validation.middleware";
import { statusValidation } from "@/resources/status/status.validation";
import authMiddleware from "@/middlewares/auth.middleware";
import { status } from "@/resources/status/status.type";
import mongoose from "mongoose";
import StatusService from "@/resources/status/status.service";

class StatusController implements ControllerContract {
  /**
   * Define Path 
   */
  public path: string = "/status";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Define Services
   */
  private _statusService: StatusService = new StatusService();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Get Statuses (Minified)
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _getMinified = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const statuses: status.MinifiedData[] = await this._statusService.getMinified(req.user) as status.MinifiedData[];
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.GET,
        data: {
          statuses
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.STATUS.FAIL_GET,
      });
    }
  }

  /**
   * Get Statuses
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
      const statuses: status.Data[] = await this._statusService.get(req.user, String(req.query.q ?? ""), Number(req.query.page ?? 1)) as status.Data[];
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.GET,
        data: {
          statuses
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.STATUS.FAIL_GET,
      });
    }
  }

  /**
   * Store Status API
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
      await this._statusService.store(req.user, req.body, session);
      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: statement.STATUS.CREATED,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.STATUS.FAIL_CREATED,
      });
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Destroy Status API
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
      const id = new mongoose.mongo.ObjectId(String(req.query.id));
      session.startTransaction();
      await this._statusService.destroy(req.user, id, session);
      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.DESTROY,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Swap Status API
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
      await this._statusService.swap(req.user, firstId, firstOrder, secondId, secondOrder, session);
      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.SWAP,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.STATUS.FAIL_SWAP,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Show Status API
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
      const status: status.Data | null = await this._statusService.find(req.user, String(req.params["id"] ?? ""))

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.SHOW,
        data: {
          status,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.STATUS.FAIL_SHOW,
      });
    } 
  }

  /**
   * Update Status API
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
      await this._statusService.update(req.user, req.body.id, {
        name: req.body.name,
        description: req.body.description,
        color: req.body.color,
      });
      await session.commitTransaction();
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.STATUS.UPDATE,
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.STATUS.FAIL_UPDATE,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      authMiddleware.express,
      validationMiddleware(statusValidation.create),
      this._store
    );

    this.router.get(
      `${this.path}`,
      authMiddleware.express,
      this._get
    );

    this.router.get(
      `${this.path}/minified`,
      authMiddleware.express,
      this._getMinified
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware.express,
      this._show
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware.express,
      this._destroy
    );

    // this.router.post(
    //   `${this.path}/swap`,
    //   authMiddleware,
    //   validationMiddleware(taskValidation.swap),
    //   this._swap
    // );

    this.router.put(
      `${this.path}`,
      authMiddleware.express,
      validationMiddleware(statusValidation.update),
      this._update
    );
  }
}

export default StatusController;