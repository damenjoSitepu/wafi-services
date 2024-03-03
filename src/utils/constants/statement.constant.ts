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
    FAIL_LOGIN: "Invalid Email or Password. Please try again",
    FAIL_VERIFY_TOKEN: "Fail to verify token, or the token has been expired.",
    FAIL_ACCESSING_SOURCE: "Authentication for your credential was denied.",
    SUCCESS_ACCESSING_SOURCE: "Authentication for your credential was confirmed.",
    FAIL_ACCESSING_SOURCE_NOT_BETA_USER: "Authentication was denied cause you are not a beta user.",
    FAIL_SIGN_UP_NOT_AGREED: "Please agree first before clicking the signup button.",
    FAIL_SIGN_UP_MISSING_PASSWORD_CONFIRMATION: "Please fill password confirmation field.",
    FAIL_SIGN_UP_PLEASE_FILL_IS_AGREED_FIELD: "Please fill is agreement field before doing sign up.",
    FAIL_SIGN_UP_PASSWORD_DOESNT_MATCH: "Password doesn't match, please try again.",
    FAIL_SIGN_UP: "Fail to sign up. Please try again later or check your internet connection.",
    FAIL_SIGN_UP_EMAIL_EXISTS: "Email is already exists. Please choose another one.",
    FAIL_SIGN_UP_ALREADY_ACTIVE: "Your accound is already actived. Please login to continue.",
    FAIL_VERIFY_USER_ACTIVATION_WAIT_A_MINUTE: "Please wait for the next minute and try to send the new beta user verification link.",
    FAIL_VERIFY_USER_ACTIVATION_TOKEN_EXPIRED: "Fail to verify your beta user account.",
    SUCCESS_VERIFY_USER: "Successfully verifying your beta user account. Welcome On Board ^_^",
    FAIL_VERIFY_USER: "Fail to verify your beta user for some reason. Please try again.",
    VERIFY_USER_LINK_ALREADY_SENT: "It looks like you've already have a beta account, but you're not verified yet. So please wait for the next minute and try to send the new beta user verification link below.",
    FAIL_VERIFY_USER_MORE_THAN_THREE_IN_SAME_DAY: "Cannot verify your beta user today. Please try for the next day.",
    SUCCESS_SIGN_UP: "We have sent a verification link to your email. Please verify your email within 1 minute.",
    SUCCESS_SENT_VERIFICATION_LINK: "We have sent a verification link to your email. Please verify your email within 1 minute.",
    SUCCESS_SENT_RESET_PASSWORD_LINK: "Successfully sent your reset password link to your email. Please take a note that link only valid for 5 minutes",
    FAIL_VERIFY_RESET_PASSWORD: "Fail to verify your reset password token. It may caused because you didn't change the password at least five minutes ago.",
    SUCCESS_VERIFY_RESET_PASSWORD: "Successfully verify your reset password token.",
    SUCCESS_CHANGE_PASSWORD: "Successfully change your password. Please try to login the web app.",
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
    SUCCESS_TOGGLE_STARRED: "Successfully toggle starred your task.",
    FAIL_TOGGLE_STARRED: "Fail when toggle starred your task.",
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
    SUCCESS_GET_TIMELINE: "Successfully getting your activity logs timeline.",
    FAIL_GET_TIMELINE: "Fail when getting your activity logs timeline.",
  }

  export const USER = {
    SUCCESS_GET_PROFILE: "Successfully getting your profile.",
    FAIL_GET_PROFILE: "Fail when getting your profile.",
    FAIL_FIND: "Fail to find the user credential.",
    FAIL_FIND_BY_EMAIL: "Fail to find your email. Please try again.",
  }
}