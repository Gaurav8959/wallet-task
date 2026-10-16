import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import constants from "../constants";

export default class Encryption {
  static async generateHash(password: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateJWTToken(key: string, value: string): string {
    const data: { [key: string]: string } = {};
    data[key] = value;
    return jwt.sign({ data }, constants.APPLICATION.env.authSecret, {
      expiresIn: constants.APPLICATION.timers.jwtTokenExpiration,
    });
  }

  static verifyJWTToken(token: string): Promise<any> {
    return new Promise((resolve) => {
      jwt.verify(token, constants.APPLICATION.env.authSecret, (err, decoded) => {
        if (err) {
          resolve(null);
        } else {
          resolve(decoded);
        }
      });
    });
  }
}
