import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";

class TaskController implements ControllerContract {
  /**
   * Define Path 
   */
  public path: string = "/task";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Store Task API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _store = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    return res.status(200).json({
      statement: statement.TASK.CREATED,
    });
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      this._store
    );
  }
}

export default TaskController;