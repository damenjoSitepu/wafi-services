import { DeviceCodeCredential, DeviceCodePromptCallback } from '@azure/identity';
import { AppSettings } from '@/utils/contracts/microsoft-graph-api.contract';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Client } from '@microsoft/microsoft-graph-client';
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

