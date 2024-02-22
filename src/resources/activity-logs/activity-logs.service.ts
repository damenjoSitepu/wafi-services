import { ActivityLogsModel } from "@/resources/activity-logs/activity-logs.model";
import { ActivityLogsTimelineModel } from "@/resources/activity-logs/activity-logs-timeline.model";
import { activityLogs } from "@/resources/activity-logs/activity-logs.type";
import mongoose from "mongoose";
import { user } from "@/resources/user/user.type";
import { UserModel } from "@/resources/user/user.model";
import { Request } from "express";

class ActivityLogsService {
  /**
   * Models
   */
  private _activityLogsModel = ActivityLogsModel;
  private _activityLogsTimeline = ActivityLogsTimelineModel

  /**
   * Create Activity Logs
   * 
   * @param {activityLogs.Request} request 
   * @param {mongoose.mongo.ClientSession} session 
   * @returns {Promise<any>}
   */
  public async create(request: activityLogs.Request, session: mongoose.mongo.ClientSession): Promise<any> {
    try {
      const activityLogs: any = await this._activityLogsModel.create([request], { session });

      const activityLogsTimeline: any = await this._activityLogsTimeline.findOne({
        uid: request.uid,
        subjectId: request.subjectId,
      });

      if (activityLogsTimeline) {
        await this._activityLogsTimeline.updateOne({
          uid: request.uid,
          subjectId: request.subjectId,
        }, {
          $push: { activityLogs: { _id: activityLogs[0]._id, message: activityLogs[0].message, createdAt: activityLogs[0].createdAt } },
        });
      } else {
        await this._activityLogsTimeline.create([{
          uid: request.uid,
          subjectId: activityLogs[0].subjectId,
          createdAt: Date.now(),
          activityLogs: [{ _id: activityLogs[0]._id, message: activityLogs[0].message, createdAt: activityLogs[0].createdAt }],
        }], { session }); 
      }
 
      return activityLogs;
    } catch (e: any) {}
  }

  /**
   * Get Activity Logs
   * 
   * @param {user.Data} user
   * @param {number} page
   * @param {Request} req
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, page: number = 1, req: Request): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };

      if (req.query.type) {
        query["type"] = req.query.type ?? "";
      }

      if (req.query.startDate) {
        query["createdAt"] = { $gte: Number(req.query.startDate) };
      }

      if (req.query.endDate) {
        query["createdAt"] = { $lte: Number(req.query.endDate) };
      }
      
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
        .limit(Number(process.env.PAGINATION_PER_PAGE))
        .sort({ createdAt: -1 });
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

  /**
   * Find Activity Logs Timeline Detail
   * 
   * @param {user.Data} user 
   * @param {string} subjectId 
   * @returns {Promise<activityLogs.TimelineData | null>}
   */
  public async findTimeline(user: user.Data, subjectId: string): Promise<activityLogs.TimelineData | null> {
    try {
      return await this._activityLogsTimeline.findOne({
        uid: user.uid,
        subjectId: subjectId,
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default ActivityLogsService;