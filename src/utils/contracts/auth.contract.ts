import { user } from "@/resources/user/user.type";

interface AuthContract {
  /**
   * Set User Data For Authentication
   * 
   * @param {user.Data} user 
   * @returns {void}
   */
  setUser(user: user.Data): void;

  /**
   * Get User Data When Already Logged In
   * 
   * @returns {user.Data}
   */
  user(): user.Data;
}

export default AuthContract;