export namespace statement {
  export const EXPRESS_APP = {
    INITIALIZED: "Wafi Services Run Perfectly",
    NO_CONTROLLERS: "No controllers found. Please check your app configuration once again.",
    INVALID_API_VERSION: "Invalid api version. Please check your app configuration once again.",
    INVALID_REQUEST: "Sorry, but we could not process your request for now. Please try again later",
  };

  export const FIREBASE_APP = {
    INITIALIZED_FAIL: "Fail to initialize firebase app.",
    INITIALIZED_ADMIN_FAIL: "Fail to initialize firebase admin.",
    INITIALIZED_AUTH_FAIL: "Fail to initialize firebase auth.",
  };

  export const AUTH = {
    SUCCESS_LOGIN: "Succesfully login.",
    FAIL_LOGIN: "Fail to login. Please try again later.",
    FAIL_VERIFY_TOKEN: "Fail to verify token, or the token has been expired.",
    FAIL_ACCESSING_SOURCE: "Authentication for your credential was denied.",
  };

  export const TASK = {
    CREATED: "Successfully creating your task.",
    FAIL_CREATED: "Fail when creating your task.",
    GET: "Successfully getting your task.",
    FAIL_GET: "Fail when getting your task.",
    DESTROY: "Successfully deleting your task.",
    FAIL_DESTROY: "Fail when deleting your task.",
    SWAP: "Successfully swap your task order.",
    FAIL_SWAP: "Fail when swap your task order.",
    SHOW: "Successfully finding your task.",
    FAIL_SHOW: "Fail when find your task.",
    UPDATE: "Successfully updating your task.",
    FAIL_UPDATE: "Fail when updating your task.",
    SEND_TO_MICROSOFT_TEAMS: "Successfully send your task to microsoft teams.",
    FAIL_SEND_TO_MICROSOFT_TEAMS: "Fail when send your task to microsoft teams.",
  };

  export const STATUS = {
    CREATED: "Successfully creating your status.",
    FAIL_CREATED: "Fail when creating your status.",
    GET: "Successfully getting your status.",
    FAIL_GET: "Fail when getting your status.",
    DESTROY: "Successfully deleting your status.",
    FAIL_DESTROY: "Fail when deleting your status.",
    SWAP: "Successfully swap your status order.",
    FAIL_SWAP: "Fail when swap your status order.",
    SHOW: "Successfully finding your status.",
    FAIL_SHOW: "Fail when find your status.",
    UPDATE: "Successfully updating your status.",
    FAIL_UPDATE: "Fail when updating your status.",
    FAIL_DESTROY_TASK_DETECTED: "Failed to delete this status because it is already in use in task creation",
  };

  export const MICROSOFT_TEAMS_INTEGRATION = {
    CREATE: "Successfully creating your teams integration.",
    FAIL_CONNECT: "Fail when connecting your teams integration.",
    GET: "Successfully getting your teams integration.",
    FAIL_GET: "Fail when getting your teams integration.",
    DESTROY: "Successfully deleting your teams integration.",
    FAIL_DESTROY: "Fail when deleting your teams integration.",
    SWAP: "Successfully swap your teams integration order.",
    FAIL_SWAP: "Fail when swap your teams integration order.",
    SHOW: "Successfully finding your teams integration.",
    FAIL_SHOW: "Fail when find your teams integration.",
    UPDATE: "Successfully updating your teams integration.",
    FAIL_UPDATE: "Fail when updating your teams integration.",
    GET_ME: "Successfully getting my profile on teams integration.",
    FAIL_GET_ME: "Fail when getting my profile on the teams integration.",
    INVALID_TOKEN: "Invalid token or the token was already expired. Please re-connect your teams integration.",
    EMPTY_TOKEN: "Sorry, but we could not found your token. Please re-connect your teams integration.",
    DISCONNECT: "Successfully disconnecting your teams integration.",
    DISCONNECT_FAIL: "Fail when disconnecting your teams integration.",
    CHAT: "Successfully getting chats from teams integration.",
    FAIL_CHAT: "Fail when getting chats from teams integration.",
  };

  export const SOCKET_IO = {
    SUCCESS_CONNECT: "Successfully establish socket io connection.",
    FAIL_CONNECT: "Fail to connect socket io connection.",
  }

  export const ACTIVITY_LOGS = {
    SUCCESS_GET: "Successfully getting your activity logs.",
    FAIL_GET: "Fail when getting your activity logs.",
    SUCCESS_SHOW: "Successfully find your activity log.",
    FAIL_SHOW: "Fail when find your activity log.",
  }
}