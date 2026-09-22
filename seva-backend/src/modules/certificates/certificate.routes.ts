import { Router } from "express";
import { CertificateController } from "./certificates.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = Router();

const guard = [authMiddleware, permissionMiddleware("certificates")];

// Public — certificate verification & donor certificate access
router.get("/verify/:certificateNo", CertificateController.verifyCertificate);
router.get("/by-donor/:donorId", CertificateController.getCertificateByDonor);
router.post("/from-donor/:donorId", CertificateController.generateCertificateForDonor);
router.post("/:id/generate-pdf", CertificateController.generatePdf);

// Protected administrative routes — require certificates permission
router.get("/stats", ...guard, CertificateController.getCertificateStats);
router.post("/", ...guard, CertificateController.createCertificate);
router.get("/", ...guard, CertificateController.getAllCertificates);
router.get("/:id", ...guard, CertificateController.getCertificateById);
router.patch("/:id", ...guard, CertificateController.updateCertificate);
router.patch("/:id/revoke", ...guard, CertificateController.revokeCertificate);
router.patch("/:id/reactivate", ...guard, CertificateController.reactivateCertificate);
router.delete("/:id", ...guard, CertificateController.deleteCertificate);

export const CertificateRoutes = router;