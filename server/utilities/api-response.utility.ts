import { Response } from "express";
import httpStatusCodes from "http-status-codes";
import { ICookie, IPagination } from "../interfaces/common.interface";

export default class ApiResponse {
  static result = (
    res: Response,
    data: any,
    status: number = httpStatusCodes.OK,
    cookie: ICookie | null = null,
    pagination: IPagination | null = null
  ) => {
    let responseData: any = {
      data,
      success: true,
      ...(cookie && { token: cookie.value }),
    };

    if (pagination) {
      responseData = { ...responseData, pagination };
    }

    res.status(status).json(responseData);
  };

  static error = (
    res: Response,
    status: number = httpStatusCodes.BAD_REQUEST,
    error: string = httpStatusCodes.getStatusText(status)
  ) => {
    res.status(status).json({
      error: {
        message: error,
      },
      success: false,
    });
  };
}
