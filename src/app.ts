import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Home/Root route
app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to the GearUp API!");
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies

export default app;
