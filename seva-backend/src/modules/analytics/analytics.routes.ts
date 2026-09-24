import express from "express";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

// Public endpoint for frontend / website to record engagement views
router.post("/view", AnalyticsController.recordView);

export const AnalyticsRoutes = router;
