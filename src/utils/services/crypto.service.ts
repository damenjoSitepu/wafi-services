import * as CryptoJS from 'crypto-js';
import { Request } from 'express';

export class CryptoService {
  private _secretKey: string = Math.floor(Math.random() * 1000).toString();

  private static _instance: CryptoService | undefined = undefined;

  /**
   * Create Instance
   * 
   * @returns {CryptoService}
   */
  public static getInstance(): CryptoService {
    if (!CryptoService._instance) {
      CryptoService._instance = new CryptoService();
    }
    return CryptoService._instance;
  }

  /**
   * Encrypt Text
   * 
   * @param {string} text 
   * @returns {string}
   */
  public encryptText(text: string): string {
    if (!CryptoService._instance) return "";
    if (!text) return "";
    return CryptoJS.AES.encrypt(text, String(process.env.APP_ID)).toString();
  }

  /**
   * Decrypt Text
   * @param {string} ciphertext 
   * @param {string} secretKey
   * @returns {string}
   */
  public decryptText(ciphertext: string, secretKey?: string): string {
    if (!CryptoService._instance) return "";
    if (!ciphertext) return "";
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey ? secretKey : CryptoService._instance._secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Decrypt Payload
   * 
   * @param {Request} req 
   * @param {{ [encryptedKey: string]: string }} keywords
   * 
   * @returns {void}
   */
  public decryptPayload(req: Request, keywords: { [encryptedKey: string]: string }): void {
    try {
      // Decrypt The App Id
      const appId: string = CryptoService.getInstance().decryptText(req.body["_appId"], process.env.APP_ID);  
      for (let key in keywords) {
        req.body[keywords[key] as string] = CryptoService.getInstance().decryptText(req.body[key], appId);
        // Delete Hashed Payload
        delete req.body[key];
      }
    } catch (e: any) {}
  }
}
 
export default CryptoService;
