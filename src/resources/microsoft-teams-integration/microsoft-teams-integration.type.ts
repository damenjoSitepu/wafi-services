export namespace microsoftTeamsIntegration {
  export type Data = {
    _id: string;
    uid: string;
    clientId: string;
    tenantId: string;
    userScopes: string[];
    accessToken: string;
    createdAt: string;
  };

  export type Request = {
    clientId?: string;
    tenantId?: string;
  };

  export type UserMetaData = {
    givenName: string;
    surname: string;
    mail: string;
    id: string;
  };

  export type Chat = {
    id: string;
    topic: string | null;
    createdDateTime: string;
    lastUpdatedDateTime: string;
    chatType: "oneOnOne" | "group";
    webUrl: string;
    tenantId: string;
    onlineMeetingInfo: string | null;
    viewpoint: {
      isHidden: boolean;
      lastMessageReadDateTime: string;
    }
  };
};
