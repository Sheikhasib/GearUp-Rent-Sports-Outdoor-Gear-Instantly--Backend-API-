import { Router } from "express";
import { adminController } from "./admin.controller";

const router = Router();

// 1. Get All Users route
router.get("/users", adminController.getAllUsers);

// 2. Update User Status
router.patch("/users/:id", adminController.updateUserStatus);

// 3. Get All Gear Items route
router.get("/gear", adminController.getAllGears);

// 4. Get All Rental Orders route
router.get("/rentalOrders", adminController.getAllRentalOrders);

export const adminRoutes = router;
