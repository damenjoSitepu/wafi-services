import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { statement } from "@/utils/constants/statement.constant";
import FirebaseServiceContract from "@/utils/contracts/firebase-service.contract";
import admin from "firebase-admin";
const serviceAccount = require("../../../serviceAccountKey.json");

class FirebaseService implements FirebaseServiceContract {
  /**
   * Define Firebase Instance
   */
  private static _instance: FirebaseService | null;

  /**
   * Firebase App
   */
  private _firebaseApp!: FirebaseApp;

  /**
   * Firebase Admin
   */
  private _firebaseAdmin!: admin.app.App;

  /**
   * Firebase Auth
   */
  private _firebaseAuth!: Auth;

  private constructor() { }
  
  /**
   * Get Instance
   * @returns 
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService._instance) {
      FirebaseService._instance = new FirebaseService();
    }
    return FirebaseService._instance;
  }

  /**
   * Set Firebase App
   */
  public setFirebaseApp(): void {
    try {
      this._firebaseApp = initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      });
    } catch (e: any) {
      throw new Error(statement.FIREBASE_APP.INITIALIZED_FAIL);
    }
  }

  /**
   * Get Firebase App
   * @returns
   */
  public getFirebaseApp(): FirebaseApp {
    return this._firebaseApp;
  }

  /**
   * Set Firebase Auth
   * 
   * @returns {void}
   */
  public setFirebaseAuth(): void {
    try {
      if (!this._firebaseApp) {
        throw new Error(statement.FIREBASE_APP.INITIALIZED_AUTH_FAIL);
      }
      this._firebaseAuth = getAuth(this._firebaseApp);
    } catch (e: any) {
      throw new Error(statement.FIREBASE_APP.INITIALIZED_AUTH_FAIL);
    }
  }

  /**
   * Get Firebase Auth
   * 
   * @returns {void}
   */
  public getFirebaseAuth(): Auth {
    return this._firebaseAuth;
  }

  /**
   * Set Firebase Admin
   * 
   * @returns void
   */
  public setFirebaseAdmin(): void {
    try {
      this._firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e: any) {
      throw new Error(statement.FIREBASE_APP.INITIALIZED_ADMIN_FAIL);
    }
  }

  /**
   * Get Firebase Admin
   * 
   * @returns {admin.app.App}
   */
  public getFirebaseAdmin(): admin.app.App {
    return this._firebaseAdmin;
  }
}

export default FirebaseService;