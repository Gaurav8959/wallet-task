import express from "express";
import httpStatusCodes from "http-status-codes";
import { StringError } from "../errors/string.error";
import ApiResponse from "../utilities/api-response.utility";

export interface IError {
  status?: number;
  message?: string;
}

export const notFoundErrorHandler = (
  req: express.Request,
  res: express.Response
) => {
  return ApiResponse.error(
    res,
    httpStatusCodes.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`
  );
};

export const errorHandler = (
  err: IError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof StringError) {
    return ApiResponse.error(res, err.status, err.message);
  }

  if (err.status && err.status < httpStatusCodes.INTERNAL_SERVER_ERROR) {
    return ApiResponse.error(res, err.status, err.message);
  }

  console.error(`[${req.method}] ${req.originalUrl} failed:`, err);
  return ApiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR);
};
