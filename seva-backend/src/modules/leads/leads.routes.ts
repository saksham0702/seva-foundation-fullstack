import { Router } from "express";
import { LeadController } from "./leads.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = Router();

// Public endpoints
router.post("/subscribe", LeadController.subscribeNewsletter);
router.post("/capture", LeadController.captureLead);

// Protected CRM routes guard
const crmGuard = [authMiddleware, permissionMiddleware("crm")];

// Protected CRM Configurations (registered before :id)
router.get("/configs", ...crmGuard, LeadController.getFollowUpConfigs);
router.post("/configs", ...crmGuard, LeadController.createFollowUpConfig);
router.patch("/configs/:id", ...crmGuard, LeadController.updateFollowUpConfig);
router.delete("/configs/:id", ...crmGuard, LeadController.deleteFollowUpConfig);

// Protected CRM stats & list
router.get("/stats", ...crmGuard, LeadController.getLeadStats);
router.get("/", ...crmGuard, LeadController.getAllLeads);
router.post("/", ...crmGuard, LeadController.createLead);

// Protected Lead single & follow-up routes
router.get("/:id", ...crmGuard, LeadController.getLeadById);
router.patch("/:id", ...crmGuard, LeadController.updateLead);
router.delete("/:id", ...crmGuard, LeadController.deleteLead);
router.post("/:id/follow-ups", ...crmGuard, LeadController.addFollowUp);

export const LeadRoutes = router;
