import express from "express";
import { MailLogController } from "./maillogs.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("marketing")];

router.get("/", ...guard, MailLogController.getAllMailLogs);
router.get("/:id", ...guard, MailLogController.getMailLogById);
router.post("/:id/resend", ...guard, MailLogController.resendMailLog);

export const MailLogRoutes = router;