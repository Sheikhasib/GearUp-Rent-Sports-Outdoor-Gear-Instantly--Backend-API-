import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { rentalOrderController } from "./rentalOrder.controller";

const router = Router();

// Create rental order route
router.post("/", auth(Role.CUSTOMER), rentalOrderController.createRentalOrder);

// Get Customer rental orders route
router.get(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.getCustomerRentalOrders,
);

// Get rental order by id route
router.get("/:id", auth(), rentalOrderController.getRentalOrder);

// Cancel rental order route
router.delete("/:id", auth(), rentalOrderController.cancelRentalOrder);

export const rentalOrderRoutes = router;
