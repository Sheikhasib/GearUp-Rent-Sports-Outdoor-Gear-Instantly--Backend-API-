import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// 1. Create payment route
router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);

export const paymentRoutes = router;
