import express from "express";
import { CategoryController } from "./campaignCategory.controller";
import { CategoryValidation } from "./campaignCategory.validation";
import { validateRequest } from "../../middlewares/validateRequest"; // I need to create this middleware

const router = express.Router();

router.post(
  "/create",
  // validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router.get("/get-all", CategoryController.getAllCategories);

router.get("/get-by-id/:id", CategoryController.getCategoryById);

router.patch(
  "/update/:id",
  // validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete("/delete/:id", CategoryController.deleteCategory);

export const CategoryRoutes = router;
