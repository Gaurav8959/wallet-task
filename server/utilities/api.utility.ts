import { Request } from "express";
import { User } from "../entities/usermgmt/user.entity";
import { IPagination } from "../interfaces/common.interface";

export default class ApiUtility {
  static getAuthorizationToken(req: Request) {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      return authorization.split(" ")[1];
    }
    return null;
  }

  static sanitizeUser(user: User) {
    const { password, ...basicUser } = user;
    return basicUser;
  }

  static getOffset(limit: number, page: number) {
    return limit * page - limit;
  }

  static getPagination(total: number, limit: number, currentPage: number) {
    const pagination: IPagination = {
      currentPage,
      totalPages: Math.ceil(total / limit),
      previousPage: currentPage <= 1 ? null : currentPage - 1,
      nextPage: total - currentPage * limit > 0 ? currentPage + 1 : null,
      totalItems: total,
    };
    return { pagination };
  }
}
