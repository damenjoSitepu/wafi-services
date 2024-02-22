import { TaskModel } from "@/resources/task/task.model";
import { DashboardModel } from "@/resources/dashboard/dashboard.model"
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";
import mongoose from "mongoose";
import { StatusModel } from "@/resources/status/status.model";
import { Request } from "express";
import ActivityLogsService from "@/resources/activity-logs/activity-logs.service";
import { ActivityLogsModel } from "@/resources/activity-logs/activity-logs.model";
import { UserModel } from "@/resources/user/user.model";
import UtilService from "@/utils/services/util.service";
import { timestamp } from "@/utils/constants/timestamp.constant";

class TaskService {
  /**
   * Services
   */
  private _activityLogsService: ActivityLogsService = new ActivityLogsService();
  private _utilService: UtilService = new UtilService();

  /**
   * Model
   */
  private _taskModel = TaskModel;
  private _dashboardModel = DashboardModel;
  private _statusModel = StatusModel;
  private _userModel = UserModel;
  private _activityLogsModel = ActivityLogsModel;

  /**
   * Get Task
   * 
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, q: string, page: number = 1, req: Request): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };
      

      if (q !== "") {
        query["name"] = { $regex: q, $options: "i" };
      }

      if (req.query.statuses) {
        query["status._id"] = { $in: JSON.parse(String(req.query.statuses)) };
      }
 
      let skippedDocs: number = 0;
      if (page > 1) {
        skippedDocs = (page - 1) * Number(process.env.PAGINATION_PER_PAGE);
      }

      return await this._taskModel.find(query).sort({
        order: -1
      })
        .skip(skippedDocs)
        .limit(Number(process.env.PAGINATION_PER_PAGE));
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Swap The Task Order
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
      await this._taskModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(firstId)
      }, {
        order: firstOrder,
      }, {
        session,
      });
      // Second Data
      await this._taskModel.updateOne({
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
   * Store Task
   * 
   * @param {task.Request} task 
   * @returns {Promise<void>}
   */
  public async store(user: user.Data, task: task.Request, session: mongoose.mongo.ClientSession): Promise<any> {  
    try {
      let dashboard: any = {
        uid: user.uid,
        type: "Task",
        key: "currentId",
        title: "Current ID",
        value: "1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const currentIdForDashboard = await this._dashboardModel.findOne({
        uid: user.uid,
        type: "Task",
        key: "currentId",
      });

      if (currentIdForDashboard) {
        dashboard.value = Number(currentIdForDashboard?.value) + 1;
        await this._dashboardModel.updateOne({
          uid: user.uid,
          type: "Task",
          key: "currentId",
        }, {
          value: dashboard.value,
          updatedAt: Date.now(),
        }, {
          session
        });
      } else {
        await this._dashboardModel.create([dashboard], { session });
      }

      let req: any = {
        uid: user.uid,
        name: task.name,
        assignedAt: task.assignedAt,
        order: Number(dashboard.value),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modifiedBy: user.uid,
      };

      if (task.status) {
        // Find Status Data
        const status = await this._statusModel.findOne({
          uid: user.uid,
          _id: task.status,
        }, {
          _id: 1,
          name: 1,
          color: 1,
        });
        if (status) {
          req = {
            ...req,
            status: {
              _id: status?._id,
              name: status?.name,
              color: status?.color,
            },
          };
        }
      }

      return await this._taskModel.create([req], { session });
    } catch (e: any) {
      throw new Error(e.message);
    } 
  } 

  /**
   * Destroy The Task
   * @param {user.Data} user 
   * @param {string} id 
   */
  public async destroy(user: user.Data, id: any): Promise<void> {
    try {
      const task: any = await this._taskModel.findOne({ $and: [{ uid: user.uid }, { _id: id }] });

      if (!task) throw new Error();

      await this._taskModel.deleteOne({
        $and: [
          {
            uid: user.uid,
          },
          {
            _id: id
          }
        ]
      });
      return task;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Certain Task
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @returns {Promise<task.Data | null>}
   */
  public async find(user: user.Data, id: string): Promise<task.Data | null> {
    try {
      return await this._taskModel.findOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Update Task
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @param {task.Request} task 
   */
  public async update(user: user.Data, id: string, task: task.Request): Promise<void> {
    try {
      let req: any = {
        name: task.name,
        assignedAt: task.assignedAt,
        updatedAt: Date.now(),
      };

      if (task.status) {
        // Find Status Data
        const status = await this._statusModel.findOne({
          uid: user.uid,
          _id: task.status,
        }, {
          _id: 1,
          name: 1,
          color: 1,
        });

        if (status) {
          req = {
            ...req,
            "status._id": status._id,
            "status.name": status.name,
            "status.color": status.color,
          };
        } 
      } else {
        req = {
          ...req,
          "status._id": "",
          "status.name": "",
          "status.color": "",
        };
      }

      await this._taskModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      }, {
        $set: { ...req }
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Create Activity Logs
   * 
   * @param {task.Data} task 
   * @param {user.Data} user 
   * @param {user.Data} modifiedBeforeBy 
   * @param {user.Data} modifiedAfterBy 
   * @param {mongoose.mongo.ClientSession} session 
   * @param {string} topic 
   * @param {string} message 
   */
  public async createActivityLog(
    task: task.Data,
    user: user.Data,
    modifiedBeforeBy: user.Data | undefined,
    modifiedAfterBy: user.Data | undefined,
    session: mongoose.mongo.ClientSession,
    topic: string,
    message: string,
    oldTask?: task.Data,
  ): Promise<void> {
    try {
      const users = await this._userModel.find({ uid: { $in: [modifiedBeforeBy?.uid, modifiedAfterBy?.uid] } });
      if (users.length > 0) {
        modifiedBeforeBy = [...users].find((user) => user.uid === modifiedBeforeBy?.uid);
        modifiedAfterBy = [...users].find((user) => user.uid === modifiedAfterBy?.uid);
      }

      const payloads: Array<Array<{ key: string, value: any }>> = [[
        ...this._utilService.convertJSONToArrayOfKeyAndValues({
          "Id": task._id, 
          "Name": task.name,
          "Assigned At": task.assignedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.SHORT,
          "Status": task?.status?.name,
          "Created At": task.createdAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
          "Updated At": task.updatedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
        })
      ]];

      let prevLink: string = "";
      let nextLink: string = "";
      let prevActivityLog: any = undefined;

      if (topic === "Update") {
        payloads.push([
          ...this._utilService.convertJSONToArrayOfKeyAndValues({
            "Id": oldTask?._id,
            "Name": oldTask?.name,
            "Assigned At": oldTask?.assignedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.SHORT,
            "Status": oldTask?.status?.name,
            "Created At": oldTask?.createdAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
            "Updated At": oldTask?.updatedAt + timestamp.SEPARATOR.DEFAULT + timestamp.FORMAT.DEFAULT,
          })
        ]);
      }

      if (["Update", "Delete"].includes(topic)) {
        prevActivityLog = await this._activityLogsModel.findOne({
          uid: user.uid,
          subjectId: task._id,
        }).sort({ createdAt: -1 });

        prevLink = `/activity-logs/${prevActivityLog._id}/view`;
      }

      const activityLogs: any = await this._activityLogsService.create({
        uid: user.uid,
        subjectId: task._id,
        type: "Task",
        topic: topic,
        message: message,
        routeToView: `/task/${task._id}/update`,
        payloads,
        prevLink,
        nextLink,
        navigationWorkflow: ["/task","/task/create"],
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

export default TaskService;