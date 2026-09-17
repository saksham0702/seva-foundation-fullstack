import { Router } from "express";
import { LeadController } from "./leads.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";

const router = Router();

// Public endpoints
router.post("/subscribe", LeadController.subscribeNewsletter);
router.post("/capture", LeadController.captureLead);

// Protected CRM endpoints
router.get("/stats", authMiddleware, LeadController.getLeadStats);
router.get("/", authMiddleware, LeadController.getAllLeads);
router.get("/:id", authMiddleware, LeadController.getLeadById);
router.post("/", authMiddleware, LeadController.createLead);
router.patch("/:id", authMiddleware, LeadController.updateLead);
router.delete("/:id", authMiddleware, LeadController.deleteLead);

export const LeadRoutes = router;
