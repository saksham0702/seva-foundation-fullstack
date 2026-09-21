import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { GalleryService } from "./gallery.service";
import { sendResponse } from "../../utils/apiResponse";
import { filePathToUrl } from "../../middlewares/upload";
import { AuthRequest } from "../../middlewares/auth/auth.middleware";

const uploadGalleryImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    let imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      imageUrls = files.map((file) => filePathToUrl(file.path));
    } else if (req.file) {
      imageUrls = [filePathToUrl(req.file.path)];
    } else if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
      } else if (typeof req.body.images === "string") {
        try {
          const parsed = JSON.parse(req.body.images);
          imageUrls = Array.isArray(parsed) ? parsed : [req.body.images];
        } catch {
          imageUrls = [req.body.images];
        }
      }
    } else if (req.body.imageUrl) {
      imageUrls = [req.body.imageUrl];
    }

    if (!imageUrls || imageUrls.length === 0) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "No image file or URL provided",
      });
    }

    const { title, caption, category, alt } = req.body;
    const userId = req.user?.userId;

    const items = imageUrls.map((imageUrl) => ({
      imageUrl,
      title: title || "",
      caption: caption || "",
      alt: alt || title || caption || "",
      category: category || "general",
      createdBy: userId,
    }));

    const result = await GalleryService.createGalleryImages(items);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `${result.length} image(s) uploaded successfully to gallery`,
      data: result,
    });
  }
);

const getPublicGallery = asyncHandler(async (req: Request, res: Response) => {
  const result = await GalleryService.getPublicGallery(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      result.images.length > 0
        ? "Gallery images fetched successfully"
        : "No images found in gallery",
    data: result.images,
    meta: result.meta,
  });
});

const getAllGalleryAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await GalleryService.getAllGalleryAdmin(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin gallery images fetched successfully",
      data: result.images,
      meta: result.meta,
    });
  }
);

const getGalleryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await GalleryService.getGalleryById(id);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Gallery image not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gallery image fetched successfully",
    data: result,
  });
});

const toggleGalleryStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body;
    const userId = req.user?.userId;

    const result = await GalleryService.toggleGalleryStatus(
      id,
      isActive,
      userId
    );

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Gallery image not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Image status updated to ${result.isActive ? "active" : "inactive"}`,
      data: result,
    });
  }
);

const deleteGalleryImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;

    const result = await GalleryService.deleteGalleryImage(id, userId);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Gallery image not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Gallery image deleted successfully",
      data: result,
    });
  }
);

const updateGalleryItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { title, alt, caption, category } = req.body;
    const userId = req.user?.userId;

    const result = await GalleryService.updateGalleryItem(
      id,
      { title, alt, caption, category },
      userId
    );

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Gallery image not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Gallery image details updated successfully",
      data: result,
    });
  }
);

export const GalleryController = {
  uploadGalleryImages,
  getPublicGallery,
  getAllGalleryAdmin,
  getGalleryById,
  toggleGalleryStatus,
  updateGalleryItem,
  deleteGalleryImage,
};

