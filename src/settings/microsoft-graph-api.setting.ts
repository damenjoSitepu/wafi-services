import { ClientSecretCredential, DeviceCodeCredential, DeviceCodeInfo, DeviceCodePromptCallback, TokenCredential } from '@azure/identity';
import { Message } from '@microsoft/microsoft-graph-types';
import { AppSettings } from '@/utils/contracts/microsoft-graph-api.contract';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { MicrosoftTeamsIntegrationsModel } from '@/resources/microsoft-teams-integration/microsoft-teams-integration.model';

class MicrosoftGraphApiSetting {
  /**
   * App Settings Configuration
   */
  private _appSettings!: AppSettings;

  /**
   * Device Code Credential
   */
  private _deviceCodeCredential: DeviceCodeCredential | undefined = undefined;

  /**
   * User Client
   */
  private _userClient: Client | undefined = undefined;

  /**
   * Models
   */
  private _microsoftTeamsIntegrationModel = MicrosoftTeamsIntegrationsModel;

  /**
   * User Id
   */
  private _userId: string = "";

  /**
   * Initialize Data
   * 
   * @param {string} userId
   * @param {DeviceCodePromptCallback} deviceCodePrompt 
   * @param {DeviceCodePromptCallback} deviceCodePrompt
   */
  public constructor(
    userId: string,
    appSettings: AppSettings,
    deviceCodePrompt: DeviceCodePromptCallback,
  ) {
    this._userId = userId;
    this._initializeAppSettings(appSettings);
    this._initializeGraph(deviceCodePrompt);
  }

  /**
   * Initialize Graph
   * 
   * @returns {void}
   */
  private _initializeGraph(deviceCodePrompt: DeviceCodePromptCallback): void {
    try {
      this._initializeGraphForUserAuth(deviceCodePrompt);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Get User Token
   * 
   * @returns {Promise<string>}
   */
  private async _getUserToken(): Promise<string> {
    try {
      if (!this._deviceCodeCredential) {
        throw new Error("Graph has not been initialized for user auth");
      }

      if (!this._appSettings.graphUserScopes) {
        throw new Error('Setting "scopes" cannot be undefined');
      }

      const response = await this._deviceCodeCredential.getToken(this._appSettings.graphUserScopes);
      return response.token;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Initialize Graph For User Auth
   * 
   * @param {DeviceCodePromptCallback} deviceCodePrompt 
   * @returns {Promise<void>}
   */
  private async _initializeGraphForUserAuth(deviceCodePrompt: DeviceCodePromptCallback): Promise<void> {
    try {
      if (!this._appSettings) {
        throw new Error("App Settings Cannot Be Undefined!");
      }

      if (!this._deviceCodeCredential) {
        this._deviceCodeCredential = new DeviceCodeCredential({
          clientId: this._appSettings.clientId,
          tenantId: this._appSettings.tenantId,
          userPromptCallback: deviceCodePrompt,
        });
      } 

      const token = await this._deviceCodeCredential.getToken(this._appSettings.graphUserScopes);
      
      await this._microsoftTeamsIntegrationModel.updateOne({
        uid: this._userId,
      }, {
        accessToken: token.token,
        accessTokenExpiresOn: token.expiresOnTimestamp,
        updatedAt: Date.now(),
      });

      const authProvider = new TokenCredentialAuthenticationProvider(this._deviceCodeCredential , {
        scopes: this._appSettings.graphUserScopes
      });
      
      this._userClient = Client.initWithMiddleware({ authProvider });
    } catch (e: any) {}
  }

  /**
   * Greet User
   * 
   * @returns {Promise<void>}
   */
  public async greetUser(): Promise<GraphRequest | void> {
    try {
      if (!this._userClient) {
        throw new Error('Graph has not been initialized for user auth');
      }

      // const user = await this._userClient.api("/me").select(["displayName", "mail", "userPrincipalName"]).get();
      // POST /chats/{chat-id}/messages
      const chatMessage = {
        body: {
          content: 'Hello World'
        }
      };
      
      // return await this._userClient.api("/chats/19:bdc61606-2b67-42d1-955b-a728bd455992_d1b22b2f-fc51-4fa3-9a3e-0d36b7179a7c@unq.gbl.spaces/messages").post(chatMessage);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Initialize App Settings
   * 
   * @param {AppSettings} appSettings
   * @returns {void}
   */
  private _initializeAppSettings(appSettings: AppSettings): void {
    try {
      this._appSettings = {
        clientId: appSettings.clientId,
        tenantId: appSettings.tenantId,
        graphUserScopes: appSettings.graphUserScopes,
      };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default MicrosoftGraphApiSetting;

