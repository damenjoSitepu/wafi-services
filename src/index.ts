import "dotenv/config";
import "module-alias/register";
import App from "./app";
import TaskController from "@/resources/task/task.controller";
import LoginController from "@/resources/auth/login/login.controller";
import AuthController from "@/resources/auth/auth.controller";
import StatusController from "@/resources/status/status.controller";
import MicrosoftTeamsIntegrationController from "@/resources/microsoft-teams-integration/microsoft-teams-integration.controller";

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
    ]
  )).listen();
} catch (e: any) {
  console.log(e.message);
}