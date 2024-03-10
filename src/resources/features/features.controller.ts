import validationMiddleware from "@/middlewares/validation.middleware";
import { FeaturesModel } from "@/resources/features/features.model";
import { NextFunction, Request, Response, Router } from "express";
import FeaturesService from "./features.service";
import authMiddleware from "@/middlewares/auth.middleware";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import { statement } from "@/utils/constants/statement.constant";
import { featuresValidation } from "@/resources/features/features.validation";
import mongoose from "mongoose";
import { features } from "@/resources/features/features.type";
import CollectionService from "@/utils/services/collection.service";

class FeaturesController {
  /**
   * Define Path 
   */
  public path: string = "/features";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Services
   */
  private _featuresService: FeaturesService = new FeaturesService();
  private _collectionService: CollectionService = new CollectionService();


  /**
   * Models
   */
  private _featuresModel = FeaturesModel;

  /**
   * Initialize Services and Dependencies
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Get Features API
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
      let features: features.Data[] = [];
      if (req.query.fid) {
        features = await this._featuresService.getChild(String(req.query.fid ?? ""));
      } else {
        features = await this._featuresService.getByDefault(req.user);
      }

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_GET,
        data: {
          features: this._collectionService.detachCredential(["id","_id","childIds"],features),
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Store The Features
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   */
  private _store = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    // Feature Name Must Be Unique
    if (await this._featuresService.checkIsRegistered(req.user, req.body.name)) {
      return res.status(httpResponseStatusCode.FAIL.CONFLICT).json({
        statement: statement.FEATURES.FAIL_STORE_UNIQUE_NAME_BLOCKER,
      });
    }
    
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();
      const feature: features.Data = await this._featuresService.store(req.user, req, session);
      await session.commitTransaction();

      let parentFeature: any;
      if (req.body.parent) {
        parentFeature = await this._featuresService.findParent(String(req.body.parent));
      }
      
      return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
        statement: statement.FEATURES.SUCCESS_STORE,
        data: {
          feature: this._collectionService.detachCredential(["_id", "id", "childIds", "uid", "createdAt", "updatedAt", "modifiedBy"], [feature])[0],
          parentFeature: this._collectionService.detachCredential(["_id", "id", "childIds"], [parentFeature])[0]
        },
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Find The Parent Of Feature
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  public _findParent = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const feature: features.Data = await this._featuresService.findParent(String(req.params.fid));
      if (!feature) throw new Error();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_FIND,
        data: {
          feature: this._collectionService.detachCredential(["_id", "id", "childIds"], [feature])[0],
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.FEATURES.FAIL_FIND,
      });
    }
  }

  /** 
   * Update Active Status From Certain Feature
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _toggleStatus = async(
    req: Request,
    res: Response,
    next: NextFunction 
  ): Promise<Response | void> => {
    try {
      const isActive: boolean = await this._featuresService.toggleStatus(req.params.fid);

      const feature: features.Data = await this._featuresService.findById(req.params.fid);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_TOGGLE_STATUS.replace("{status}", isActive ? "Activated" : "Deactivated"),
        data: {
          feature: this._collectionService.detachCredential(["_id", "id", "childIds"], [feature])[0],
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.FEATURES.FAIL_TOGGLE_STATUS,
      });
    }
  }



  /**
   * Initialize Routes
   * 
   * @returns {void}
   */
  private _initializeRoutes(): void {
    // Get Features
    this.router.get(
      `${this.path}`,
      authMiddleware.express,
      this._get,
    );

    // Store Features
    this.router.post(
      `${this.path}`,
      authMiddleware.express,
      validationMiddleware(featuresValidation.create),
      this._store,
    );

    // Update Active Status From Certain Feature
    this.router.post(
      `${this.path}/:fid/toggle-status`,
      authMiddleware.express,
      this._toggleStatus
    );

    // Get Feature
    this.router.get(
      `${this.path}/:fid/parent`,
      authMiddleware.express,
      this._findParent,
    );
  }
}

export default FeaturesController;