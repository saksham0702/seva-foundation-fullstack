import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  data: {
    statusCode: number;
    success: boolean;
    message?: string;
    meta?: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data?: T;
  }
) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message || "Success",
    meta: data.meta,
    data: data.data,
  });
};
