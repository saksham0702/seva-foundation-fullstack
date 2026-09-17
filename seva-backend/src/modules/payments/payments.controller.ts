import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { DonationService } from "./payments.service";

const initiatePaymentOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.initiatePaymentOrder(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment order initiated successfully",
    data: result,
  });
});

const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.verifyPayment(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment verified and recorded successfully",
    data: result,
  });
});

const recordFailedPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.recordFailedPayment(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment failure recorded",
    data: result,
  });
});

const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.createDonation(req.body);

  if (!result) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid donor or campaign",
    });
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Donation created successfully",
    data: result,
  });
});

const getAllDonations = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.getAllDonations({
    campaign: req.query.campaign as string,
    status: req.query.status as string,
    search: req.query.search as string,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donations fetched successfully",
    data: result,
  });
});

const getDonationById = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.getDonationById(
    req.params.id as string
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Donation not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donation fetched successfully",
    data: result,
  });
});

const deleteDonation = asyncHandler(async (req: Request, res: Response) => {
  const result = await DonationService.deleteDonation(
    req.params.id as string
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Donation not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donation deleted successfully",
    data: null,
  });
});

export const DonationController = {
  initiatePaymentOrder,
  verifyPayment,
  recordFailedPayment,
  createDonation,
  getAllDonations,
  getDonationById,
  deleteDonation,
};