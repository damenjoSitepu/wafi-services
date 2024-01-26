import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import admin from "firebase-admin";

interface FirebaseServiceContract {
  /**
   * Set Firebase App
   */
  setFirebaseApp(): void;

  /**
   * Get Firebase App
   * @returns
   */
  getFirebaseApp(): FirebaseApp;

  /**
   * Set Firebase Auth
   * 
   * @returns {void}
   */
  setFirebaseAuth(): void;

  /** 
   * Get Firebase Auth
   * 
   * @returns {void}
   */
  getFirebaseAuth(): Auth;

  /**
   * Set Firebase Admin
   * 
   * @returns void
   */
  setFirebaseAdmin(): void;

  /**
   * Get Firebase Admin
   * 
   * @returns {admin.app.App}
   */
  getFirebaseAdmin(): admin.app.App; 
}

export default FirebaseServiceContract;