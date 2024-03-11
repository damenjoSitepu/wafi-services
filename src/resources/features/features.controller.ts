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

    // Check if isActive request is true and have parent which their status was inactived, we need to block it
    if ((req.body.isActive === "true" ? true : false) && req.body.parent) {
      const checkParentIsActive: features.Data = await this._featuresService.findParent(req.body.parent);
      if (checkParentIsActive && !checkParentIsActive.isActive) {
        return res.status(httpResponseStatusCode.FAIL.FORBIDDEN).json({
          statement: statement.FEATURES.FAIL_STORE_STATUS_HIGHER_LEVEL_MODULE_CURRENTLY_INACTIVE,
        });
      } else if (!checkParentIsActive) {
        return res.status(httpResponseStatusCode.FAIL.NOT_FOUND).json({
          statement: statement.FEATURES.FAIL_STORE_PARENT_NOT_FOUND,
        });
      }
    }
    
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();

    try {
      session.startTransaction();
      const feature: features.Data = await this._featuresService.store(req.user, req, session);
      await this._featuresService.settingDashboard({
        key: "totalFeatures",
        title: "Total Features",
        isInc: true,
      }, session);
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
      // Check The Feature Is Exists Or Not
      const feature: features.Data = await this._featuresService.findById(req.params.fid);
      if (!feature) {
        return res.status(httpResponseStatusCode.FAIL.NOT_FOUND).json({
          statement: statement.FEATURES.FAIL_FIND
        });
      }

      // If the feature have parent, we need to check the parent first. If we want to make this feature activate, also make sure the parent is active too
      if (feature.parent) {
        const parentFeature: features.Data = await this._featuresService.findParent(feature.parent);
        if (parentFeature && !parentFeature.isActive) {
          return res.status(httpResponseStatusCode.FAIL.FORBIDDEN).json({
            statement: statement.FEATURES.FAIL_TOGGLE_STATUS_HIGHER_LEVEL_MODULE_CURRENTLY_INACTIVE,
          });
        }
      }

      const isActive: boolean = await this._featuresService.toggleStatus(feature, req.params.fid);

      const features: features.Data[] = await this._featuresService.findParentAndTheirAllChildren(req.params.fid);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_TOGGLE_STATUS.replace("{status}", isActive ? "Activated" : "Deactivated"),
        data: {
          features: this._collectionService.detachCredential(["_id", "id", "childIds"], features),
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.FEATURES.FAIL_TOGGLE_STATUS,
      });
    }
  }

  /**
   * Rename The Feature Title API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _renameTitle = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      // Find The Existing Feature Data
      const feature: features.Data = await this._featuresService.findById(req.params.fid);
      if (!feature) {
        return res.status(httpResponseStatusCode.FAIL.NOT_FOUND).json({
          statement: statement.FEATURES.FAIL_FIND,
        });
      }

      // Check If Name, Was Same As Before, We Know That No Changes Happen
      if (feature.name === req.body.name) {
        return res.status(httpResponseStatusCode.FAIL.NOT_MODIFIED).json({
          statement: statement.FEATURES.RENAME_TITLE_NOTHING_CHANGES,
        });
      }

      // Check If The Feature Already Registered OR Not (Base On name Uniqueness)
      const checkIsRegistered: boolean = await this._featuresService.checkIsRegistered(req.user, req.body.name, String(req.params.fid));
      if (checkIsRegistered) {
        return res.status(httpResponseStatusCode.FAIL.CONFLICT).json({
          statement: statement.FEATURES.FAIL_STORE_UNIQUE_NAME_BLOCKER,
        });
      }

      // Update The Title
      await this._featuresService.renameTitle(String(req.params.fid), String(req.body.name));

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_RENAME_TITLE,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: e.message,
      });
    }
  }

  /**
   * Delete Feature And Its Own Depedencies 
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _delete = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();
    
    try {
      // Make sure that feature is exists
      const feature: features.Data = await this._featuresService.findById(req.params.fid);
      if (!feature) {
        return res.status(httpResponseStatusCode.FAIL.NOT_FOUND).json({
          statement: statement.FEATURES.FAIL_FIND,
        });
      }

      // Make Sure That feature want to deleted and its own dependencies (if available) is exists (2nd)
      const deletedFeaturesFid: string[] = (await this._featuresService.findParentAndTheirAllChildren(req.params.fid)).map((feature: features.Data) => feature.fid);
      if (deletedFeaturesFid.length === 0) {
        return res.status(httpResponseStatusCode.FAIL.NOT_FOUND).json({
          statement: statement.FEATURES.FAIL_FIND,
        });
      }

      session.startTransaction();
      // Delete the feature and its own all child ids.
      await this._featuresService.delete(deletedFeaturesFid, session);
      await this._featuresService.deleteChildIds(feature, session);
      await session.commitTransaction();

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_DELETE,
        data: {
          deletedFeaturesIds: deletedFeaturesFid,
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
   * Get Features Analytics
   * 
   * @param {Request} req
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _getAnalytics = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const dashboards: features.DashboardData[] = await this._featuresService.getDashboard(["totalFeatures"]);
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.FEATURES.SUCCESS_GET_ANALYTICS,
        data: {
          analytics: this._collectionService.detachCredential(["_id","id"], dashboards),
        }
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.FEATURES.FAIL_GET_ANALYTICS,
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

    // Delete Feature
    this.router.delete(
      `${this.path}/:fid`,
      authMiddleware.express,
      this._delete,
    );

    // Update Feature Name
    this.router.put(
      `${this.path}/:fid/rename-title`,
      authMiddleware.express,
      validationMiddleware(featuresValidation.renameTitle),
      this._renameTitle,
    );

    // Update Active Status From Certain Feature
    this.router.post(
      `${this.path}/:fid/toggle-status`,
      authMiddleware.express,
      this._toggleStatus,
    );

    // Get Feature Dashboard 
    this.router.get(
      `${this.path}/analytics`,
      authMiddleware.express,
      this._getAnalytics,
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