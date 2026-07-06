import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import notFoundHandler from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";

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

// Auth routes
app.use("/api/auth", authRoutes);

// Catches anything that didn't match a route above
app.use(notFoundHandler);

// Catches everything thrown/rejected inside route handlers
app.use(globalErrorHandler);

export default app;
