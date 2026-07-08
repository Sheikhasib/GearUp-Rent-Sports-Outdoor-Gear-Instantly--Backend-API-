import { Router } from "express";
import auth from "../../middleware/auth";
import { categoryController } from "./category.controller";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Create category route
router.post("/", auth(Role.ADMIN), categoryController.createCategory);

// Get all categories route
router.get("/", categoryController.getAllCategories);

// Update category route
router.patch("/:id", auth(Role.ADMIN), categoryController.updateCategory);

// Delete category route
router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
