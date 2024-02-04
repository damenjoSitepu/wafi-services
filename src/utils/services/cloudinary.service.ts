import { statement } from "@/utils/constants/statement.constant";
import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {
  /**
   * Define Firebase Instance
   */
  private static _instance: CloudinaryService | null;

  /**
   * Cloudinary Instance
   */
  private _cloudinary: any;
  
  /**
   * Get Instance
   * 
   * @returns {CloudinaryService}
   */
  public static getInstance(): CloudinaryService {
    if (!CloudinaryService._instance) {
      CloudinaryService._instance = new CloudinaryService();
    }
    return CloudinaryService._instance;
  }

  /**
   * Set Cloudinary Instance
   * 
   * @returns {void}
   */
  public setCloudinary(): void {
    try {
      cloudinary.config({
        secure: true,
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this._cloudinary = cloudinary;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Get Cloudinary Instance
   * @returns
   */
  public getCloudinary(): any {
    return this._cloudinary;
  }
}

export default CloudinaryService;