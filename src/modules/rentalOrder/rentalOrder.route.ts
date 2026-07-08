import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { rentalOrderController } from "./rentalOrder.controller";

const router = Router();

// 1. Create rental order route
router.post("/", auth(Role.CUSTOMER), rentalOrderController.createRentalOrder);

// 2. Get Customer rental orders route
router.get(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.getCustomerRentalOrders,
);

// 4. Get rental order by id route
router.get("/:id", auth(), rentalOrderController.getRentalOrderById);

// 5. Cancel rental order route
router.patch("/cancel/:id", auth(), rentalOrderController.cancelRentalOrder);

export const rentalOrderRoutes = router;
