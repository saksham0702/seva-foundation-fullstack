import express from "express";
import { DonationController } from "./payments.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("donations")];

// Public donation & payment checkout routes
router.post("/create-order", DonationController.initiatePaymentOrder);
router.post("/verify", DonationController.verifyPayment);
router.post("/failed", DonationController.recordFailedPayment);
router.post("/create", DonationController.createDonation);

// Guarded admin donation management routes
router.post("/", ...guard, DonationController.createDonation);
router.get("/", ...guard, DonationController.getAllDonations);
router.get("/:id", ...guard, DonationController.getDonationById);
router.delete("/:id", ...guard, DonationController.deleteDonation);

export const DonationRoutes = router;