import Joi from "joi";
import MoneyUtility from "../utilities/money.utility";

export const amountValidation = Joi.number()
  .positive()
  .max(10000000)
  .custom((value, helpers) => {
    if (!MoneyUtility.hasValidPrecision(value)) {
      return helpers.error("number.precision", { limit: 2 });
    }
    return value;
  });

export const referenceIdValidation = Joi.string()
  .trim()
  .min(6)
  .max(64)
  .pattern(/^[A-Za-z0-9_-]+$/)
  .messages({
    "string.pattern.base":
      '"referenceId" may only contain letters, numbers, "-" and "_"',
  });

export const paginationValidation = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};
