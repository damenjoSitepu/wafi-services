import { microsoftTeamsIntegration as originalMicrosoftTeamsIntegration } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.type";

export namespace task {
  export type Data = {
    _id: string;
    uid: string;
    name: string;
    order: number;
    status: {
      _id: string;
      name: string;
      color: string;
    };
    isStarred: boolean;
    assignedAt: number;
    createdAt: number;
    createdBy: string;
    updatedAt: number;
  };

  export type Request = {
    name?: string;
    order?: number;
    status?: string;
    assignedAt?: number;
    microsoftIntegration?: task.microsoftIntegration.SendChatRequest;
  };

  export namespace microsoftIntegration {
    export type SendChatRequest = {
      agreementConfirmation: boolean;
      templateMessage: string;
      selectedChat: originalMicrosoftTeamsIntegration.Chat | undefined;
    };
  }
};