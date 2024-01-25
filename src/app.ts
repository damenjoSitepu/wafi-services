import express, { Application, Request, Response } from "express";
import { statement } from "@/utils/constants/statement.constant";
 
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
   * Initialize Express Application
   * 
   * @param {number} port 
   */
  public constructor(
    public port: number
  ) {
    this._application = express();
    this._port = port;
    this._enableConfig();
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