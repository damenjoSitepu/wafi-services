import AuthServiceContract from "@/resources/auth/auth-service.contract";
import { statement } from "@/utils/constants/statement.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Auth, UserCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, updatePassword, signInWithEmailLink, fetchSignInMethodsForEmail } from "firebase/auth";
import UtilService from "@/utils/services/util.service";
import { UserModel } from "@/resources/user/user.model";
import MailService from "@/utils/services/mail.service";
const { v4: uuidv4 } = require('uuid');
import { user } from "@/resources/user/user.type";
import { Request } from "express"; 
import mongoose from "mongoose";
import BcryptService from "@/utils/services/bcrypt.service";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { emailTemplate } from "@/utils/constants/email-template.constant";
import JWTService from "@/utils/services/jwt.service";

class AuthService implements AuthServiceContract {
  /**
   * Services
   */
  private _utilService: UtilService = new UtilService();
  private _bcryptService: BcryptService = new BcryptService();
  private _jwtService: JWTService = new JWTService();

  /**
   * Models
   */
  private _userModel = UserModel;

  /**
   * Sign In With Email and Password
   * 
   * @param {Auth} auth
   * @param {string} email
   * @param {string} password 
   * @returns {Promise<UserCredential>}
   */
  public async signInWithEmailAndPassword(auth: Auth ,email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (e: any) {
      throw new Error(statement.AUTH.FAIL_LOGIN);
    }
  }

