import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserCredential } from "firebase/auth";

interface AuthServiceContract {
  /**
   * Sign In With Email and Password
   * 
   * @param {string} email
   * @param {string} password 
   * @returns {Promise<UserCredential>}
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

  /**
   * Verify Id Token
   * 
   * @param {string} idToken 
   * @returns {Promise<DecodedIdToken>}
   */
  verifyIdToken(idToken: string): Promise<DecodedIdToken>;
}

export default AuthServiceContract;