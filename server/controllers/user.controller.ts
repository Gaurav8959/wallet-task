import httpStatusCodes from "http-status-codes";
import constants from "../constants";
import IController from "../interfaces/IController";
import userService from "../services/usermgmt/user.service";
import ApiResponse from "../utilities/api-response.utility";
import Encryption from "../utilities/encryption.utility";

export const generateUserCookie = (userId: number) => {
  return {
    key: constants.COOKIE.COOKIE_USER,
    value: Encryption.generateJWTToken(
      constants.COOKIE.KEY_USER_ID,
      userId.toString()
    ),
  };
};

const register: IController = async (req, res) => {
  const user = await userService.register(req.body);
  return ApiResponse.result(
    res,
    user,
    httpStatusCodes.CREATED,
    generateUserCookie(user.id)
  );
};

const login: IController = async (req, res) => {
  const user = await userService.login(req.body);
  return ApiResponse.result(
    res,
    user,
    httpStatusCodes.OK,
    generateUserCookie(user.id)
  );
};

const me: IController = async (req, res) => {
  return ApiResponse.result(res, req.user, httpStatusCodes.OK);
};

export default {
  register,
  login,
  me,
};
