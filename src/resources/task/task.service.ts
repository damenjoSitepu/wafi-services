import { TaskModel } from "@/resources/task/task.model";
import { DashboardModel } from "@/resources/dashboard/dashboard.model"
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";

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
        createdAt: -1
      }).limit(25);
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
  public async store(user: user.Data ,task: task.Request): Promise<void> {
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
        });
      } else {
        await this._dashboardModel.create(dashboard);
      }

      await this._taskModel.create({
        uid: user.uid,
        name: task.name,
        order: Number(dashboard.value),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
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