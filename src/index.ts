import "module-alias/register";
import App from "./app";

const PORT: number = Number(process.env.PORT) || 8080;

const app = new App(PORT);
app.listen();


