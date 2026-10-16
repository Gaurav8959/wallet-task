import express from "express";
import { createValidator } from "express-joi-validation";
import userController from "../../controllers/user.controller";
import { asyncHandler } from "../../middlewares/async-handler.middleware";
import {
  loginSchema,
  registerSchema,
} from "../../validations/schemas/user.schema";

const validator = createValidator({ passError: true });
const router = express.Router();

router.post(
  "/register",
  validator.body(registerSchema),
  asyncHandler(userController.register)
);

router.post(
  "/login",
  validator.body(loginSchema),
  asyncHandler(userController.login)
);

router.get("/me", asyncHandler(userController.me));

export default router;
