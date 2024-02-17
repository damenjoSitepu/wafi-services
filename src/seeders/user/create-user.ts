import { UserModel } from "@/resources/user/user.model";

class CreateUser {
  /**
   * Repeat Count
   */
  private _repeatCount: number = 1;

  /**
   * Task Prefix
   */
  private name: string = "Damenjo Sitepu";

  /**
   * Models
   */
  private _userModel = UserModel;

  /**
   * Listen To The Seeding
   * 
   * @returns {Promise<void>}
   */
  public async listen(): Promise<void> {
    try {
      if (this._repeatCount > 0) {
        for (let i = 0; i < this._repeatCount; i++) {
          await this._userModel.create({
            uid: "RTNo6USGz7MC89RzboipYptPPiw1",
            name: "Damenjo Sitepu",
            email: "damenjo21@gmail.com",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            modifiedBy: "RTNo6USGz7MC89RzboipYptPPiw1",
          });
        }
      }
    } catch (e: any) {}
  }
}

export default CreateUser;