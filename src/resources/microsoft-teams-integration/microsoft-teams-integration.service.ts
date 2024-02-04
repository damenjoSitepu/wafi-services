import { user } from "@/resources/user/user.type";
import { microsoftTeamsIntegration } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.type";
import mongoose from "mongoose";
import { status } from "@/resources/status/status.type";
import { MicrosoftTeamsIntegrationsModel } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.model";
import { AppSettings } from "@/utils/contracts/microsoft-graph-api.contract";
import { ClientSecretCredential, DeviceCodeCredential, DeviceCodePromptCallback, OnBehalfOfCredential } from "@azure/identity";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import * as msal from "@azure/msal-node";
import { RequestInit, Response } from "node-fetch";
import { statement } from "@/utils/constants/statement.constant";
import { task } from "@/resources/task/task.type";

class MicrosoftTeamsIntegrationService {
  /**
   * Model
   */
  private _microsoftTeamsIntegrationModel = MicrosoftTeamsIntegrationsModel;

  /**
   * Define User Scopes
   */
  private _userScopes: string[] = [
    // 'user.read',
    // 'mail.read',
    // 'mail.send',
    // 'ChatMessage.Send',
    // 'Chat.ReadWrite',
  ]

  /**
   * Find Microsoft Teams Integrations
   * @param {user.Data} user 
   * @returns {Promise<void>}
   */
  public async find(user: user.Data): Promise<any> {
    try {
      return this._microsoftTeamsIntegrationModel.findOne({
        uid: user.uid,
      }).select(["tenantId","clientId","isIntegrated","accessToken"]);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Store Microsoft Teams Integration
   * 
   * @param {user.Data} user
   * @param {microsoftTeamsIntegration.Request} microsoftTeamsIntegration 
   * @returns {Promise<string>}
   */ 
  public async store(user: user.Data, request: microsoftTeamsIntegration.Request, session: mongoose.mongo.ClientSession): Promise<string> {  
    try {
      const microsoftTeamsIntegration = await this._microsoftTeamsIntegrationModel.findOne({ uid: user.uid });

      let _action: string = "CREATE";
      if (!microsoftTeamsIntegration) {
        await this._microsoftTeamsIntegrationModel.create([{
          uid: user.uid,
          clientId: request.clientId,
          tenantId: request.tenantId,
          userScopes: this._userScopes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }], { session }); 

      } else {
        await this._microsoftTeamsIntegrationModel.updateOne({
          uid: user.uid,
        }, {
          clientId: request.clientId,
          tenantId: request.tenantId,
        });
        _action = "UPDATE";
      }

      return _action;
    } catch (e: any) {
      throw new Error(e.message);
    } 
  } 

  /**
   * Get Chats From Microsoft Teams Integration
   * @param {user.Data} user 
   * @returns {Promise<any>}
   */
  public async chats(user: user.Data): Promise<any> {
    try {
      const microsoftTeamsIntegration = await this._microsoftTeamsIntegrationModel.findOne({
        uid: user.uid
      });

      if (!microsoftTeamsIntegration?.accessToken) {
        throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.EMPTY_TOKEN);
      }

      const response: globalThis.Response = await fetch(`${process.env.MICROSOFT_GRAPH_API}/chats?$top=50&$filter=topic ne null`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${microsoftTeamsIntegration?.accessToken}`,
        },
      });

      if (!response.ok) {
        await this.removeToken(user.uid);
        throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.INVALID_TOKEN);
      }
      return await response.json() as microsoftTeamsIntegration.Chat[];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Send Task Via Chat
   * 
   * @param {task.Request} req 
   * @returns {Promise<void>}
   */
  public async sendTaskViaChat(req: task.Request, user: user.Data): Promise<void> {
    try {
      if (req.microsoftIntegration?.agreementConfirmation) {
        const microsoftTeamsIntegration = await this._microsoftTeamsIntegrationModel.findOne({
          uid: user.uid
        });
  
        if (!microsoftTeamsIntegration?.accessToken) {
          throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.EMPTY_TOKEN);
        }

        const chatId: string | undefined = req.microsoftIntegration.selectedChat?.id;
        if (!chatId) return;

        const content: string = req.microsoftIntegration.templateMessage.replace("{TASK_NAME}", req.name ?? "");

        const response = await fetch(`${process.env.MICROSOFT_GRAPH_API}/chats/${chatId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${microsoftTeamsIntegration?.accessToken}`,
            "Content-Type": "application/json"
          }, 
          body: JSON.stringify({
            body: {
              content
            }
          })
        })

        if (!response.ok) {
          throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.INVALID_TOKEN);
        }
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Get My Profile
   * 
   * @param {user.Data} user 
   * @returns {Promise<microsoftTeamsIntegration.UserMetaData>}
   */
  public async me(user: user.Data): Promise<microsoftTeamsIntegration.UserMetaData> {
    try {
      const microsoftTeamsIntegration = await this._microsoftTeamsIntegrationModel.findOne({
        uid: user.uid
      });

      if (!microsoftTeamsIntegration?.accessToken) {
        throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.EMPTY_TOKEN);
      }

      const response: globalThis.Response = await fetch(`${process.env.MICROSOFT_GRAPH_API}/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${microsoftTeamsIntegration?.accessToken}`,
        },
      });
      if (!response.ok) {
        await this.removeToken(user.uid);
        throw new Error(statement.MICROSOFT_TEAMS_INTEGRATION.INVALID_TOKEN);
      }

      return await response.json() as microsoftTeamsIntegration.UserMetaData;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Remove Token
   * 
   * @param {string} uid
   * @returns {Promise<void>} 
   */
  public async removeToken(uid: string): Promise<void> {
    try {
      await this._microsoftTeamsIntegrationModel.updateOne({
        uid,
      }, {
        accessToken: "",
        accessTokenExpiresOn: 0,
        updatedAt: Date.now(),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default MicrosoftTeamsIntegrationService;