import { Router } from "express";
import { gearController } from "../gear/gear.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Provider Gear Routes
// 1. Create gear route
router.post("/gear", auth(Role.PROVIDER), gearController.createGear);

// 4. Get My/Provider Gears route
router.get("/my-gear", auth(Role.PROVIDER), gearController.getMyGears);

// 5. Update gear route
router.patch("/gear/:id", auth(Role.PROVIDER), gearController.updateGear);

// 6. Delete/Remove gear route
router.delete("/gear/:id", auth(Role.PROVIDER), gearController.deleteGear);

export const providerRoutes = router;
