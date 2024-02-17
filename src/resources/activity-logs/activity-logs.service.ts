import { ActivityLogsModel } from "@/resources/activity-logs/activity-logs.model";
import { activityLogs } from "@/resources/activity-logs/activity-logs.type";
import mongoose from "mongoose";
import { user } from "@/resources/user/user.type";
import { UserModel } from "@/resources/user/user.model";

class ActivityLogsService {
  /**
   * Models
   */
  private _activityLogsModel = ActivityLogsModel;
  private _userModel = UserModel;

  /**
   * Create Activity Logs
   * 
   * @param {activityLogs.Request} request 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<void>}
   */
  public async create(request: activityLogs.Request, session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      await this._activityLogsModel.create([request], { session });
    } catch (e: any) {}
  }

  /**
   * Get Activity Logs
   * 
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, page: number = 1): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };

      let skippedDocs: number = 0;
      if (page > 1) {
        skippedDocs = (page - 1) * Number(process.env.PAGINATION_PER_PAGE);
      }

      return await this._activityLogsModel.find(query).select(
        {
          message: 1,
          createdAt: 1,
          type: 1,
          topic: 1,
          modifiedAfterBy: {
            name: 1,
          },
        }).sort({
          order: -1
        })
        .skip(skippedDocs)
        .limit(Number(process.env.PAGINATION_PER_PAGE));
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Certain Activity Log
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @returns {Promise<activityLogs.Data | null>}
   */
    public async find(user: user.Data, id: string): Promise<activityLogs.Data | null> {
      try {
        return await this._activityLogsModel.findOne({
          uid: user.uid,
          _id: new mongoose.mongo.ObjectId(id)
        });
      } catch (e: any) {
        throw new Error(e.message);
      }
    }
}

export default ActivityLogsService;