import express, { Application, Request, Response } from "express";

const PORT: number = Number(process.env.PORT) || 8080;

const app: Application = express();
app.enable('trust proxy');

app.get("/", (req: Request, res: Response) => {
  return res.json({
    error: false,
    message: "Wafi Services Runs Perfectly!",
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

