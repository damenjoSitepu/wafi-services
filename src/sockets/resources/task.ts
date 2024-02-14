import TaskService from "@/resources/task/task.service";
import { task } from "@/resources/task/task.type";
import { user } from "@/resources/user/user.type";

class Task {
  /**
   * Define The Socket Configuration
   */
  private _socketIO: any;
  private _socket: any;

  /**
   * Initialize Services and Dependencies
   * 
   * @param {any} socketIO
   * @param {any} socket 
   */
  public constructor(socketIO: any ,socket: any) {
    this._socket = socket;
    this._socketIO = socketIO;

    this._handleFuncExec();
  }

  /**
   * Handle Function Execution For Each Socket Handler
   * 
   * @returns {void}
   */
  private _handleFuncExec(): void {
    try {
      this._handleCreateTask();
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  
  /**
   * Handle Create Task
   * 
   * @returns {void}
   */
  private _handleCreateTask(): void {
    this._socket.on("createTask", async (_id: string) => {
      const task: task.Data | null = await (new TaskService()).find(this._socket.user as user.Data, _id);
      this._socketIO.emit("retrieveTask", this._socket.user as user.Data, task);
    });
  }
}

export default Task;