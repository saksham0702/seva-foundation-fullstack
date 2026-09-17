import express from "express";
import { DonorController } from "./donors.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("donations")];

// Public donor creation (for donation checkout flow)
router.post("/", DonorController.createDonor);

// Admin-guarded donor endpoints
router.get("/", ...guard, DonorController.getAllDonors);
router.get("/:id", ...guard, DonorController.getDonorById);
router.patch("/:id", ...guard, DonorController.updateDonor);
router.delete("/:id", ...guard, DonorController.deleteDonor);

export const DonorRoutes = router;