import express from "express";
import { MailTemplateController } from "./mailtemplates.controller";
import { uploadMailTemplateImage } from "../../middlewares/upload";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("marketing")];

router.get("/", authMiddleware, MailTemplateController.getAllMailTemplates);
router.get("/:id", authMiddleware, MailTemplateController.getMailTemplateById);
router.post(
  "/",
  ...guard,
  uploadMailTemplateImage.array("images", 10),
  MailTemplateController.createMailTemplate
);
router.patch(
  "/:id",
  ...guard,
  uploadMailTemplateImage.array("images", 10),
  MailTemplateController.updateMailTemplate
);
router.put(
  "/:id",
  ...guard,
  uploadMailTemplateImage.array("images", 10),
  MailTemplateController.updateMailTemplate
);
router.post("/:id/preview", ...guard, MailTemplateController.previewMailTemplate);
router.delete("/:id", ...guard, MailTemplateController.deleteMailTemplate);

export const MailTemplateRoutes = router;