import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CategoryService } from "./campaignCategory.service";
import { sendResponse } from "../../utils/apiResponse";

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CategoryService.getCategoryById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Category not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CategoryService.updateCategory(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await CategoryService.deleteCategory(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
