import { user } from "@/resources/user/user.type";
import mongoose from "mongoose";
import { StatusModel } from "@/resources/status/status.model";
import { status } from "@/resources/status/status.type";
import { DashboardModel } from "@/resources/dashboard/dashboard.model";

class StatusService {
  /**
   * Model
   */
  private _statusModel = StatusModel;
  private _dashboardModel = DashboardModel;

  /**
   * Get Status
   * 
   * @returns {Promise<any>}
   */
  public async get(user: user.Data, q: string, page: number = 1): Promise<any> {
    try {
      const query: any = {
        uid: user.uid,
      };

      if (q) {
        query["name"] = { $regex: q, $options: "i" };
      }

      let skippedDocs: number = 0;
      if (page > 1) {
        skippedDocs = (page - 1) * Number(process.env.PAGINATION_PER_PAGE);
      }

      return await this._statusModel.find(query).sort({
        order: -1
      })
        .skip(skippedDocs)
        .limit(Number(process.env.PAGINATION_PER_PAGE));
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Swap The Status Order
   * 
   * @param {user.Data} user 
   * @param {string} firstId 
   * @param {number} firstOrder 
   * @param {string} secondId 
   * @param {number} secondOrder 
   * @param {mongoose.mongo.ClientSession} session
   */
  public async swap(
    user: user.Data,
    firstId: string,
    firstOrder: number,
    secondId: string,
    secondOrder: number,
    session: mongoose.mongo.ClientSession
  ): Promise<void> {
    try {
      // First Data
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(firstId)
      }, {
        order: firstOrder,
      }, {
        session,
      });
      // Second Data
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(secondId)
      }, {
        order: secondOrder,
      }, {
        session,
      });
    } catch (e: any) {
      throw new Error(e.message);
    } 
  }

  /**
   * Store Status
   * 
   * @param {status.Request} status 
   * @returns {Promise<void>}
   */ 
  public async store(user: user.Data, status: status.Request, session: mongoose.mongo.ClientSession): Promise<void> {  
    try {
      const countStatus: number = await this._statusModel.countDocuments({
        uid: user.uid,
      });

      const currentDashboard = await this._dashboardModel.findOne({
        uid: user.uid,
        type: "Status",
        key: "Count",
      });

      if (currentDashboard) {
        await this._dashboardModel.updateOne({
          uid: user.uid,
          type: "Status",
          key: "Count",
        }, {
          value: countStatus + 1,
          updatedAt: Date.now(),
        }, {
          session
        });
      } else {
        await this._dashboardModel.create([{
          uid: user.uid,
          type: "Status",
          key: "Count",
          title: "Count Item",
          value: countStatus + 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }], { session });
      }

      await this._statusModel.create([{
        uid: user.uid,
        name: status.name,
        description: status.description,
        color: status.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }], { session });
    } catch (e: any) {
      throw new Error(e.message);
    } 
  } 

  /**
   * Destroy The Status
   * @param {user.Data} user 
   * @param {string} id 
   * @param {mongoose.mongo.ClientSession} session
   */
  public async destroy(user: user.Data, id: any, session: mongoose.mongo.ClientSession): Promise<void> {
    try {
      const currentDashboard = await this._dashboardModel.findOne({
        uid: user.uid,
        type: "Status",
        key: "Count",
      });

      if (currentDashboard) {
        const countStatus: number = await this._statusModel.countDocuments({
          uid: user.uid,
        });
        
        await this._dashboardModel.updateOne({
          uid: user.uid,
          type: "Status",
          key: "Count",
        }, {
          value: !countStatus || countStatus === 0 ? 0 : countStatus - 1,
          updatedAt: Date.now(),
        }, {
          session
        });
      }
      
      await this._statusModel.deleteOne({
        $and: [
          {
            uid: user.uid,
          },
          {
            _id: id
          }
        ]
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Find Certain Status
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @returns {Promise<status.Data | null>}
   */
  public async find(user: user.Data, id: string): Promise<status.Data | null> {
    try {
      return await this._statusModel.findOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Update Status
   * 
   * @param {user.Data} user 
   * @param {string} id 
   * @param {status.Request} status 
   */
  public async update(user: user.Data, id: string, status: status.Request): Promise<void> {
    try {
      await this._statusModel.updateOne({
        uid: user.uid,
        _id: new mongoose.mongo.ObjectId(id)
      }, {
        name: status.name,
        description: status.description,
        color: status.color,
        updatedAt: Date.now(),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default StatusService;