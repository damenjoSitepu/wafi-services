import { statement } from "@/utils/constants/statement.constant";
import { user } from "@/resources/user/user.type";
import { FeaturesModel } from "@/resources/features/features.model";
import { Request } from "express";
const { v4: uuidv4 } = require('uuid');
import { features } from "@/resources/features/features.type";
import mongoose from "mongoose";
import AuthService from "@/utils/services/auth.service";

class FeaturesService {
  /**
   * Models
   */
  private _featuresModel = FeaturesModel;

  /**
   * Check Is Feature Name Is Exists Or Not (Case Insensitive Checker)
   * 
   * @param {user.Data} user 
   * @param {string} featureName 
   * @returns {Promise<boolean>}
   */
  public async checkIsRegistered(user: user.Data, featureName: string): Promise<boolean> {
    try {
      const check: features.MinifiedData | null = await this._featuresModel.findOne({
        uid: user.uid,
        name: { $regex: featureName, $options: "i" }
      })

      return check ? true : false;
    } catch (e: any) {
      throw new Error(statement.FEATURES.FAIL_STORE_UNIQUE_NAME_BLOCKER);
    }
  }

  /**
   * Find Features Parent By Feature ID (Minified)
   * 
   * @param {user.Data} user 
   * @param {string} fid 
   * @returns {Promise<features.MinifiedData>}
   */
  public async findParentLite(user: user.Data, fid: string): Promise<features.MinifiedData> {
    try { 
      return await this._featuresModel.findOne({
        uid: user.uid,
        fid,
      }).select({ _id: 1, fid: 1 });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Features Parent By Feature ID 
   * 
   * @param {string} fid 
   * @returns {Promise<features.Data>} 
   */
  public async findParent(fid: string): Promise<features.Data> {
    try {
      return await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        fid
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1 });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Append Child ID To Parent Feature
   * 
   * @param {user.Data} user 
   * @param {string} _parentId 
   * @param {string} _childId
   * @param {mongoose.mongo.ClientSession} session
   * @returns {Promise<void>}
   */
  public async appendChildIdToParent(user: user.Data, _parentId: string, _childId: string, session: mongoose.mongo.ClientSession): Promise<void> {
    try { 
      // If available, push the child id into the parent feature
      await this._featuresModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(_parentId),
      }, {
        updatedAt: Date.now(),
        $push: {
          childIds: _childId,
        },
      }, {
        session
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Stores The Features
   * 
   * @param {user.Data} user 
   * @param {Request} req 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<features.Data>}
   */
  public async store(user: user.Data, req: Request, session: mongoose.mongo.ClientSession): Promise<features.Data> {
    try {
      const child = await this._featuresModel.create([
        {
          uid: user.uid,
          fid: uuidv4(),
          name: req.body.name,
          parent: !req.body.parent ? null : req.body.parent,
          isActive: req.body.isActive === "true" ? true : false,
          childIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          modifiedBy: user.uid,
        }
      ], { session });

      // Find Parent And Fill It With Real ID - Req Body Parent Also Is FID
      if (req.body.parent) {
        const parent = await this.findParentLite(user, req.body.parent);
        if (parent) {
          await this.appendChildIdToParent(user, parent._id, child[0]._id, session);
        }
      }

      return child[0];
    } catch (e: any) {
      throw new Error(statement.FEATURES.FAIL_STORE);
    }
  }

  /**
   * Get User Data ByDefault
   * 
   * @param {user.Data} user 
   * @returns {Promise<features.Data[]>}
   */
  public async getByDefault(user: user.Data): Promise<features.Data[]> {
    try {
      return await this._featuresModel.find({
        uid: user.uid,
        parent: null,
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1 });
    } catch (e: any) {
      throw new Error(statement.FEATURES.FAIL_GET);
    }
  }

  /**
   * Get Child Features From The Parent
   * 
   * @param {string} fid 
   * @returns {Promise<features.Data[]>}
   */
  public async getChild(fid: string): Promise<features.Data[]> {
    try {
      const parentFeature: features.Data = await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        fid,
      }).select({ id: 1, childIds: 1 });

      if (!parentFeature) throw new Error();
      if (parentFeature.childIds.length === 0) throw new Error();
      
      return await this._featuresModel.find({
        uid: AuthService.getInstance().user().uid,
        _id: { 
          $in: parentFeature.childIds,
        },
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1 });
    } catch (e: any) {
      throw new Error(statement.FEATURES.FAIL_GET);
    }
  }

  /**
   * Toggle The Status And Set It As Inactive / Active
   * 
   * @param {string} fid 
   * @returns {Promise<boolean>}
   */
  public async toggleStatus(fid: string): Promise<boolean> {
    try {
      const feature: features.Data = await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        fid,
      }).select({ id: 1, isActive: 1 });

      // Validation When Feature Doesn't Exists
      if (!feature) throw new Error();

      // Reverse The Is Active To Inactive / Active
      const isActive = !feature.isActive;

      await this._featuresModel.updateOne({
        uid: AuthService.getInstance().user().uid,
        fid
      }, {
        isActive,
        updatedAt: Date.now(),
      });

      return isActive;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Feature By ID
   * 
   * @param {string} fid 
   * @returns {Promise<features.Data>}
   */
  public async findById(fid: string): Promise<features.Data> {
    try {
      return await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        fid,
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1 })
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default FeaturesService;