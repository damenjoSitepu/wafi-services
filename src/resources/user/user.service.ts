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
   * @returns {Promise<user.Data | null>}
   */
    public async find(user: user.Data): Promise<user.Data | null> {
      try {
        return await this._userModel.findOne({
          uid: user.uid,
        });
      } catch (e: any) {
        throw new Error(e.message);
      }
    }
}

export default UserService;