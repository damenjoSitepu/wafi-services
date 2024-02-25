import { UtilServiceContract } from "@/utils/contracts/util-service.contract";
import crypto from "crypto";

class UtilService implements UtilServiceContract {
  /**
   * Convert JSON To Array Of Key And Values
   * 
   * @param {any} objects 
   * @returns {key: string, value: any[]}
   */
  public convertJSONToArrayOfKeyAndValues(objects: any): { key: string, value: any }[] {
    try {
      if (!objects) {
        return [];
      }

      const arrays: { key: string, value: any }[] = [];
      for (let key in objects) {
        try {
          arrays.push({ key, value: objects[key] });
        } catch (e: any) {}
      }

      return arrays;
    } catch (e: any) {
      return [];
    }
  }

  /**
   * Generate Secure Random String
   *  
   * @returns {string}
   */
  public generateRandomSecureString(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let length = 20;
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  /**
   * Generate Wafi Default Password using random string method
   * 
   * @returns {string}
   */
  public generateWafiDefaultPassword(): string {
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += this.generateRandomString(5);
        if (i !== 4) {
            result += ' '; 
        }
    }
    return result.substring(0, result.length - 1);
  }

  /**
   * Generate Normal Random String
   * 
   * @param {number} length 
   * @returns {string}
   */
  public generateRandomString(length: number): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
  }
}

export default UtilService;