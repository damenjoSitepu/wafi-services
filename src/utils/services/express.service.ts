import { RateLimitRequestHandler } from './../../../node_modules/express-rate-limit/dist/index.d';
import { rateLimit } from 'express-rate-limit';

class ExpressService {
  private static _instance: ExpressService;

  /**
   * Get Instance
   * 
   * @returns {ExpressService}
   */
  public static getInstance(): ExpressService {
    if (!this._instance) {
      this._instance = new ExpressService();
    }
    return this._instance;
  }

  /**
   * Rate Limiter
   * 
   * @returns {RateLimitRequestHandler}
   */
  public enableRateLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 30000,
      limit: 100,
      standardHeaders: 'draft-7',
      legacyHeaders: true
    });
  }
}

export default ExpressService;