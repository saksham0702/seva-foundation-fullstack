import express from "express";
import { VolunteerCategoryController } from "./volunteercategories.controller";
import { uploadVolunteerIcon } from "../../middlewares/uploadIcon";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("volunteer-categories")];

// Public — no auth. Frontend "Get Involved" page fetches the role grid here.
router.get("/public", VolunteerCategoryController.getPublicVolunteerCategories);

// Admin routes
router.get("/", ...guard, VolunteerCategoryController.getAllVolunteerCategories);
router.get("/options", ...guard, VolunteerCategoryController.getVolunteerCategoryOptions);
router.get("/:id", ...guard, VolunteerCategoryController.getVolunteerCategoryById);

router.post(
  "/",
  ...guard,
  uploadVolunteerIcon.single("icon"),
  VolunteerCategoryController.createVolunteerCategory
);

router.patch(
  "/:id",
  ...guard,
  uploadVolunteerIcon.single("icon"),
  VolunteerCategoryController.updateVolunteerCategory
);

router.delete("/:id", ...guard, VolunteerCategoryController.deleteVolunteerCategory);

export const VolunteerCategoryRoutes = router;