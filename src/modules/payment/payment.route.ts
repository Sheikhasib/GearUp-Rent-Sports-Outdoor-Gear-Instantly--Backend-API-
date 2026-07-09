import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

// 1. Create payment session route
router.post(
  "/create",
  auth(Role.CUSTOMER),
  paymentController.createPaymentSession,
);

// 2. Confirm payment route
// SSLCommerz posts here directly - see comment in payment.controller.ts
router.post("/confirm", paymentController.confirmPayment);

// 3. Get Customer payment route
router.get(
  "/customer",
  auth(Role.CUSTOMER),
  paymentController.getCustomerPayment,
);

// 4. Get Payment By Id route
router.get("/:id", auth(), paymentController.getPaymentById);

export const paymentRoutes = router;
