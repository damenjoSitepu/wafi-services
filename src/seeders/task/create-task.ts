import { TaskModel } from "@/resources/task/task.model";

class CreateTask {
  /**
   * Repeat Count
   */
  private _repeatCount: number = 100;

  /**
   * Task Prefix
   */
  private _taskName: string = "TASK_";

  /**
   * Models
   */
  private _taskModel = TaskModel;

  /**
   * Listen To The Seeding
   * 
   * @returns {Promise<void>}
   */
  public async listen(): Promise<void> {
    try {
      if (this._repeatCount > 0) {
        for (let i = 0; i < this._repeatCount; i++) {
          const taskName: string = `${this._taskName}${i}`;
          await this._taskModel.create({
            uid: "RTNo6USGz7MC89RzboipYptPPiw1",
            name: taskName,
            assignedAt: Date.now(),
            order: i + 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: {
              _id: "65c8769ee5a158e873bab545",
              name: "On Progress",
              color: "#38bdf8"
            }
          });
        }
      }
    } catch (e: any) {}
  }
}

export default CreateTask;