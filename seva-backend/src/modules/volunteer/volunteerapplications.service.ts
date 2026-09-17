import {
  IVolunteerApplication,
  VolunteerApplicationModel,
  ApplicationStatus,
} from "./volunteerapplications.model";

/**
 * Public submission — called from the "Get Involved" page form.
 */
const createVolunteerApplication = async (
  payload: Partial<IVolunteerApplication>
): Promise<IVolunteerApplication> => {
  const result = await VolunteerApplicationModel.create(payload);
  return result;
};

const getAllVolunteerApplications = async (filters: {
  status?: ApplicationStatus;
  category?: string;
}): Promise<IVolunteerApplication[]> => {
  const query: Record<string, unknown> = { isDeleted: false };
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;

  const result = await VolunteerApplicationModel.find(query)
    .populate("category", "title color icon")
    .sort({ createdAt: -1 });
  return result;
};

const getVolunteerApplicationById = async (
  id: string
): Promise<IVolunteerApplication | null> => {
  const result = await VolunteerApplicationModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("category", "title color icon");
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