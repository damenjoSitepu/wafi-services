import "dotenv/config";
import "module-alias/register";
import App from "./app";
import SocketIOApp from "@/sockets/app";
import TaskController from "@/resources/task/task.controller";
import LoginController from "@/resources/auth/login/login.controller";
import AuthController from "@/resources/auth/auth.controller";
import StatusController from "@/resources/status/status.controller";
import MicrosoftTeamsIntegrationController from "@/resources/microsoft-teams-integration/microsoft-teams-integration.controller";
import ActivityLogsController from "@/resources/activity-logs/activity-logs.controller";
import Seeder from "@/seeders/seeder";

const PORT: number = Number(process.env.PORT) || 8080;
const API_VERSION: string = process.env.API_VERSION || "";

try {
  (new App(
    PORT, 
    API_VERSION,
    [
      new TaskController(),
      new LoginController(),
      new AuthController(),
      new StatusController(),
      new MicrosoftTeamsIntegrationController(),
      new ActivityLogsController(),
    ],
  )).listen();

  // Seeder Initialization (DONT DO THIS IN PRODUCTION)
  // (new Seeder()).exec();
} catch (e: any) {
  console.log(e.message);
}