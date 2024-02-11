import { TaskModel } from "@/resources/task/task.model";
import { DashboardModel } from "@/resources/dashboard/dashboard.model"
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";
import mongoose from "mongoose";
import { StatusModel } from "@/resources/status/status.model";
import { Request } from "express";

class TaskService {
  /**
   * Model
   */
  private _taskModel = TaskModel;
  private _dashboardModel = DashboardModel;
  private _statusModel = StatusModel;


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
      console.log(e.message);
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
  public async store(user: user.Data, task: task.Request, session: mongoose.mongo.ClientSession): Promise<void> {  
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

      await this._taskModel.create([req], { session });
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
}

export default TaskService;