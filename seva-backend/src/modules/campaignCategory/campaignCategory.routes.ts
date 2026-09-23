import express from "express";
import { CategoryController } from "./campaignCategory.controller";
import { CategoryValidation } from "./campaignCategory.validation";
import { validateRequest } from "../../middlewares/validateRequest"; // I need to create this middleware

const router = express.Router();

router.post(
  "/create",
  CategoryController.createCategory
);
router.post(
  "/",
  CategoryController.createCategory
);

router.get("/get-all", CategoryController.getAllCategories);
router.get("/", CategoryController.getAllCategories);

router.get("/get-by-id/:id", CategoryController.getCategoryById);
router.get("/:id", CategoryController.getCategoryById);

router.patch(
  "/update/:id",
  CategoryController.updateCategory
);
router.patch(
  "/:id",
  CategoryController.updateCategory
);

router.delete("/delete/:id", CategoryController.deleteCategory);
router.delete("/:id", CategoryController.deleteCategory);

export const CategoryRoutes = router;
