import "module-alias/register";
import App from "./app";

const PORT: number = Number(process.env.PORT) || 8080;

try {
  const app = new App(PORT);
  app.listen();
} catch (e: any) {
  console.log(e.message);
}



