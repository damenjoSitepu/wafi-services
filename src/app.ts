import express, { Application, Request, Response } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
 
class App {
  /**
   * Define The Express Application
   */
  private _application: Application;

  /**
   * Define The Express Port Number That Will Running
   */
  private _port: number;

  /**
   * Define Api Version For Our Express Application
   */
  private _apiVersion: string;

  /**
   * Initialize Express Application
   * 
   * @param {number} port 
   * @param {string} apiVersion
   * @param {ControllerContract[]} controllers
   */
  public constructor(
    public port: number,
    public apiVersion: string,
    public controllers: ControllerContract[]
  ) {
    this._port = port;
    this._apiVersion = apiVersion;
    this._application = express();
    this._enableConfig();
    this._initializeControllers(controllers);
  }

  /**
   * Enable Express Application Configurations
   * 
   * @returns {void}
   */
  private _enableConfig(): void {
    try {
      this._application.enable('trust proxy');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Initialize Controllers
   * 
   * @param ControllerContract[] controllers 
   * @returns {void}
   */
  private _initializeControllers(controllers: ControllerContract[]): void {
    try {
      if (!this._apiVersion) throw new Error(statement.EXPRESS_APP.INVALID_API_VERSION);
      if (controllers.length === 0) throw new Error(statement.EXPRESS_APP.NO_CONTROLLERS);
      
      controllers.forEach((controller: ControllerContract) => {
        this._application.use(`/api/${this._apiVersion}`, controller.router);
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Listen To The Express Application
   * 
   * @returns {void}
   */
  public listen(): void {
    try {
      this._application.get("/", (req: Request, res: Response) => {
        return res.json({
          statement: statement.EXPRESS_APP.INITIALIZED
        })
      });
      this._application.listen(this._port, () => {});
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default App;