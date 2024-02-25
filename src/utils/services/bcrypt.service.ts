import bcrypt from "bcrypt";

class BcryptService {
  private _saltRounds: number = 10;

  /**
   * Get Salt Rounds
   * 
   * @returns {number}
   */
  public getSaltRounds(): number {
    return this._saltRounds;
  }

  /**
   * Hash Values
   * @param {string} value 
   * @returns {Promise<string>}
   */
  public async hash(value: string): Promise<string> {
    try {
      return (await bcrypt.hash(value, this._saltRounds)).trim();
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Compare Between Non Hashed String and Hashed String
   * 
   * @param {string} nonHash 
   * @param {string} hash 
   * @returns {Promise<boolean>}
   */
  public async compare(nonHash: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(nonHash, hash);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default BcryptService;