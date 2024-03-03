export namespace jwt {
  export type Payload = {
    uid: string;
    email: string;
  };  

  export type Service = {
    /**
     * Generate Token Base On User Payload
     * 
     * @param {jwt.Payload} payload 
     * @returns {string}
     */
    generateToken(payload: jwt.Payload): string;

    /**
     * Verify The JSON Web Token
     * 
     * @param {string} accessToken 
     * @returns {Promise<any>}
     */
    verifyToken(accessToken: string): Promise<jwt.Payload> 
  }
}