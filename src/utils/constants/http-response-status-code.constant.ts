export namespace httpResponseStatusCode {
  export const SUCCESS = {
    OK: 200,
    CREATED: 201,
    PERMANENT_REDIRECT: 301,
    INTERNAL_SERVER_ERROR: 500,
  };

  export const FAIL = {
    UNAUTHORIZED: 401,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  };
}