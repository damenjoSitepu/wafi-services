import { microsoftTeamsIntegration as originalMicrosoftTeamsIntegration } from "@/resources/microsoft-teams-integration/microsoft-teams-integration.type";

export namespace task {
  export type Data = {
    _id: string;
    uid: string;
    name: string;
    order: number;
    isComplete: boolean;
    assignedAt: number;
    createdAt: string;
  };

  export type Request = {
    name?: string;
    order?: number;
    isComplete?: boolean;
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