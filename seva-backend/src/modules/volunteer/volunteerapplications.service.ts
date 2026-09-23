import {
  IVolunteerApplication,
  VolunteerApplicationModel,
  ApplicationStatus,
} from "./volunteerapplications.model";
import { MailerService } from "../mail/mailer.service";

/**
 * Public submission — called from the "Get Involved" / Corporate / Careers page form.
 */
const createVolunteerApplication = async (
  payload: Partial<IVolunteerApplication>
): Promise<IVolunteerApplication> => {
  const result = await VolunteerApplicationModel.create(payload);

  // Fire-and-forget confirmation email
  if (result.email) {
    MailerService.sendTemplatedMail({
      to: result.email,
      templateKey: "VOLUNTEER_APPLICATION_RECEIVED",
      variables: {
        name: result.name || "Applicant",
        availability: result.availability || "Not specified",
        category: String((result.category as any)?.title || "General"),
      },
      relatedToModel: "VolunteerApplication",
      relatedToId: String(result._id),
    });
  }

  return result;
};

const getAllVolunteerApplications = async (filters: {
  status?: ApplicationStatus;
  category?: string;
  formType?: string;
}): Promise<IVolunteerApplication[]> => {
  const query: Record<string, unknown> = { isDeleted: false };
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.formType) query.formType = filters.formType;

  const result = await VolunteerApplicationModel.find(query)
    .populate("category", "title color icon slug formType")
    .sort({ createdAt: -1 });
  return result;
};

const getVolunteerApplicationById = async (
  id: string
): Promise<IVolunteerApplication | null> => {
  const result = await VolunteerApplicationModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("category", "title color icon slug formType");
  return result;
};

const updateVolunteerApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
  reviewedBy?: string
): Promise<IVolunteerApplication | null> => {
  const result = await VolunteerApplicationModel.findByIdAndUpdate(
    id,
    { status, reviewedBy },
    { new: true }
  );
  return result;
};

const deleteVolunteerApplication = async (
  id: string
): Promise<IVolunteerApplication | null> => {
  const result = await VolunteerApplicationModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

export const VolunteerApplicationService = {
  createVolunteerApplication,
  getAllVolunteerApplications,
  getVolunteerApplicationById,
  updateVolunteerApplicationStatus,
  deleteVolunteerApplication,
};