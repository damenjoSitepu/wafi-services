import "dotenv/config";
import "module-alias/register";
import App from "./app";
import TaskController from "@/resources/task/task.controller";

const PORT: number = Number(process.env.PORT) || 8080;
const API_VERSION: string = process.env.API_VERSION || "";

try {
  (new App(
    PORT, 
    API_VERSION,
    [
      new TaskController()
    ]
  )).listen();
} catch (e: any) {
  console.log(e.message);
}