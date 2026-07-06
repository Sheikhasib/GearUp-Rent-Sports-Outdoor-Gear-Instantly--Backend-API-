import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

// Get Me route
router.get("/me", authController.getMe);

export const authRoutes = router;
