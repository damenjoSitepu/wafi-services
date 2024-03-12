import { statement } from "@/utils/constants/statement.constant";
import { user } from "@/resources/user/user.type";
import { FeaturesModel, FeaturesDashboardModel } from "@/resources/features/features.model";
import { Request, Response } from "express";
const { v4: uuidv4 } = require('uuid');
import { features } from "@/resources/features/features.type";
import mongoose from "mongoose";
import AuthService from "@/utils/services/auth.service";
import CollectionService from "@/utils/services/collection.service";
import { customStatusCode } from "@/utils/constants/custom-status-code.constant";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";

class FeaturesService {
  /**
   * Models
   */
  private _featuresModel = FeaturesModel;
  private _featuresDashboardModel = FeaturesDashboardModel;

  /**
   * Services
   */
  private _collectionService: CollectionService = new CollectionService();

  /**
   * Check Is Feature Name Is Exists Or Not (Case Insensitive Checker)
   * 
   * When third parameter (fid) filled, that means we check unique name to the collection without the (fid) row
   * 
   * @param {user.Data} user 
   * @param {string} featureName 
   * @param {string} fid
   * @returns {Promise<boolean>}
   */
  public async checkIsRegistered(user: user.Data, featureName: string, fid: string = ""): Promise<boolean> {
    try {
      // Include All Row To Check Feature Name Uniqueness
      if (!fid) {
        const check: features.MinifiedData | null = await this._featuresModel.findOne({
          uid: AuthService.getInstance().user().uid,
          name: { $regex: featureName, $options: "i" }
        });

        return check?.name?.toLowerCase() === featureName.toLowerCase() ? true : false;
      } 

      // Except The Row With Attached FID
      const check: features.MinifiedData | null = await this._featuresModel.findOne({
        uid: AuthService.getInstance().user().uid,
        name: { $regex: featureName, $options: "i" },
        fid: { $ne: fid },
      });
      return check?.name?.toLowerCase() === featureName.toLowerCase() ? true : false;
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
   * @param {mongoose.mongo.ClientSession} session
   * @returns {Promise<boolean>}
   */
  public async toggleStatus(feature: features.Data ,fid: string, session: mongoose.mongo.ClientSession): Promise<boolean> {
    try {
      // Validation When Feature Doesn't Exists
      if (!feature) throw new Error();

      // Reverse The Is Active To Inactive / Active
      const isActive = !feature.isActive;

      if (isActive || (!isActive && feature.allChildIds.length === 0)) {
        await this._featuresModel.updateOne({
          uid: AuthService.getInstance().user().uid,
          fid
        }, {
          isActive,
          updatedAt: Date.now(),
        }, { session });
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
        }, { session });
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
      }).select({ fid: 1, name: 1, parent: 1, isActive: 1, childIds: 1, allChildIds: 1 })
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

  /**
   * Rename The Feature Title
   * 
   * @param {string} fid
   * @param {string} name 
   * @returns {Promise<void>}
   */
  public async renameTitle(fid: string, name: string): Promise<void> {
    try {
      await this._featuresModel.updateOne({
        uid: AuthService.getInstance().user().uid,
        fid,
      }, {
        updatedAt: Date.now(),
        name,
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Delete The Feature And Its Own Dependencies
   * 
   * @param {string[]} fids 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<void>}
   */
  public async delete(fids: string[], session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      await this._featuresModel.deleteMany({
        uid: AuthService.getInstance().user().uid,
        fid: { $in: fids },
      }, {
        session,
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Delete Child IDS From Its Own Parent
   * 
   * @param {features.Data} feature 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<void>}
   */
  public async deleteChildIds(feature: features.Data, session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      if (!feature.parent) return;

      const parentFeatures: features.Data[] = [await this.findParent(feature.parent)];
      let i: number = 0;

      while (true) {
        if (!parentFeatures[i].parent) break;
        const findParentFeature: features.Data = await this.findParent(parentFeatures[i].parent ?? "");
        if (!findParentFeature) break;
        parentFeatures.push(findParentFeature);
        i++;
        if (!findParentFeature.parent) break;
      }

      // Index Zero Will Be The One Level Higher Module Refer To Deleted Features, So Will Be Delete ChildIds and AllChildIds
      await this._featuresModel.updateOne({
        uid: AuthService.getInstance().user().uid,
        fid: parentFeatures[0].fid,
      }, {
        updatedAt: Date.now(),
        $pull: {
          childIds: feature._id,
          allChildIds: {
            $in: [feature._id, ...feature.allChildIds]
          },
        }
      }, {
        session,
      });

      if (parentFeatures.length > 1) {
        // Except The First One Because Its Already Executed
        const parentFeaturesFid: string[] = [...parentFeatures].filter((_: features.Data, i: number) => i > 0)
          .map((feature: features.Data) => feature.fid);
        if (parentFeaturesFid.length > 0) {
          await this._featuresModel.updateMany({
            uid: AuthService.getInstance().user().uid,
            fid: { $in: parentFeaturesFid },
          }, {
            updatedAt: Date.now(),
            $pull: {
              allChildIds: { $in: [feature._id, ...feature.allChildIds] }
            }
          }, {
            session,
          });
        }
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Get Features Analytics / Dashboard
   * 
   * @param {string[]} keys 
   * @returns {Promise<features.DashboardData[]>}
   */
  public async getDashboard(keys: string[]): Promise<features.DashboardData[]> {
    try {
      return await this._featuresDashboardModel.find({
        uid: AuthService.getInstance().user().uid,
        key: { $in: keys },
      }).select({ key: 1, title: 1, value: 1, icon: 1 });
    } catch (e: any) {
      throw new Error(e.mesasge);
    }
  } 

  /**
   * Setting Dashboard To Increment 
   * @param {features.SettingDashboardRequest} req 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<void>}
   */
  public async settingDashboard(req: features.SettingDashboardRequest, session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      const featureDashboard: features.DashboardData = await this._featuresDashboardModel.findOne({
        uid: AuthService.getInstance().user().uid,
        key: req.key,
        title: req.title,
      }).select({ id: 1 });

      if (!featureDashboard) {
        // When Feature Dashboard With X key and N title doesn't exists, create for the first time
        await this._featuresDashboardModel.create([
          {
            uid: AuthService.getInstance().user().uid,
            fdid: uuidv4(),
            key: req.key,
            title: req.title,
            value: req.value,
            icon: req.icon,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        ], {
          session
        });
      } else if (featureDashboard) {
        if (req.skipIncrementOrDecrement) {
          // When Feature dashbaord with x key and n title already exists, just adjust the value (without increment or decrement)
          await this._featuresDashboardModel.updateOne({
            uid: AuthService.getInstance().user().uid,
            key: req.key,
            title: req.title
          }, {
            value: req.value,
            updatedAt: Date.now(),
          }, {
            session,
          });
          return;
        }
        // When Feature dashbaord with x key and n title already exists, just update the increment or decrement value
        await this._featuresDashboardModel.updateOne({
          uid: AuthService.getInstance().user().uid,
          key: req.key,
          title: req.title
        }, {
          $inc: { value: req.isInc ? req.value : -req.value },
          updatedAt: Date.now(),
        }, {
          session,
        });
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  } 

  /**
   * Count Total Actived / Inactived Status For Certain User
   * @param {boolean} isActive 
   * @param {mongoose.mongo.ClientSession} session
   * @returns {Promise<number>}
   */
  public async countStatus(isActive: boolean, session?: mongoose.mongo.ClientSession): Promise<number> {
    try {
      return await this._featuresModel.countDocuments({
        uid: AuthService.getInstance().user().uid,
        isActive,
      }, session ? { session } : {});
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Check Global App Feature Status (Base On Feature Is Active Status)
   * 
   * @param {string[]} featureNames 
   * @returns {Promise<boolean>}
   */
  public async checkGlobalAppFeatureStatus(featureNames: string[]): Promise<boolean> {
    try {
      const totalFeaturesFound: number = await this._featuresModel.countDocuments({
        name: { $in: featureNames },
        isActive: true,
      });

      // If total features found from database not match to feature Names length, we know that user cannot access the features
      return totalFeaturesFound === featureNames.length;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Feature By Names
   * 
   * @param {string[]} featureNames 
   * @returns {Promise<features.Data[]>}
   */
  public async findByNames(featureNames: string[]): Promise<features.Data[]> {
    try {
      return await this._featuresModel.find({
        name: { $in: featureNames },
      }).select({ id: 1, name: 1, isActive: 1 });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Handle Error Unauthorized To Access Feature
   * 
   * @param {string[]} featureNames 
   * @param {Response} res 
   * @returns {Promise<Response>}
   */
  public async handleErrorUnauthorizedToAccessFeature(featureNames: string[], res: Response): Promise<Response> {
    const featuresAffected: features.Data[] = await this.findByNames(featureNames);

    return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
      errCode: customStatusCode.FAIL.FEATURE_DEACTIVATED,
      featuresAffected: this._collectionService.detachCredential(["_id","id","isAbleToExpand"], featuresAffected),
      statement: statement.APP.FEATURE_DEACTIVATED,
    });
  }
}

export default FeaturesService;