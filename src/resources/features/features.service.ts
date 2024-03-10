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
      }).select({ _id: 1, fid: 1, parent: 1, childIds: 1 });
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
   * @param {string[]} _allParentsFid
   * @param {mongoose.mongo.ClientSession} session
   * @returns {Promise<void>}
   */
  public async appendChildIdToParent(user: user.Data, _parentId: string, _childId: string, _allParentsFid: string[], session: mongoose.mongo.ClientSession): Promise<void> {
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

      if (_allParentsFid.length > 0) {
        // Update All Parent And Loop Up To Update Their Each allChildIds column
        await this._featuresModel.updateMany({
          uid: user.uid,
          fid: {
            $in: _allParentsFid,
          },
        }, {
          updatedAt: Date.now(),
          $push: {
            allChildIds: _childId,
          },
        }, {
          session
        });
      }
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
        const allParent: { fid: string, parent: string }[] = [];
        let i: number = 0;

        const parent = await this.findParentLite(user, req.body.parent);

        while (true) {
          if (allParent.length === 0) {
            // Parent Must be found on req.body.parent, or it will throws error
            if (!parent) throw new Error();
            allParent.push({ fid: parent.fid, parent: parent.parent });
            continue;
          }

          // When Parent Is Empty, Please Break This While Loop
          if (!allParent[i].parent) {
            break;
          }

          const detectParent: features.MinifiedData = await this.findParentLite(user, allParent[i].parent);
          if (!detectParent) throw new Error();

          allParent.push({ fid: detectParent.fid, parent: detectParent.parent });

          i++;
        }

        if (parent) {
          const allParentsFid: string[] = allParent.length === 0 ? [] : allParent.map((p) => p.fid);
          await this.appendChildIdToParent(user, parent._id, child[0]._id, allParentsFid, session);
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
   * @param {features.Data} feature
   * @param {string} fid 
   * @returns {Promise<boolean>}
   */
  public async toggleStatus(feature: features.Data ,fid: string): Promise<boolean> {
    try {
      // Validation When Feature Doesn't Exists
      if (!feature) throw new Error();

      // Reverse The Is Active To Inactive / Active
      const isActive = !feature.isActive;

      if (isActive) {
        await this._featuresModel.updateOne({
          uid: AuthService.getInstance().user().uid,
          fid
        }, {
          isActive,
          updatedAt: Date.now(),
        });
      } else if (!isActive && feature.allChildIds.length > 0) {
        // When Feature Set To Inactive, It Will Be Inactive All Their Sub Features
        await this._featuresModel.updateMany({
          uid: AuthService.getInstance().user().uid,
          $or: [
            {
              _id: {
                $in: [...feature.allChildIds].map((id) => new mongoose.mongo.ObjectId(id)),
              },
            },
            {
              fid
            }
          ]
        }, {
          isActive,
          updatedAt: Date.now(),
        });
      }

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
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1, allChildIds: 1 })
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Parent Feature And All Their Children
   * 
   * @param {string} fidAsParent 
   * @returns {Promise<features.Data[]>}
   */
  public async findParentAndTheirAllChildren(fidAsParent: string): Promise<features.Data[]> {
    try {
      const feature: features.Data = await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        fid: fidAsParent,
      }).select({ childIds: 1, allChildIds: 1 })

      if (!feature) throw new Error();

      // Get All Child Ids To Be Searched
      const allChildIds: mongoose.mongo.ObjectId[] = feature.allChildIds.length === 0 ? [] : feature.allChildIds.map((f) => new mongoose.mongo.ObjectId(f));
      
      return await this._featuresModel.find({
        uid: AuthService.getInstance().user().uid,
        $or: [
          {
            fid: fidAsParent,
          },
          {
            _id: { $in: allChildIds },
          }
        ],
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, "-_id": -1, childIds: 1 });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default FeaturesService;