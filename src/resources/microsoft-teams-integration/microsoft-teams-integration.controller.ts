import { Router, Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import ControllerContract from "@/utils/contracts/controller.contract";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";
import mongoose from "mongoose";
import MicrosoftTeamsIntegrationService from "@/resources/microsoft-teams-integration/microsoft-teams-integration.service";
import { microsoftTeamsIntegrationValidation } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.validation";
import { microsoftTeamsIntegration } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.type";
import MicrosoftGraphApiSetting from "@/settings/microsoft-graph-api.setting";
import { DeviceCodeInfo } from "@azure/identity";

class MicrosoftTeamsIntegrationController implements ControllerContract {
  /**
   * Define Path 
   */
  public path: string = "/microsoft-teams-integration";

  /**
   * Define Router
   */
  public router: Router = Router();

  /**
   * Define Services
   */
  private _microsoftTeamsIntegrationService: MicrosoftTeamsIntegrationService = new MicrosoftTeamsIntegrationService();

  /**
   * Initialize Data
   */
  public constructor() {
    this._initializeRoutes();
  }

  /**
   * Store Status API
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
    const session: mongoose.mongo.ClientSession = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const returnedAction: string = await this._microsoftTeamsIntegrationService.store(req.user, req.body, session);
      await session.commitTransaction();

      new MicrosoftGraphApiSetting(req.user.uid ,{
        clientId: req.body.clientId,
        tenantId: req.body.tenantId,
        graphUserScopes: [
          'user.read',
          'mail.read',
          'mail.send',
          'ChatMessage.Send',
          'Chat.ReadWrite',
          'Chat.ReadBasic',
          'Chat.Read', 
          'Chat.ReadWrite',
          'User.ReadWrite',
          'User.ReadBasic.All',
          'offline_access',
        ],
      }, (info: DeviceCodeInfo) => {
        return res.status(httpResponseStatusCode.SUCCESS.CREATED).json({
          statement: returnedAction === "CREATE" ? statement.MICROSOFT_TEAMS_INTEGRATION.CREATE : statement.MICROSOFT_TEAMS_INTEGRATION.UPDATE,
          data: {
            info
          },
        });
      });
    } catch (e: any) {
      await session.abortTransaction();
      return res.status(httpResponseStatusCode.FAIL.UNPROCESSABLE_ENTITY).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.FAIL_CONNECT,
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Show Microsoft Teams Integration API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _show = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const microsoftTeamsIntegration: microsoftTeamsIntegration.Data | undefined = await this._microsoftTeamsIntegrationService.find(req.user);

      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.SHOW,
        data: {
          microsoftTeamsIntegration,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.FAIL_SHOW,
      });
    } 
  }

  /**
   * Show Microsoft Teams Profile Integration API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _me = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const me = await this._microsoftTeamsIntegrationService.me(req.user);
      
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.GET_ME,
        data: {
          me,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: e.message,
      });
    } 
  }  

  /**
   * Disconnect Microsoft Teams API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _disconnect = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      await this._microsoftTeamsIntegrationService.forceRemoveToken(req.user.uid);
      
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.DISCONNECT,
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.DISCONNECT_FAIL,
      });
    } 
  }

  /**
   * Chats Microsoft Teams API
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {Promise<Response | void>}
   */
  private _chats = async(
    req: Request, 
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const chats: any = await this._microsoftTeamsIntegrationService.chats(req.user);
      
      return res.status(httpResponseStatusCode.SUCCESS.OK).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.CHAT,
        data: {
          chats: chats.value,
        },
      });
    } catch (e: any) {
      return res.status(httpResponseStatusCode.FAIL.INTERNAL_SERVER_ERROR).json({
        statement: statement.MICROSOFT_TEAMS_INTEGRATION.FAIL_CHAT,
      });
    } 
  }

  /**
   * Initialize Routes
   */
  private _initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(microsoftTeamsIntegrationValidation.create),
      this._store
    );

    this.router.post(
      `${this.path}/disconnect`,
      authMiddleware,
      this._disconnect
    );

    this.router.get(
      `${this.path}/chats`,
      authMiddleware,
      this._chats
    );

    this.router.get(
      `${this.path}`,
      authMiddleware,
      this._show
    );

    this.router.get(
      `${this.path}/me`,
      authMiddleware,
      this._me
    );
  }
}

export default MicrosoftTeamsIntegrationController;