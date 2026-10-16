import express from "express";
import { createValidator } from "express-joi-validation";
import walletController from "../../controllers/wallet.controller";
import { asyncHandler } from "../../middlewares/async-handler.middleware";
import {
  createWalletSchema,
  depositSchema,
  transactionListSchema,
  transferSchema,
} from "../../validations/schemas/wallet.schema";

const validator = createValidator({ passError: true });
const router = express.Router();

router.post(
  "/",
  validator.body(createWalletSchema),
  asyncHandler(walletController.createWallet)
);

router.post(
  "/deposit",
  validator.body(depositSchema),
  asyncHandler(walletController.deposit)
);

router.post(
  "/transfer",
  validator.body(transferSchema),
  asyncHandler(walletController.transfer)
);

router.get("/balance", asyncHandler(walletController.balance));

router.get(
  "/transactions",
  validator.query(transactionListSchema),
  asyncHandler(walletController.transactions)
);

router.get("/summary", asyncHandler(walletController.summary));

export default router;
