import express from "express";
import multer from "multer";
import { MarketingController } from "./marketing.controller";

const router = express.Router();
const memoryUpload = multer({ storage: multer.memoryStorage() });

// ── Overall Stats & Audience ────────────────────────────────────────────────
router.get("/stats", MarketingController.getStats);
router.get("/audience-counts", MarketingController.getAudienceCounts);
router.get("/preview-recipients", MarketingController.previewRecipients);

// ── Campaigns ────────────────────────────────────────────────────────────────
router.get("/campaigns", MarketingController.getAllCampaigns);
router.get("/campaigns/:id", MarketingController.getCampaignById);
router.post("/campaigns", MarketingController.createCampaign);
router.delete("/campaigns/:id", MarketingController.deleteCampaign);
router.post("/campaigns/:id/start", MarketingController.startCampaign);
router.post("/campaigns/:id/pause", MarketingController.pauseCampaign);
router.post("/campaigns/:id/resume", MarketingController.resumeCampaign);
router.post("/campaigns/:id/retry-failed", MarketingController.retryFailedRecipients);

// ── Templates ────────────────────────────────────────────────────────────────
router.get("/templates", MarketingController.getAllTemplates);
router.get("/templates/:id", MarketingController.getTemplateById);
router.post("/templates", MarketingController.createTemplate);
router.patch("/templates/:id", MarketingController.updateTemplate);
router.put("/templates/:id", MarketingController.updateTemplate);
router.delete("/templates/:id", MarketingController.deleteTemplate);
router.post("/templates/seed", MarketingController.seedTemplates);

// ── Settings & Channels ──────────────────────────────────────────────────────
router.get("/config", MarketingController.getConfig);
router.post("/config", MarketingController.updateConfig);
router.get("/baileys/status", MarketingController.getBaileysStatus);
router.get("/status", MarketingController.getBaileysStatus);
router.get("/baileys/qr", MarketingController.getBaileysStatus);
router.get("/qr", MarketingController.getBaileysStatus);
router.post("/baileys/reconnect", MarketingController.reconnectBaileys);
router.post("/baileys/qr", MarketingController.reconnectBaileys);
router.post("/qr", MarketingController.reconnectBaileys);
router.post("/reconnect", MarketingController.reconnectBaileys);
router.post("/baileys/disconnect", MarketingController.disconnectBaileys);
router.post("/disconnect", MarketingController.disconnectBaileys);
router.post("/official/test", MarketingController.testOfficialApi);

// ── Single Direct / Test Message ─────────────────────────────────────────────
router.post("/send-test", MarketingController.sendTestMessage);

// ── Excel / CSV Import & Sample ──────────────────────────────────────────────
router.post(
  "/upload-excel",
  memoryUpload.single("file"),
  MarketingController.parseExcelUpload
);
router.get("/sample-excel", MarketingController.downloadSampleExcel);

// ── Delivery Logs ────────────────────────────────────────────────────────────
router.get("/logs", MarketingController.getLogs);

export const MarketingRoutes = router;
export const WhatsAppRoutes = router;
