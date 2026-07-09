import { Router } from "express";
import { reviewController } from "./review.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// 1. Create review route
router.post("/", auth(Role.CUSTOMER), reviewController.createReview);

export const reviewRoutes = router;
