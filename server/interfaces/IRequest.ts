import { Request } from "express";
import { User } from "../entities/usermgmt/user.entity";

export default interface IRequest extends Request {
  user: User;
}
