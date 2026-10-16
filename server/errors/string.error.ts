import httpStatusCodes from "http-status-codes";

export class StringError extends Error {
  status: number;

  constructor(message: string, status: number = httpStatusCodes.BAD_REQUEST) {
    super(message);
    this.name = "StringError";
    this.status = status;
  }
}
