import { TaskModel } from "@/resources/task/task.model";
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";

class TaskService {
  /**
   * Model
   */
  private _taskModel = TaskModel;

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
      await this._taskModel.create({
        uid: user.uid,
        name: task.name,
        order: task.order,
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