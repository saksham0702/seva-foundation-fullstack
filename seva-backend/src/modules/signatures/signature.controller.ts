import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { SignatureService } from "./signatures.service";
import { SignatureType } from "./signatures.model";

const uploadSignature = asyncHandler(async (req: Request, res: Response) => {
  const file =
    (req.file as Express.Multer.File) ||
    (Array.isArray(req.files) ? (req.files[0] as Express.Multer.File) : undefined);

  if (!file) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Signature image is required",
    });
  }

  const relativePath = file.path.replace(/\\/g, "/").split("uploads/")[1];
  const imageUrl = `/uploads/${relativePath}`;

  const { type, label, signatoryName } = req.body as {
    type: SignatureType;
    label: string;
    signatoryName?: string;
  };

  const result = await SignatureService.uploadSignature({
    type,
    label,
    signatoryName,
    imageUrl,
    createdBy: req.body.createdBy,
    updatedBy: req.body.updatedBy,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Signature uploaded successfully",
    data: result,
  });
});

const getActiveSignatures = asyncHandler(async (req: Request, res: Response) => {
  const result = await SignatureService.getActiveSignatures();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Active signatures fetched successfully",
    data: result,
  });
});

const getAllSignatures = asyncHandler(async (req: Request, res: Response) => {
  const result = await SignatureService.getAllSignatures(req.query.type as SignatureType | undefined);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Signatures fetched successfully",
    data: result,
  });
});

const deleteSignature = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await SignatureService.deleteSignature(id);
  if (!result) {
    return sendResponse(res, { statusCode: 404, success: false, message: "Signature not found" });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Signature deleted successfully",
    data: null,
  });
});

export const SignatureController = {
  uploadSignature,
  getActiveSignatures,
  getAllSignatures,
  deleteSignature,
};