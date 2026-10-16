import httpStatusCodes from "http-status-codes";
import { UserRepository } from "../../data-source/repository";
import { StringError } from "../../errors/string.error";
import { ILoginUser, IRegisterUser } from "../../interfaces/user.interface";
import ApiUtility from "../../utilities/api.utility";
import { isDuplicateEntryError } from "../../utilities/common.utility";
import Encryption from "../../utilities/encryption.utility";

const register = async (params: IRegisterUser) => {
  const user = UserRepository.create({
    name: params.name,
    email: params.email,
    password: await Encryption.generateHash(params.password, 10),
  });

  try {
    await UserRepository.save(user);
  } catch (e) {
    if (isDuplicateEntryError(e)) {
      throw new StringError("Email already exists", httpStatusCodes.CONFLICT);
    }
    throw e;
  }

  return ApiUtility.sanitizeUser(user);
};

const login = async (params: ILoginUser) => {
  const user = await UserRepository.createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email: params.email })
    .getOne();

  if (!user || !(await Encryption.verifyHash(params.password, user.password))) {
    throw new StringError(
      "Invalid email or password",
      httpStatusCodes.UNAUTHORIZED
    );
  }

  return ApiUtility.sanitizeUser(user);
};

const getById = async (id: number) => {
  if (!id) return null;
  return UserRepository.findOneBy({ id });
};

export default {
  register,
  login,
  getById,
};
