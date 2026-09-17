import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { filePathToUrl } from "../../middlewares/upload";

export const uploadEditorImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "No image file provided",
      });
    }

    const url = filePathToUrl(req.file.path);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Image uploaded successfully",
      data: { url },
    });
  }
);