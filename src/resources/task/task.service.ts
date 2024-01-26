import { TaskModel } from "@/resources/task/task.model";
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";

class TaskService {
  /**
   * Model
   */
  private _taskModel = TaskModel;

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
}

export default TaskService;