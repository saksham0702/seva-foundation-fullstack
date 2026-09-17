import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { DonorService } from "./donors.service";

const createDonor = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonorService.createDonor(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Donor created successfully",
    data: result,
  });
});

const getAllDonors = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonorService.getAllDonors({
    campaign: req.query.campaign as string,
    status: req.query.status as string,
    search: req.query.search as string,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donors fetched successfully",
    data: result,
  });
});

const getDonorById = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonorService.getDonorById(
    req.params.id as string
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Donor not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donor fetched successfully",
    data: result,
  });
});

const updateDonor = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonorService.updateDonor(
    req.params.id as string,
    req.body
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Donor not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donor updated successfully",
    data: result,
  });
});

const deleteDonor = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonorService.deleteDonor(
    req.params.id as string
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Donor not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donor deleted successfully",
    data: null,
  });
});

export const DonorController = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};