import { user } from "@/resources/user/user.type";
import AuthContract from "@/utils/contracts/auth.contract";

class AuthService implements AuthContract {
  /**
   * Define The Instance
   */
  private static _instance: AuthService;

  /**
   * Define The User Data
   */
  private _user!: user.Data;

  /**
   * Create Singleton Object
   * @returns {AuthService}
   */
  public static getInstance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }

  /**
   * Set User Data For Authentication
   * 
   * @param {user.Data} user 
   * @returns {void}
   */
  public setUser(user: user.Data): void {
    try {
      this._user = user;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }  

  /**
   * Get User Data When Already Logged In
   * 
   * @returns {user.Data}
   */
  public user(): user.Data {
    return this._user;
  }
}

export default AuthService;