  /**
   * Send Verification Link To Email
   * 
   * @param {Request} req
   * @returns {Promise<{ isAlreadySended: boolean, user: any | undefined }>}
   */
  public async sendVerificationLinkToEmail(req: Request): Promise<{ isAlreadySended: boolean, user: any | undefined }> {
    try {
      const userExists = await this._userModel.findOne({ email: req.body.email });

      if (!userExists) throw new Error(statement.USER.FAIL_FIND);

      // Block if user exists and their is active has been enabled
      if (userExists && userExists.isActive) throw new Error(statement.AUTH.FAIL_SIGN_UP_ALREADY_ACTIVE);

      let activationToken: string = uuidv4();
      const link: string = String(process.env.GMAIL_SIGN_UP_USER_VERIFICATION).replace("{activationToken}", String(activationToken));
      const dateNow: Date = new Date();
      const dateNowPlusOneMinute: Date = new Date(new Date().setMinutes(dateNow.getMinutes() + 1));
      const verifyUserAt: number = new Date().setHours(0, 0, 0, 0);

      if ((userExists.access.verifyUserThrottle + 1) > 3) {
        userExists.access.verifyUserAt = new Date(verifyUserAt).setDate(new Date(verifyUserAt).getDate() + 1);
        userExists.access.verifyUserThrottle = 0;
        await userExists.save();
      }

      // Block when verify user usage today is more than 3
      if (new Date().setHours(0, 0, 0, 0) !== userExists.access.verifyUserAt && new Date().getTime() >= userExists.activationTokenExpiredAt) {
        throw new Error(statement.AUTH.FAIL_VERIFY_USER_MORE_THAN_THREE_IN_SAME_DAY);
      }

      if (userExists.email && (new Date().getTime()) <= userExists.activationTokenExpiredAt) throw new Error(statement.AUTH.FAIL_VERIFY_USER_ACTIVATION_WAIT_A_MINUTE);

      await MailService.getInstance().sendMail({
        to: userExists.email,
        subject: "Wafi Web App | Registration",
        html: emailTemplate.auth.resendSignUpVerification(link),
      });

      // Re-new Activation token code and activation token expired at
      userExists.activationToken = activationToken;
      userExists.activationTokenExpiredAt = dateNowPlusOneMinute.getTime();
      userExists.access.verifyUserThrottle += 1;
      await userExists.save();
      return { isAlreadySended: false, user: userExists };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  public async changePassword(immediately: string): Promise<any> {
    try {
      const user: any = await this._userModel.findOne({
        resetPasswordToken: immediately,
      });
      if (!user) throw new Error(statement.AUTH.FAIL_VERIFY_RESET_PASSWORD);

      const userRecord: UserRecord = await FirebaseService.getInstance().getFirebaseAdmin().auth().getUser(user.uid);
      const a = getAuth(FirebaseService.getInstance().getFirebaseApp()).currentUser;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Sign Up Functionality
   * 
   * @param {Request} req
   * @param {mongoose.mongo.ClientSession} session
   * @return {Promise<any>}
   */
  public async signUp(req: Request, session: mongoose.mongo.ClientSession): Promise<{ isAlreadySended: boolean, user: any | undefined, oneTimeDefPass?: string }> {
    try {
      const userExists = await this._userModel.findOne({ email: req.body.email });
      
      // Block if user exists and their is active has been enabled
      if (userExists && userExists.isActive) throw new Error(statement.AUTH.FAIL_SIGN_UP_EMAIL_EXISTS);

      let activationToken: string = uuidv4();
      let uid: string = uuidv4();
      const link: string = String(process.env.GMAIL_SIGN_UP_USER_VERIFICATION).replace("{activationToken}", String(activationToken));
      const password: string = req.body.password ? req.body.password : this._utilService.generateWafiDefaultPassword();
      const hashedPassword = await this._bcryptService.hash(password)
      const dateNow: Date = new Date();
      const dateNowPlusOneMinute: Date = new Date(new Date().setMinutes(dateNow.getMinutes() + 1));
      const verifyUserAt: number = new Date().setHours(0, 0, 0, 0);

      // Create User when user has never been exists
      if (!userExists) {
        const name: string = req.body.email ? req.body.email.split("@")[0] : "Unknown";

        if (req.body.email) {
          await MailService.getInstance().sendMail({
            to: req.body.email,
            subject: "Wafi Web App | Registration",
            html: emailTemplate.auth.signUpVerification(link),
          });

          const createdUser: any = await this._userModel.create([{
            uid,
            name,
            email: req.body.email,
            password: hashedPassword,
            classifiedAs: "beta",
            createdAt: dateNow.getTime(),
            updatedAt: dateNow.getTime(),
            modifiedBy: uid,
            isActive: false,
            activationToken: activationToken,
            activationTokenExpiredAt: dateNowPlusOneMinute.getTime(),
            access: {
              verifyUserAt: verifyUserAt,
              verifyUserThrottle: 0,
            }
          }], { session });

          const returnData = { isAlreadySended: false, user: createdUser[0] };
          return req.body.password ? returnData : { ...returnData, oneTimeDefPass: password };
        }
      }

      // Re-send the Email Verification When User has been exists and is active is still not enabled
      if (userExists && !userExists.isActive) {
        if ((userExists.access.verifyUserThrottle + 1) > 3) {
          userExists.access.verifyUserAt = new Date(verifyUserAt).setDate(new Date(verifyUserAt).getDate() + 1);
          userExists.access.verifyUserThrottle = 0;
          await userExists.save();
        }

        // Block when verify user usage today is more than 3
        if (new Date().setHours(0, 0, 0, 0) !== userExists.access.verifyUserAt && new Date().getTime() >= userExists.activationTokenExpiredAt) {
          throw new Error(statement.AUTH.FAIL_VERIFY_USER_MORE_THAN_THREE_IN_SAME_DAY);
        }

        if (userExists.email && (new Date().getTime()) >= userExists.activationTokenExpiredAt) {
          await MailService.getInstance().sendMail({
            to: userExists.email,
            subject: "Wafi Web App | Registration",
            html: emailTemplate.auth.resendSignUpVerification(link),
          });

          // Re-new Activation token code and activation token expired at
          userExists.activationToken = activationToken;
          userExists.activationTokenExpiredAt = dateNowPlusOneMinute.getTime();
          userExists.access.verifyUserThrottle += 1;
          await userExists.save();
          return { isAlreadySended: false, user: userExists };
        }
      }

      return { isAlreadySended: true, user: userExists };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Verify Reset Password Token
   * 
   * @param {string} token 
   * @returns {Promise<boolean>}
   */
  public async verifyResetPasswordToken(token: string): Promise<boolean> {
    try {
      const user: any = await this._userModel.findOne({
        resetPasswordToken: token,
      });

      if (!user) return false;

      if (new Date().getTime() >= user.resetPasswordTokenExpiredAt) {
        user.resetPasswordToken = "";
        user.resetPasswordTokenExpiredAt = 0;
        user.save();
        return false;
      }

      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Login Functionality
   * 
   * @param {string} email 
   * @param {string} password
   * @returns {Promise<string>}
   */
  public async login(email: string, password: string): Promise<string> {
    try {
      const user: user.Data | null = await this._userModel.findOne({
        email
      });
      // Fail To Find User
      if (!user) throw new Error(statement.AUTH.FAIL_LOGIN);
      if (! await this._bcryptService.compare(password, user.password ?? "")) throw new Error(statement.AUTH.FAIL_LOGIN);

      // Generate JWT Token When User Successfully Login
      return this._jwtService.generateToken({
        uid: user.uid,
        email: user.email
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Verify User After Sign Up
   * 
   * @param {string} activationToken 
   * @returns {Promise<any>}
   */
  public async verifyUser(activationToken: string): Promise<any> {
    try {
      if (!activationToken) throw new Error();

      const user: any = await this._userModel.findOne({
        activationToken,
      });
      if (!user) throw new Error();

      // Check User Activation Token Expiration Time
      if (new Date().getTime() >= user.activationTokenExpiredAt) throw new Error();

      user.activationToken = "";
      user.isActive = true;
      user.activationTokenExpiredAt = 0;
      user.save();
    } catch (e: any) {
      throw new Error(e.message);
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

  /**
   * Send Reset Password Link
   * 
   * @param {user.Data} user 
   * @returns {Promise<void>}
   */
  public async sendResetPasswordLink(user: user.Data): Promise<void> {
    try {
      let resetPasswordActivationToken: string = uuidv4();
      let link: string = String(process.env.RESET_PASSWORD_USER_REDIRECT_URL_TO_WEB_APP).replace("{indication}", "true").replace("{immediately}", resetPasswordActivationToken);
      const dateNow: Date = new Date();
      const dateNowPlusFiveMinute: Date = new Date(new Date().setMinutes(dateNow.getMinutes() + 5));

      await MailService.getInstance().sendMail({
        to: user.email,
        subject: "Wafi Web App | Reset Password Link Verification",
        html: `<p>Here's the <a href='${link}'>link</a> for reset password verification. Hope you understand that credential is so important to you, so don't forget it anymore.</p>`,
      });

      await this._userModel.updateOne({
        uid: user.uid,
        email: user.email
      }, {
        resetPasswordToken: resetPasswordActivationToken,
        resetPasswordTokenExpiredAt: dateNowPlusFiveMinute,
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default AuthService;