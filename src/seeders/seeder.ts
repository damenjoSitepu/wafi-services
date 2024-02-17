import CreateTask from "@/seeders/task/create-task";
import CreateUser from "@/seeders/user/create-user";

class Seeder {
  /**
   * Execute The Function
   * 
   * @returns {void}
   */
  public exec(): void {
    try {
      // (new CreateTask()).listen();
      (new CreateUser()).listen();
    } catch (e: any) {}
  }
}

export default Seeder;