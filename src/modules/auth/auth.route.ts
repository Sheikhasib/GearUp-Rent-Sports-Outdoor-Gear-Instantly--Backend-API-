import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Register route
router.post("/register", authController.registerUser);

// Login route
router.post("/login", authController.loginUser);

// Get Me route
router.get("/me", auth(), authController.getMe);

export const authRoutes = router;
