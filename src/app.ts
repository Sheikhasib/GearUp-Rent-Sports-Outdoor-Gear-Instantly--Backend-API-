import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import notFoundHandler from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { categoryRoutes } from "./modules/category/category.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { providerRoutes } from "./modules/provider/provider.route";
import { rentalOrderRoutes } from "./modules/rentalOrder/rentalOrder.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";

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
  res.send("Welcome to the GearUp Rental API!");
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies

// Auth routes
app.use("/api/auth", authRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Gear routes
app.use("/api/gear", gearRoutes);

// Provider routes
app.use("/api/provider", providerRoutes);

// Rental Orders routes
app.use("/api/rentals", rentalOrderRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Catches anything that didn't match a route above
app.use(notFoundHandler);

// Catches everything thrown/rejected inside route handlers
app.use(globalErrorHandler);

export default app;
