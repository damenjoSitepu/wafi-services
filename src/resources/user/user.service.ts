import { user } from "@/resources/user/user.type";
import { UserModel } from "@/resources/user/user.model";

class UserService {
  /**
   * Models
   */
  private _userModel = UserModel;

  /**
   * Find Certain User
   * 
   * @param {user.Data} user 
   * @returns {Promise<any>}
   */
    public async find(user: user.Data): Promise<any> {
      try {
        return await this._userModel.findOne({
          uid: user.uid,
        }).select({ email: 1, classifiedAs: 1, isActive: 1, name: 1, });
      } catch (e: any) {
        throw new Error(e.message);
      }
    }
}

export default UserService;