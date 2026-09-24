import express from "express";
import { CategoryRoutes } from "../modules/campaignCategory/campaignCategory.routes";
import { ProductRoutes } from "../modules/campaignProduct/campaignProduct.routes";
import { CampaignRoutes } from "../modules/campaigns/campaigns.routes";
import { BlogRoutes } from "../modules/blogs/blogs.routes";
import { CmsRoutes } from "../modules/cms/cms.routes";
import { DepartmentRoutes } from "../modules/departments/departments.routes";
import { DonorRoutes } from "../modules/donors/donors.routes";
import { DonationRoutes } from "../modules/payments/payments.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CertificateRoutes } from "../modules/certificates/certificate.routes";
import { SignatureRoutes } from "../modules/signatures/signatures.route";
import { UploadRoutes } from "../modules/upload/upload.routes";
import { VolunteerCategoryRoutes } from "../modules/volunteer/volunteercategories.routes";
import { VolunteerApplicationRoutes } from "../modules/volunteer/volunteerapplications.routes";
import { GalleryRoutes } from "../modules/gallery/gallery.routes";
import { LeadRoutes } from "../modules/leads/leads.routes";
import { MailConfigRoutes } from "../modules/mail/mailconfig.routes";
import { MailTemplateRoutes } from "../modules/mail/mailtemplates.routes";
import { MailLogRoutes } from "../modules/mail/maillogs.routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/campaigns",
    route: CampaignRoutes,
  },
  {
    path: "/blogs",
    route: BlogRoutes,
  },
  {
    path: "/cms",
    route: CmsRoutes,
  },
  {
    path: "/departments",
    route: DepartmentRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/donors",
    route: DonorRoutes,
  },
  {
    path: "/donations",
    route: DonationRoutes,
  },
  {
    path: "/certificates",
    route: CertificateRoutes,
  },
  {
    path: "/signatures",
    route: SignatureRoutes,
  },
  {
    path: "/upload",
    route: UploadRoutes,
  },
  {
    path: "/volunteer-categories",
    route: VolunteerCategoryRoutes,
  },
  {
    path: "/volunteer-applications",
    route: VolunteerApplicationRoutes,
  },
  {
    path: "/volunteers/categories",
    route: VolunteerCategoryRoutes,
  },
  {
    path: "/volunteers/applications",
    route: VolunteerApplicationRoutes,
  },
  {
    path: "/volunteers",
    route: VolunteerApplicationRoutes,
  },
  {
    path: "/gallery",
    route: GalleryRoutes,
  },
  {
    path: "/leads",
    route: LeadRoutes,
  },
  {
    path: "/mail-config",
    route: MailConfigRoutes,
  },
  {
    path: "/mail-templates",
    route: MailTemplateRoutes,
  },
  {
    path: "/mail-logs",
    route: MailLogRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
