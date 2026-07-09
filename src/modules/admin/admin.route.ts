import { Router } from "express";
import { adminController } from "./admin.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// 1. Get All Users route
router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);

// 2. Update User Status
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);

// 3. Get All Gear Items route
router.get("/gear", auth(Role.ADMIN), adminController.getAllGears);

// 4. Get All Rental Orders route
router.get(
  "/rentalOrders",
  auth(Role.ADMIN),
  adminController.getAllRentalOrders,
);

export const adminRoutes = router;
