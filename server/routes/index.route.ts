import express from "express";
import authRouter from "./auth/auth.route";
import defaultRouter from "./default/default.route";
import walletRouter from "./wallet/wallet.route";

const router = express.Router();

router.use("/", defaultRouter);
router.use("/auth", authRouter);
router.use("/wallet", walletRouter);

export default router;
