import { user } from "@/resources/user/user.type";
import mongoose from "mongoose";
import { StatusModel } from "@/resources/status/status.model";
import { status } from "@/resources/status/status.type";
import { DashboardModel } from "@/resources/dashboard/dashboard.model";
import { TaskModel } from "@/resources/task/task.model";
import { statement } from "@/utils/constants/statement.constant";
import { UserModel } from "@/resources/user/user.model";
import UtilService from "@/utils/services/util.service";
import { timestamp } from "@/utils/constants/timestamp.constant";
import { ActivityLogsModel } from "@/resources/activity-logs/activity-logs.model";
import ActivityLogsService from "@/resources/activity-logs/activity-logs.service";

class StatusService {
  /**
   * Model
   */
  private _statusModel = StatusModel;
  private _dashboardModel = DashboardModel;
  private _taskModel = TaskModel;
  private _userModel = UserModel;
  private _activityLogsModel = ActivityLogsModel;

  /**
   * Services
   */
  private _utilService: UtilService = new UtilService();
  private _activityLogsService: ActivityLogsService = new ActivityLogsService();

  /**
   * Get Status (Minified)
   * 
   * @returns {Promise<any>}
   */
  public async getMinified(user: user.Data): Promise<any> {
    try {
      return await this._statusModel.find({
        uid: user.uid
      }, {
        _id: 1,
        name: 1,
        color: 1,
      }).sort({
        order: -1
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Get Status
   * 
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, q: string, page: number = 1): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };

      if (q) {
        query["name"] = { $regex: q, $options: "i" };
      }

      let skippedDocs: number = 0;
      if (page > 1) {
        skippedDocs = (page - 1) * Number(process.env.PAGINATION_PER_PAGE);
      }

      return await this._statusModel.find(query).sort({
        order: -1
      })
        .skip(skippedDocs)
        .limit(Number(process.env.PAGINATION_PER_PAGE));
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Swap The Status Order
   * 
   * @param {user.Data} user 
   * @param {string} firstId 
   * @param {number} firstOrder 
   * @param {string} secondId 
   * @param {number} secondOrder 
   * @param {mongoose.mongo.ClientSession} session
   */
  public async swap(
    user: user.Data,
    firstId: string,
    firstOrder: number,
    secondId: string,
    secondOrder: number,
    session: mongoose.mongo.ClientSession
  ): Promise<void> {
    try {
      // First Data
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(firstId)
      }, {
        order: firstOrder,
      }, {
        session,
      });
      // Second Data
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(secondId)
      }, {
        order: secondOrder,
      }, {
        session,
      });
    } catch (e: any) {
      throw new Error(e.message);
    } 
  }

  /**
   * Store Status
   * 
   * @param {status.Request} status 
   * @returns {Promise<void>}
   */ 
  public async store(user: user.Data, status: status.Request, session: mongoose.mongo.ClientSession): Promise<any> {  
    try {
      const countStatus: number = await this._statusModel.countDocuments({
        uid: user.uid,
      });

      const currentDashboard = await this._dashboardModel.findOne({
        uid: user.uid,
        type: "Status",
        key: "Count",
      });

      if (currentDashboard) {
        await this._dashboardModel.updateOne({
          uid: user.uid,
          type: "Status",
          key: "Count",
        }, {
          value: countStatus + 1,
          updatedAt: Date.now(),
        }, {
          session
        });
      } else {
        await this._dashboardModel.create([{
          uid: user.uid,
          type: "Status",
          key: "Count",
          title: "Count Item",
          value: countStatus + 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }], { session });
      }

      return await this._statusModel.create([{
        uid: user.uid,
        name: status.name,
        description: status.description,
        color: status.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modifiedBy: user.uid,
      }], { session });
    } catch (e: any) {
      throw new Error(e.message);
    } 
  } 

  /**
   * Destroy The Status
   * @param {user.Data} user 
   * @param {string} id 
   * @param {mongoose.mongo.ClientSession} session
   */
  public async destroy(user: user.Data, id: any, session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      const status: any = await this._statusModel.findOne({ $and: [{ uid: user.uid }, { _id: id }] });

      if (!status) throw new Error();

      const task = await this._taskModel.findOne({
        "status._id": id,
      });
      if (task) {
        throw new Error(statement.STATUS.FAIL_DESTROY_TASK_DETECTED);
      }

      const currentDashboard = await this._dashboardModel.findOne({
        uid: user.uid,
        type: "Status",
        key: "Count",
      });

      if (currentDashboard) {
        const countStatus: number = await this._statusModel.countDocuments({
          uid: user.uid,
        });

        await this._dashboardModel.updateOne({
          uid: user.uid,
          type: "Status",
          key: "Count",
        }, {
          value: !countStatus || countStatus === 0 ? 0 : countStatus - 1,
          updatedAt: Date.now(),
        }, {
          session
        });
      }
      
      await this._statusModel.deleteOne({
        $and: [
          {
            uid: user.uid,
          },
          {
            _id: id
          }
        ]
      });

      return status;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Certain Status
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @returns {Promise<status.Data | null>}
   */
  public async find(user: user.Data, id: string): Promise<status.Data | null> {
    try {
      return await this._statusModel.findOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Update Status
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @param {status.Request} status 
   */
  public async update(user: user.Data, id: string, status: status.Request): Promise<void> {
    try {
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      }, {
        name: status.name,
        description: status.description,
        color: status.color,
        updatedAt: Date.now(),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Create Activity Logs
   * 
   * @param {status.Data} status 
   * @param {user.Data} user 
   * @param {user.Data} modifiedBeforeBy 
   * @param {user.Data} modifiedAfterBy 
   * @param {mongoose.mongo.ClientSession} session 
   * @param {string} topic 
   * @param {string} message 
   */
  public async createActivityLog(
    status: status.Data,
    user: user.Data,
    modifiedBeforeBy: user.Data | undefined,
    modifiedAfterBy: user.Data | undefined,
    session: mongoose.mongo.ClientSession,
    topic: string,
    message: string,
    oldStatus?: status.Data,
  ): Promise<void> {
    try {
      const users = await this._userModel.find({ uid: { $in: [modifiedBeforeBy?.uid, modifiedAfterBy?.uid] } });
      if (users.length > 0) {
        modifiedBeforeBy = [...users].find((user) => user.uid === modifiedBeforeBy?.uid);
        modifiedAfterBy = [...users].find((user) => user.uid === modifiedAfterBy?.uid);
      }

      const payloads: Array<Array<{ key: string, value: any }>> = [[
        ...this._utilService.convertJSONToArrayOfKeyAndValues({
          "Id": status._id, 
          "Name": status.name,
          "Description": status.description,
          "Color": status.color,
          "Created At": status.createdAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
          "Updated At": status.updatedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
        })
      ]];

      let prevLink: string = "";
      let nextLink: string = "";
      let prevActivityLog: any = undefined;

      if (topic === "Update") {
        payloads.push([
          ...this._utilService.convertJSONToArrayOfKeyAndValues({
            "Id": oldStatus?._id,
            "Name": oldStatus?.name,
            "Description": oldStatus?.description,
            "Color": oldStatus?.color,
            "Created At": oldStatus?.createdAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
            "Updated At": oldStatus?.updatedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
          })
        ]);
      }

      if (["Update", "Delete"].includes(topic)) {
        prevActivityLog = await this._activityLogsModel.findOne({
          uid: user.uid,
          subjectId: status._id,
        }).sort({ createdAt: -1 });

        prevLink = `/activity-logs/${prevActivityLog._id}/view`;
      }

      const activityLogs: any = await this._activityLogsService.create({
        uid: user.uid,
        subjectId: status._id,
        type: "Status",
        topic: topic,
        message: message,
        routeToView: `/setting/status/${status._id}/update`,
        payloads,
        prevLink,
        nextLink,
        navigationWorkflow: ["/setting/status","/setting/status/create"],
        createdAt: Date.now(),
        modifiedBeforeBy: {
          uid: modifiedBeforeBy?.uid || "",
          name: modifiedBeforeBy?.name || "",
          email: modifiedBeforeBy?.email || "",
        },
        modifiedAfterBy: {
          uid: modifiedAfterBy?.uid || "",
          name: modifiedAfterBy?.name || "",
          email: modifiedAfterBy?.email || "",
        }
      }, session);

      if (["Update","Delete"].includes(topic) && prevActivityLog) {
        prevActivityLog.nextLink = `/activity-logs/${activityLogs[0]._id}/view`;
        await prevActivityLog.save();
      }      
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default StatusService;