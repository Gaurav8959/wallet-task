import express from "express";
import httpStatusCodes from "http-status-codes";
import constants from "../constants";
import IRequest from "../interfaces/IRequest";
import userService from "../services/usermgmt/user.service";
import ApiResponse from "../utilities/api-response.utility";
import ApiUtility from "../utilities/api.utility";
import Encryption from "../utilities/encryption.utility";

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (constants.APPLICATION.authorizationIgnorePath.includes(req.path)) {
    return next();
  }

  try {
    const authorizationToken = ApiUtility.getAuthorizationToken(req);
    if (!authorizationToken) {
      return ApiResponse.error(
        res,
        httpStatusCodes.UNAUTHORIZED,
        "Authorization token is missing"
      );
    }

    const decoded = await Encryption.verifyJWTToken(authorizationToken);
    if (!decoded) {
      return ApiResponse.error(
        res,
        httpStatusCodes.UNAUTHORIZED,
        "Invalid or expired token"
      );
    }

    const user = await userService.getById(
      Number(decoded.data[constants.COOKIE.KEY_USER_ID])
    );
    if (!user) {
      return ApiResponse.error(
        res,
        httpStatusCodes.UNAUTHORIZED,
        "User not found for this token"
      );
    }

    (req as IRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
