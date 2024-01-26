export namespace statement {
  export const EXPRESS_APP = {
    INITIALIZED: "Wafi Services Run Perfectly",
    NO_CONTROLLERS: "No controllers found! Please check your app configuration once again!",
    INVALID_API_VERSION: "Invalid api version! Please check your app configuration once again!",
    INVALID_REQUEST: "Sorry, but we could not process your request for now. Please try again later",
  };

  export const FIREBASE_APP = {
    INITIALIZED_FAIL: "Fail to initialize firebase app!",
    INITIALIZED_ADMIN_FAIL: "Fail to initialize firebase admin!",
    INITIALIZED_AUTH_FAIL: "Fail to initialize firebase auth!",
  };

  export const AUTH = {
    SUCCESS_LOGIN: "Succesfully login!",
    FAIL_LOGIN: "Fail to login. Please try again later!",
    FAIL_VERIFY_TOKEN: "Fail to verify token, or the token has been expired!",
    FAIL_ACCESSING_SOURCE: "Authentication for your credential was denied!",
  };

  export const TASK = {
    CREATED: "Successfully creating your task!",
    FAIL_CREATED: "Fail when creating your task!",
  };
}