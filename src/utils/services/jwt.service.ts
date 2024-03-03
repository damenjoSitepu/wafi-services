import { jwt } from "@/utils/contracts/jwt.contract";
import jsonwebtoken from "jsonwebtoken";
import { statement } from "@/utils/constants/statement.constant";
import CryptoService from "@/utils/services/crypto.service";

class JWTService implements jwt.Service {
  /**
   * Generate Token Base On User Payload
   * 
   * @param {jwt.Payload} payload 
   * @returns {string}
   */
  public generateToken(payload: jwt.Payload): string {
    try {
      return jsonwebtoken.sign(payload, String(process.env.JWT_SECRET_ID), {
        expiresIn: "1d",
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  /**
   * Verify The JSON Web Token
   * 
   * @param {string} accessToken 
   * @returns {Promise<any>}
   */
  public async verifyToken(accessToken: string): Promise<jwt.Payload> {
    try {
      accessToken = CryptoService.getInstance().decryptText(accessToken, process.env.APP_ID);
      return new Promise((resolve, reject) => {
        jsonwebtoken.verify(accessToken, String(process.env.JWT_SECRET_ID), (err, decoded) => {
          if (err) {
            return reject(statement.AUTH.FAIL_ACCESSING_SOURCE);
          }
          return resolve(decoded as jwt.Payload);
        })
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default JWTService;