import Joi from "joi";
import { TCurrency, TTransactionFilterType } from "../../types/wallet.type";
import {
  amountValidation,
  paginationValidation,
  referenceIdValidation,
} from "../comman.validation";

export const createWalletSchema = Joi.object({
  currency: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.values(TCurrency))
    .default(TCurrency.INR),
});

export const depositSchema = Joi.object({
  amount: amountValidation.required(),
  referenceId: referenceIdValidation.required(),
  description: Joi.string().trim().max(255).allow(""),
});

export const transferSchema = Joi.object({
  toUserId: Joi.number().integer().positive().required(),
  amount: amountValidation.required(),
  referenceId: referenceIdValidation.required(),
  description: Joi.string().trim().max(255).allow(""),
});

export const transactionListSchema = Joi.object({
  ...paginationValidation,
  type: Joi.string()
    .uppercase()
    .valid(...Object.values(TTransactionFilterType)),
  fromDate: Joi.date().iso(),
  toDate: Joi.date()
    .iso()
    .when("fromDate", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("fromDate")),
    })
    .messages({ "date.min": '"toDate" must be on or after "fromDate"' }),
});
