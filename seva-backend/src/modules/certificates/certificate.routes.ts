import { Router } from "express";
import { CertificateController } from "./certificates.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = Router();

const guard = [authMiddleware, permissionMiddleware("certificates")];

// Public — certificate verification (no auth needed for donors checking their cert)
router.get("/verify/:certificateNo", CertificateController.verifyCertificate);

// Protected routes — require certificates permission
router.get("/stats", ...guard, CertificateController.getCertificateStats);
router.get("/by-donor/:donorId", ...guard, CertificateController.getCertificateByDonor);
router.post("/from-donor/:donorId", ...guard, CertificateController.generateCertificateForDonor);

router.post("/", ...guard, CertificateController.createCertificate);
router.get("/", ...guard, CertificateController.getAllCertificates);
router.get("/:id", ...guard, CertificateController.getCertificateById);
router.patch("/:id", ...guard, CertificateController.updateCertificate);
router.patch("/:id/revoke", ...guard, CertificateController.revokeCertificate);
router.patch("/:id/reactivate", ...guard, CertificateController.reactivateCertificate);
router.delete("/:id", ...guard, CertificateController.deleteCertificate);
router.post("/:id/generate-pdf", ...guard, CertificateController.generatePdf);

export const CertificateRoutes = router;