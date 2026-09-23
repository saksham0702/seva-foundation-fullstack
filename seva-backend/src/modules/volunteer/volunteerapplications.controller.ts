import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { VolunteerApplicationService } from "./volunteerapplications.service";
import { sendResponse } from "../../utils/apiResponse";
import { ApplicationStatus } from "./volunteerapplications.model";

/**
 * Public — anyone can submit the volunteer form. No auth guard.
 */
const createVolunteerApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await VolunteerApplicationService.createVolunteerApplication(
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Application received successfully",
      data: result,
    });
  }
);

const getAllVolunteerApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, category, formType } = req.query as {
      status?: ApplicationStatus;
      category?: string;
      formType?: string;
    };
    const result = await VolunteerApplicationService.getAllVolunteerApplications(
      { status, category, formType }
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Applications fetched successfully",
      data: result,
    });
  }
);

const getVolunteerApplicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await VolunteerApplicationService.getVolunteerApplicationById(
      id
    );
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Application not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Application fetched successfully",
      data: result,
    });
  }
);

const updateVolunteerApplicationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: ApplicationStatus };
    // req.user is assumed to be attached by authMiddleware
    const reviewedBy = (req as any).user?._id;

    const result =
      await VolunteerApplicationService.updateVolunteerApplicationStatus(
        id,
        status,
        reviewedBy
      );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Application status updated successfully",
      data: result,
    });
  }
);

const deleteVolunteerApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await VolunteerApplicationService.deleteVolunteerApplication(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Application deleted successfully",
      data: null,
    });
  }
);

export const VolunteerApplicationController = {
  createVolunteerApplication,
  getAllVolunteerApplications,
  getVolunteerApplicationById,
  updateVolunteerApplicationStatus,
  deleteVolunteerApplication,
};