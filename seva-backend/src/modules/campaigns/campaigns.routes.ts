import express from "express";
import { CampaignController } from "./campaigns.controller";
import { uploadCampaignImage } from "../../middlewares/upload";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

// All campaign routes require authentication + campaigns permission
const guard = [authMiddleware, permissionMiddleware("campaigns")];

// Public read endpoints for website & donors
router.get("/", CampaignController.getAllCampaigns);
router.get("/options", CampaignController.getCampaignOptions);
router.get("/slug/:slug", CampaignController.getCampaignBySlug);
router.get("/slug/:slug/donors", CampaignController.getCampaignDonors);
router.get("/:id", CampaignController.getCampaignById);

// Admin-only mutations
router.post(
  "/",
  ...guard,
  uploadCampaignImage.array("images", 10),
  CampaignController.createCampaign
);

router.patch(
  "/:id/status",
  ...guard,
  CampaignController.toggleCampaignStatus
);

router.patch(
  "/:id",
  ...guard,
  uploadCampaignImage.array("images", 10),
  CampaignController.updateCampaign
);

router.delete("/:id", ...guard, CampaignController.deleteCampaign);

export const CampaignRoutes = router;
