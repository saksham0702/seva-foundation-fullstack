import { Router } from "express";
import { SignatureController } from "./signature.controller";
import { uploadSignatureImage } from "../../middlewares/upload";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = Router();

// Signatures are used for certificate stamping — gated under "certificates" permission
const guard = [authMiddleware, permissionMiddleware("certificates")];

router.post("/", ...guard, uploadSignatureImage.single("image"), SignatureController.uploadSignature);
router.get("/active", ...guard, SignatureController.getActiveSignatures);
router.get("/", ...guard, SignatureController.getAllSignatures);
router.delete("/:id", ...guard, SignatureController.deleteSignature);

export const SignatureRoutes = router;