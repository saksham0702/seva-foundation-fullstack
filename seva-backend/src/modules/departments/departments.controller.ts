import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { DepartmentService } from "./departments.service";

const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.userId;
  const result = await DepartmentService.createDepartment({
    ...req.body,
    createdBy: adminId,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Department created successfully",
    data: result,
  });
});

const getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
  const result = await DepartmentService.getAllDepartments();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Departments fetched successfully",
    data: result,
  });
});

const getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const result = await DepartmentService.getDepartmentById(req.params.id as string);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Department not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department fetched successfully",
    data: result,
  });
});

const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.userId;
  const result = await DepartmentService.updateDepartment(
    req.params.id as string,
    {
      ...req.body,
      updatedBy: adminId,
    }
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Department not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department updated successfully",
    data: result,
  });
});

const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const result = await DepartmentService.deleteDepartment(req.params.id as string);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Department not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department deleted successfully",
    data: null,
  });
});

export const DepartmentController = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
