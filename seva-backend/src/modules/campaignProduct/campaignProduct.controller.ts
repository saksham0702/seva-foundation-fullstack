import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProductService } from "./campaignProduct.service";
import { sendResponse } from "../../utils/apiResponse";

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  if (req.file) {
    const relativePath = req.file.path
      .replace(/\\/g, "/")
      .split("uploads/")[1];
    req.body.image = `/uploads/${relativePath}`;
  }
  const result = await ProductService.createProduct(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products fetched successfully",
    data: result,
  });
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ProductService.getProductById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Product not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product fetched successfully",
    data: result,
  });
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (req.file) {
    const relativePath = req.file.path
      .replace(/\\/g, "/")
      .split("uploads/")[1];
    req.body.image = `/uploads/${relativePath}`;
  }
  const result = await ProductService.updateProduct(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await ProductService.deleteProduct(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: null,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
