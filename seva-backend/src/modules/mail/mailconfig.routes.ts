import express from "express";
import { MailConfigController } from "./mailconfig.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("mail-config")];

router.get("/", ...guard, MailConfigController.getAllMailConfigs);
router.get("/:id", ...guard, MailConfigController.getMailConfigById);
router.post("/", ...guard, MailConfigController.createMailConfig);
router.patch("/:id", ...guard, MailConfigController.updateMailConfig);
router.patch("/:id/activate", ...guard, MailConfigController.setActiveMailConfig);
router.post("/:id/test", ...guard, MailConfigController.sendTestMail);
router.delete("/:id", ...guard, MailConfigController.deleteMailConfig);

export const MailConfigRoutes = router;