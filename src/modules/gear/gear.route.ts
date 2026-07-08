import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

// 2. Get all gears route
router.get("/", gearController.getAllGears);

// 3. Get gear by id route
router.get("/:id", gearController.getGearById);

export const gearRoutes = router;
