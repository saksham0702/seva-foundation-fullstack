import express from "express";
import { VolunteerApplicationController } from "./volunteerapplications.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("volunteer-applications")];

// Public — the "Get Involved" page form submits here. No auth.
router.post("/", VolunteerApplicationController.createVolunteerApplication);

// Admin routes
router.get("/", ...guard, VolunteerApplicationController.getAllVolunteerApplications);
router.get("/:id", ...guard, VolunteerApplicationController.getVolunteerApplicationById);
router.patch(
  "/:id/status",
  ...guard,
  VolunteerApplicationController.updateVolunteerApplicationStatus
);
router.delete("/:id", ...guard, VolunteerApplicationController.deleteVolunteerApplication);

export const VolunteerApplicationRoutes = router;