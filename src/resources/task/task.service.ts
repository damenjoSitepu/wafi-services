import { TaskModel } from "@/resources/task/task.model";
import { DashboardModel } from "@/resources/dashboard/dashboard.model"
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";
import mongoose from "mongoose";

class TaskService {
  /**
   * Model
   */
  private _taskModel = TaskModel;
  private _dashboardModel = DashboardModel;


  /**
   * Get Task
   * 
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, q: string ): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };

      if (q) {
        query["name"] = { $regex: q, $options: "i" };
      }

      return await this._taskModel.find(query).sort({
        order: 1
      }).limit(25);
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

      await this._taskModel.create([{
          uid: user.uid,
          name: task.name,
          order: Number(dashboard.value),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }], { session });
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
}

export default TaskService;