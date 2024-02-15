import CreateTask from "@/seeders/task/create-task";

class Seeder {
  /**
   * Execute The Function
   * 
   * @returns {void}
   */
  public exec(): void {
    try {
      (new CreateTask()).listen();
    } catch (e: any) {}
  }
}

export default Seeder;