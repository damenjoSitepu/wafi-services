import AuthServiceContract from "@/resources/auth/auth-service.contract";
import { statement } from "@/utils/constants/statement.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserCredential, signInWithEmailAndPassword,  } from "firebase/auth";

class AuthService implements AuthServiceContract {
  /**
   * Sign In With Email and Password
   * 
   * @param {string} email
   * @param {string} password 
   * @returns {Promise<UserCredential>}
   */
  public async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(
        FirebaseService.getInstance().getFirebaseAuth(),
        email,
        password
      );
    } catch (e: any) {
      throw new Error(statement.AUTH.FAIL_LOGIN);
    }
  }

  /**
   * Verify Id Token
   * 
   * @param {string} idToken 
   * @returns {Promise<DecodedIdToken>}
   */
  public async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await FirebaseService.getInstance().getFirebaseAdmin().auth().verifyIdToken(idToken);
    } catch (e: any) {
      throw new Error(statement.AUTH.FAIL_VERIFY_TOKEN);
    }
  }
}

export default AuthService;